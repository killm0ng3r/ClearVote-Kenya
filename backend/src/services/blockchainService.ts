// backend/src/services/blockchainService.ts
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'

// VoteLedger contract ABI
const VOTE_LEDGER_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "electionId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "candidateId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "votes",
    "outputs": [
      {
        "internalType": "string",
        "name": "electionId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "candidateId",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "electionId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "candidateId",
        "type": "string"
      }
    ],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllVotes",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "electionId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "candidateId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "voter",
            "type": "address"
          }
        ],
        "internalType": "struct VoteLedger.Vote[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
]

interface BlockchainVote {
  electionId: string
  candidateId: string
  voter: string
}

interface VoteTally {
  candidateId: string
  voteCount: number
}

class BlockchainService {
  private web3: Web3
  private contract: Contract<AbiItem[]> | null = null
  private defaultAccount: string = ''
  private availableAccounts: string[] = []
  private userAccountMapping: Map<string, string> = new Map()

  constructor() {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:7545'
    this.web3 = new Web3(rpcUrl)
    
    // Initialize contract with deployed address
    const contractAddress = process.env.VOTE_LEDGER_CONTRACT_ADDRESS || '0x8b0e83a4378B59b486c86Ac3A952B14062F880F9'
    this.contract = new this.web3.eth.Contract(VOTE_LEDGER_ABI as AbiItem[], contractAddress)
    
    // Set default account for transactions
    this.initializeAccount()
  }

  private async initializeAccount() {
    try {
      const accounts = await this.web3.eth.getAccounts()
      if (accounts.length > 0) {
        this.availableAccounts = accounts
        this.defaultAccount = accounts[0]
        this.web3.eth.defaultAccount = this.defaultAccount
        console.log(`Initialized ${accounts.length} blockchain accounts`)
      }
    } catch (error) {
      console.error('Failed to initialize blockchain account:', error)
    }
  }

  // Get or assign a blockchain address for a user
  getUserBlockchainAddress(userId: string): string {
    // Check if user already has an assigned address
    if (this.userAccountMapping.has(userId)) {
      return this.userAccountMapping.get(userId)!
    }

    // Assign next available account (cycling through available accounts)
    const accountIndex = this.userAccountMapping.size % this.availableAccounts.length
    const assignedAddress = this.availableAccounts[accountIndex]
    
    if (assignedAddress) {
      this.userAccountMapping.set(userId, assignedAddress)
      console.log(`Assigned blockchain address ${assignedAddress} to user ${userId}`)
      return assignedAddress
    }

    // Fallback to default account if no accounts available
    console.warn(`No available accounts, using default for user ${userId}`)
    return this.defaultAccount
  }

  // Set contract address after deployment
  setContractAddress(address: string) {
    this.contract = new this.web3.eth.Contract(VOTE_LEDGER_ABI as AbiItem[], address)
    process.env.VOTE_LEDGER_CONTRACT_ADDRESS = address
  }

  // Check if blockchain connection is available
  async isConnected(): Promise<boolean> {
    try {
      await this.web3.eth.net.isListening()
      return true
    } catch (error) {
      console.error('Blockchain connection failed:', error)
      return false
    }
  }

