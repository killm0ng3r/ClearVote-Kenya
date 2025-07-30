// backend/src/routes/votes.ts
import express from 'express'
import { prisma } from '../lib/prisma'
import blockchainService from '../services/blockchainService'
import { authenticateToken, requireVoterRole, AuthRequest } from '../middleware/auth'

const router = express.Router()

// POST /api/votes - Cast votes (both database and blockchain)
router.post('/', authenticateToken, requireVoterRole, async (req: AuthRequest, res) => {
  try {
    const votes = req.body // Array of { electionId, candidateId }
    
    if (!Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({ error: 'Invalid votes data' })
    }

    // Get voter ID from authenticated user
    const voterId = req.user!.userId
    
    const results = []
    
    // Get voter's location first
    const voter = await prisma.user.findUnique({
      where: { id: voterId },
      include: {
        county: true,
        constituency: true,
        ward: true
      }
    })
    
    if (!voter) {
      return res.status(400).json({ error: 'Voter not found' })
    }
    
    if (!voter.countyId || !voter.constituencyId || !voter.wardId) {
      return res.status(400).json({ error: 'Voter location not set. Please update your profile.' })
    }
    
    for (const vote of votes) {
      const { electionId, candidateId } = vote
      
      try {
        // Verify candidate exists and get position info with geographical data
        const candidate = await prisma.candidate.findUnique({
          where: { id: candidateId },
          include: {
            position: {
              include: {
                county: true,
                constituency: true,
                ward: true
              }
            }
          }
        })
        
        if (!candidate) {
          return res.status(400).json({
            error: `Candidate ${candidateId} not found`
          })
        }

        // Check geographical eligibility
        const position = candidate.position
        let canVote = false
        
        switch (position.positionType) {
          case 'PRESIDENT':
            // President is available to all voters
            canVote = true
            break
          case 'GOVERNOR':
          case 'SENATOR':
          case 'WOMEN_REP':
            // County-level positions
            canVote = position.countyId === voter.countyId
            break
          case 'MP':
            // Constituency-level position
            canVote = position.constituencyId === voter.constituencyId
            break
          case 'MCA':
            // Ward-level position
            canVote = position.wardId === voter.wardId
            break
          default:
            canVote = false
        }
        
        if (!canVote) {
          return res.status(403).json({
            error: `You are not eligible to vote for ${position.title} (${position.positionType}). This position is not available in your area.`
          })
        }

        // Check if voter has already voted for this position in this election
        const existingVote = await prisma.vote.findFirst({
          where: {
            voterId,
            electionId,
            candidate: {
              positionId: candidate.positionId
            }
          }
        })
        
        if (existingVote) {
          return res.status(400).json({
            error: `Already voted for ${candidate.position?.title} position in this election`
          })
        }

        // Cast vote on blockchain first
        let transactionHash = null
        try {
          if (await blockchainService.isConnected()) {
            // Create unique blockchain election ID by combining electionId with position
            // This allows multiple votes per election for different positions
            const blockchainElectionId = `${electionId}-${candidate.positionId}`
            transactionHash = await blockchainService.castVote(blockchainElectionId, candidateId, voterId)
            console.log('Vote cast on blockchain:', transactionHash)
          } else {
            console.warn('Blockchain not connected, storing vote in database only')
          }
        } catch (blockchainError) {
          console.error('Blockchain vote failed:', blockchainError)
          // Continue with database storage even if blockchain fails
        }

        // Store vote in database
        const dbVote = await prisma.vote.create({
          data: {
            voterId,
            candidateId,
            electionId
          }
        })

        results.push({
          voteId: dbVote.id,
          electionId,
          candidateId,
          transactionHash,
          timestamp: dbVote.timestamp
        })

      } catch (error) {
        console.error('Error processing vote:', error)
        return res.status(500).json({ 
          error: `Failed to process vote for candidate ${candidateId}` 
        })
      }
    }

    res.status(201).json({
      message: 'Votes cast successfully',
      votes: results
    })

  } catch (error) {
    console.error('Error casting votes:', error)
    res.status(500).json({ error: 'Failed to cast votes' })
  }
})

