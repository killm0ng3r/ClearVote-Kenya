// backend/src/utils/blockchainSetup.ts
import fs from 'fs'
import path from 'path'
import blockchainService from '../services/blockchainService'

interface ContractInfo {
  address: string
  transactionHash: string
  blockNumber: number
}

// Deploy the VoteLedger contract
export async function deployContract(): Promise<ContractInfo | null> {
  try {
    // Check if blockchain is connected
    const isConnected = await blockchainService.isConnected()
    if (!isConnected) {
      console.error('❌ Blockchain not connected. Please start Ganache GUI.')
      return null
    }

    console.log('🚀 Deploying VoteLedger contract...')
    
    // Read the contract build file
    const contractPath = path.join(__dirname, '../../../blockchain/build/contracts/VoteLedger.json')
    
    if (!fs.existsSync(contractPath)) {
      console.error('❌ Contract build file not found. Please compile contracts first.')
      console.log('Run: cd blockchain && npx truffle compile')
      return null
    }

    const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'))
    const { abi, bytecode } = contractData

    // Get Web3 instance from blockchain service
    const web3 = (blockchainService as any).web3
    const accounts = await web3.eth.getAccounts()
    
    if (accounts.length === 0) {
      console.error('❌ No accounts available for deployment')
      return null
    }

    const deployAccount = accounts[0]
    console.log('📝 Deploying from account:', deployAccount)

    // Create contract instance
    const contract = new web3.eth.Contract(abi)

    // Deploy contract
    const deployedContract = await contract.deploy({
      data: bytecode
    }).send({
      from: deployAccount,
      gas: '1000000'
    })

    const contractInfo: ContractInfo = {
      address: deployedContract.options.address,
      transactionHash: deployedContract.transactionHash,
      blockNumber: deployedContract.blockNumber
    }

    console.log('✅ Contract deployed successfully!')
    console.log('📍 Contract Address:', contractInfo.address)
    console.log('🔗 Transaction Hash:', contractInfo.transactionHash)
    console.log('📦 Block Number:', contractInfo.blockNumber)

    // Update blockchain service with contract address
    blockchainService.setContractAddress(contractInfo.address)

    // Update .env file
    updateEnvFile(contractInfo.address)

    return contractInfo

  } catch (error) {
    console.error('❌ Contract deployment failed:', error)
    return null
  }
}

// Update .env file with contract address
function updateEnvFile(contractAddress: string) {
  try {
    const envPath = path.join(__dirname, '../../.env')
    let envContent = fs.readFileSync(envPath, 'utf8')
    
    // Update or add contract address
    if (envContent.includes('VOTE_LEDGER_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /VOTE_LEDGER_CONTRACT_ADDRESS=.*/,
        `VOTE_LEDGER_CONTRACT_ADDRESS="${contractAddress}"`
      )
    } else {
      envContent += `\nVOTE_LEDGER_CONTRACT_ADDRESS="${contractAddress}"`
    }

    fs.writeFileSync(envPath, envContent)
    console.log('✅ Updated .env file with contract address')
  } catch (error) {
    console.error('⚠️  Failed to update .env file:', error)
  }
}

// Check blockchain setup status
export async function checkSetup(): Promise<void> {
  console.log('🔍 Checking blockchain setup...')
  
  try {
    const networkInfo = await blockchainService.getNetworkInfo()
    
    console.log('📊 Network Info:')
    console.log('  - Connected:', networkInfo.isConnected ? '✅' : '❌')
    console.log('  - Network ID:', networkInfo.networkId || 'N/A')
    console.log('  - Block Number:', networkInfo.blockNumber || 'N/A')
    console.log('  - Accounts:', networkInfo.accountsCount)
    console.log('  - Contract Address:', networkInfo.contractAddress || 'Not Set')

    if (!networkInfo.isConnected) {
      console.log('\n📋 To fix connection issues:')
      console.log('1. Start Ganache GUI')
      console.log('2. Ensure server is running on 127.0.0.1:7545')
      console.log('3. Network ID should be 5777')
    }

    if (!networkInfo.contractAddress) {
      console.log('\n📋 To deploy contract:')
      console.log('1. Run: npm run deploy-contract')
      console.log('2. Or use: npx truffle migrate in blockchain directory')
    }

  } catch (error) {
    console.error('❌ Setup check failed:', error)
  }
}

// Test contract functionality
export async function testContract(): Promise<void> {
  console.log('🧪 Testing contract functionality...')
  
  try {
    const networkInfo = await blockchainService.getNetworkInfo()
    
    if (!networkInfo.isConnected) {
      console.error('❌ Blockchain not connected')
      return
    }

    if (!networkInfo.contractAddress) {
      console.error('❌ Contract not deployed')
      return
    }

    // Test casting a vote
    console.log('📝 Testing vote casting...')
    const testElectionId = 'test-election-' + Date.now()
    const testCandidateId = 'test-candidate-' + Date.now()

    try {
      const txHash = await blockchainService.castVote(testElectionId, testCandidateId)
      console.log('✅ Test vote cast successfully:', txHash)

      // Test getting votes
      console.log('📊 Testing vote retrieval...')
      const votes = await blockchainService.getAllVotes()
      console.log('✅ Retrieved', votes.length, 'votes from blockchain')

      // Test getting tally
      console.log('🔢 Testing vote tally...')
      const tally = await blockchainService.getElectionTally(testElectionId)
      console.log('✅ Tally retrieved:', tally)

    } catch (error) {
      console.error('❌ Contract test failed:', error)
    }

  } catch (error) {
    console.error('❌ Contract test setup failed:', error)
  }
}

// Main setup function
export async function setupBlockchain(): Promise<boolean> {
  console.log('🚀 Starting blockchain setup...\n')
  
  // Check current setup
  await checkSetup()
  
  // Deploy contract if needed
  const networkInfo = await blockchainService.getNetworkInfo()
  if (networkInfo.isConnected && !networkInfo.contractAddress) {
    console.log('\n📦 Deploying contract...')
    const contractInfo = await deployContract()
    if (!contractInfo) {
      console.error('❌ Setup failed: Could not deploy contract')
      return false
    }
  }
  
  // Test contract
  console.log('\n🧪 Testing contract...')
  await testContract()
  
  console.log('\n✅ Blockchain setup complete!')
  return true
}