  // Cast a vote on the blockchain
  async castVote(electionId: string, candidateId: string, userId?: string, voterAddress?: string): Promise<string> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please set contract address.')
      }

      // Determine the blockchain address to use
      let fromAddress: string
      if (voterAddress) {
        fromAddress = voterAddress
      } else if (userId) {
        fromAddress = this.getUserBlockchainAddress(userId)
      } else {
        fromAddress = this.defaultAccount
      }

      if (!fromAddress) {
        throw new Error('No account available for transaction')
      }

      // Check if voter has already voted for this election
      const hasVoted = await this.contract.methods.hasVoted(electionId, fromAddress).call()
      if (hasVoted) {
        throw new Error(`User ${userId || 'unknown'} has already voted for this election`)
      }

      // Cast vote on blockchain
      const result = await this.contract.methods.castVote(electionId, candidateId).send({
        from: fromAddress,
        gas: '300000'
      })

      console.log(`Vote cast successfully for user ${userId || 'unknown'} from address ${fromAddress}:`, result.transactionHash)
      return result.transactionHash
    } catch (error) {
      console.error('Failed to cast vote on blockchain:', error)
      throw error
    }
  }

  // Get all votes from blockchain
  async getAllVotes(): Promise<BlockchainVote[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized')
      }

      const votes = await this.contract.methods.getAllVotes().call()
      const votesArray = Array.isArray(votes) ? votes : []
      return votesArray.map((vote: any) => ({
        electionId: vote.electionId,
        candidateId: vote.candidateId,
        voter: vote.voter
      }))
    } catch (error) {
      console.error('Failed to get votes from blockchain:', error)
      throw error
    }
  }

  // Get vote tally for a specific election
  async getElectionTally(electionId: string): Promise<VoteTally[]> {
    try {
      const allVotes = await this.getAllVotes()
      // Filter votes that start with the electionId (handles both original and position-specific IDs)
      const electionVotes = allVotes.filter(vote =>
        vote.electionId === electionId || vote.electionId.startsWith(`${electionId}-`)
      )
      
      // Count votes per candidate
      const tally: { [candidateId: string]: number } = {}
      electionVotes.forEach(vote => {
        tally[vote.candidateId] = (tally[vote.candidateId] || 0) + 1
      })

      // Convert to array format
      return Object.entries(tally).map(([candidateId, voteCount]) => ({
        candidateId,
        voteCount
      }))
    } catch (error) {
      console.error('Failed to get election tally:', error)
      throw error
    }
  }

  // Check if a voter has voted for a specific election
  async hasVoted(electionId: string, voterAddress: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized')
      }

      return await this.contract.methods.hasVoted(electionId, voterAddress).call()
    } catch (error) {
      console.error('Failed to check voting status:', error)
      throw error
    }
  }

  // Get blockchain network info
  async getNetworkInfo() {
    try {
      const networkId = await this.web3.eth.net.getId()
      const blockNumber = await this.web3.eth.getBlockNumber()
      const accounts = await this.web3.eth.getAccounts()
      
      return {
        networkId: Number(networkId),
        blockNumber: Number(blockNumber),
        accountsCount: accounts.length,
        contractAddress: this.contract?.options.address || null,
        isConnected: await this.isConnected()
      }
    } catch (error) {
      console.error('Failed to get network info:', error)
      return {
        networkId: null,
        blockNumber: null,
        accountsCount: 0,
        contractAddress: null,
        isConnected: false
      }
    }
  }

  // Get anonymized voting statistics for admin dashboard
  async getVotingStatistics(): Promise<{
    totalVotes: number
    totalElections: number
    averageVotesPerElection: number
    lastVoteTimestamp: string
  }> {
    try {
      const allVotes = await this.getAllVotes()
      const uniqueElections = new Set(allVotes.map(vote => vote.electionId.split('-')[0]))
      
      return {
        totalVotes: allVotes.length,
        totalElections: uniqueElections.size,
        averageVotesPerElection: uniqueElections.size > 0 ? Math.round(allVotes.length / uniqueElections.size) : 0,
        lastVoteTimestamp: new Date().toISOString() // In real implementation, get from blockchain events
      }
    } catch (error) {
      console.error('Failed to get voting statistics:', error)
      throw error
    }
  }

  // Get anonymized vote distribution by election
  async getVoteDistribution(): Promise<{
    electionId: string
    totalVotes: number
    candidateDistribution: { candidateId: string; voteCount: number; percentage: number }[]
  }[]> {
    try {
      const allVotes = await this.getAllVotes()
      const electionGroups: { [electionId: string]: BlockchainVote[] } = {}
      
      // Group votes by base election ID (remove position suffix)
      allVotes.forEach(vote => {
        const baseElectionId = vote.electionId.split('-')[0]
        if (!electionGroups[baseElectionId]) {
          electionGroups[baseElectionId] = []
        }
        electionGroups[baseElectionId].push(vote)
      })

      // Calculate distribution for each election
      return Object.entries(electionGroups).map(([electionId, votes]) => {
        const candidateCounts: { [candidateId: string]: number } = {}
        votes.forEach(vote => {
          candidateCounts[vote.candidateId] = (candidateCounts[vote.candidateId] || 0) + 1
        })

        const totalVotes = votes.length
        const candidateDistribution = Object.entries(candidateCounts).map(([candidateId, count]) => ({
          candidateId,
          voteCount: count,
          percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
        }))

        return {
          electionId,
          totalVotes,
          candidateDistribution
        }
      })
    } catch (error) {
      console.error('Failed to get vote distribution:', error)
      throw error
    }
  }

  // Get blockchain audit trail (anonymized)
  async getAuditTrail(): Promise<{
    totalTransactions: number
    contractAddress: string
    networkId: number | null
    lastBlockNumber: number | null
    connectionStatus: boolean
  }> {
    try {
      const networkInfo = await this.getNetworkInfo()
      const allVotes = await this.getAllVotes()

      return {
        totalTransactions: allVotes.length,
        contractAddress: this.contract?.options.address || 'Not set',
        networkId: networkInfo.networkId,
        lastBlockNumber: networkInfo.blockNumber,
        connectionStatus: networkInfo.isConnected
      }
    } catch (error) {
      console.error('Failed to get audit trail:', error)
      throw error
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService()
export default blockchainService