// GET /api/votes/election/:electionId/tally - Get vote tally for an election organized by ballot structure
router.get('/election/:electionId/tally', async (req, res) => {
  try {
    const { electionId } = req.params
    
    let tally = []
    
    try {
      // Try to get tally from blockchain first
      if (await blockchainService.isConnected()) {
        tally = await blockchainService.getElectionTally(electionId)
        console.log('Tally retrieved from blockchain')
      } else {
        throw new Error('Blockchain not connected')
      }
    } catch (blockchainError) {
      console.warn('Failed to get blockchain tally, falling back to database:', blockchainError)
      
      // Fallback to database tally
      const dbTally = await prisma.vote.groupBy({
        by: ['candidateId'],
        where: { electionId },
        _count: {
          candidateId: true
        }
      })
      
      tally = dbTally.map(item => ({
        candidateId: item.candidateId,
        voteCount: item._count.candidateId
      }))
    }

    // Get candidate details with position and geographical info
    const candidateIds = tally.map(t => t.candidateId)
    const candidates = await prisma.candidate.findMany({
      where: {
        id: { in: candidateIds }
      },
      include: {
        position: {
          include: {
            county: true,
            constituency: true,
            ward: true
          }
        }
      }
    })

    // Organize tally by ballot structure
    const ballotTally = {
      ballot1: { title: 'Presidential Election', positions: [] as any[] },
      ballot2: { title: 'Member of Parliament (MP)', positions: [] as any[] },
      ballot3: { title: 'Senator', positions: [] as any[] },
      ballot4: { title: 'Woman Representative', positions: [] as any[] },
      ballot5: { title: 'Governor', positions: [] as any[] },
      ballot6: { title: 'Member of County Assembly (MCA)', positions: [] as any[] }
    }

    // Group candidates by position
    const positionGroups = new Map()
    
    candidates.forEach(candidate => {
      const positionId = candidate.position.id
      if (!positionGroups.has(positionId)) {
        positionGroups.set(positionId, {
          position: candidate.position,
          candidates: []
        })
      }
      
      const candidateTally = tally.find(t => t.candidateId === candidate.id)
      positionGroups.get(positionId).candidates.push({
        candidateId: candidate.id,
        candidateName: candidate.name,
        party: candidate.party || '',
        voteCount: candidateTally?.voteCount || 0
      })
    })

    // Organize by ballot type
    positionGroups.forEach((group, positionId) => {
      const position = group.position
      const positionData = {
        positionId: position.id,
        title: position.title,
        positionType: position.positionType,
        location: {
          county: position.county?.name,
          constituency: position.constituency?.name,
          ward: position.ward?.name
        },
        candidates: group.candidates.sort((a: any, b: any) => b.voteCount - a.voteCount), // Sort by vote count
        totalVotes: group.candidates.reduce((sum: number, c: any) => sum + c.voteCount, 0)
      }

      switch (position.positionType) {
        case 'PRESIDENT':
          ballotTally.ballot1.positions.push(positionData)
          break
        case 'MP':
          ballotTally.ballot2.positions.push(positionData)
          break
        case 'SENATOR':
          ballotTally.ballot3.positions.push(positionData)
          break
        case 'WOMEN_REP':
          ballotTally.ballot4.positions.push(positionData)
          break
        case 'GOVERNOR':
          ballotTally.ballot5.positions.push(positionData)
          break
        case 'MCA':
          ballotTally.ballot6.positions.push(positionData)
          break
      }
    })

    // Create organized ballot array
    const organizedBallots = [
      { ballotNumber: 1, ...ballotTally.ballot1 },
      { ballotNumber: 2, ...ballotTally.ballot2 },
      { ballotNumber: 3, ...ballotTally.ballot3 },
      { ballotNumber: 4, ...ballotTally.ballot4 },
      { ballotNumber: 5, ...ballotTally.ballot5 },
      { ballotNumber: 6, ...ballotTally.ballot6 }
    ].filter(ballot => ballot.positions.length > 0)

    const totalVotes = tally.reduce((sum, t) => sum + t.voteCount, 0)

    res.json({
      electionId,
      ballots: organizedBallots,
      totalVotes,
      source: await blockchainService.isConnected() ? 'blockchain' : 'database'
    })

  } catch (error) {
    console.error('Error getting vote tally:', error)
    res.status(500).json({ error: 'Failed to get vote tally' })
  }
})

// GET /api/votes/blockchain/status - Get blockchain connection status
router.get('/blockchain/status', async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo()
    res.json(networkInfo)
  } catch (error) {
    console.error('Error getting blockchain status:', error)
    res.status(500).json({ error: 'Failed to get blockchain status' })
  }
})

// POST /api/votes/blockchain/setup - Set contract address
router.post('/blockchain/setup', async (req, res) => {
  try {
    const { contractAddress } = req.body
    
    if (!contractAddress) {
      return res.status(400).json({ error: 'Contract address is required' })
    }

    blockchainService.setContractAddress(contractAddress)
    
    const networkInfo = await blockchainService.getNetworkInfo()
    
    res.json({
      message: 'Contract address set successfully',
      networkInfo
    })
  } catch (error) {
    console.error('Error setting up blockchain:', error)
    res.status(500).json({ error: 'Failed to setup blockchain' })
  }
})

export default router