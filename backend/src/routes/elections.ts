// backend/src/routes/elections.ts
import express from 'express'
import { prisma }  from '../lib/prisma'

const router = express.Router()

// GET /api/elections - Fetch all elections
router.get('/', async (req, res) => {
  try {
    const elections = await prisma.election.findMany({
      include: {
        positions: {
          include: {
            candidates: true,
            county: true,
            constituency: true,
            ward: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(elections)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch elections' })
  }
})

// GET /api/elections/:id - Fetch a specific election by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        positions: {
          include: {
            candidates: true,
            county: true,
            constituency: true,
            ward: true
          }
        }
      }
    })

    if (!election) {
      return res.status(404).json({ error: 'Election not found' })
    }

    res.json(election)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch election' })
  }
})

// POST /api/elections - Create a new election
router.post('/', async (req, res) => {
  try {
    const { title, description, startTime, endTime, positions } = req.body

    const election = await prisma.election.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        createdBy: 'admin', // 🔐 placeholder; ideally from auth
      }
    })

    // Create positions and candidates separately to handle the electionId reference
    for (const pos of positions) {
      const positionData: any = {
        title: pos.title,
        positionType: pos.positionType,
        electionId: election.id
      }

      // Set geographical scope based on position type
      if (pos.countyId) positionData.countyId = pos.countyId
      if (pos.constituencyId) positionData.constituencyId = pos.constituencyId
      if (pos.wardId) positionData.wardId = pos.wardId

      const position = await prisma.position.create({
        data: positionData
      })

      // Create candidates for this position
      for (const cand of pos.candidates) {
        await prisma.candidate.create({
          data: {
            name: cand.name,
            party: cand.party,
            bio: cand.bio,
            positionId: position.id,
            electionId: election.id
          }
        })
      }
    }

    // Fetch the complete election with positions and candidates
    const completeElection = await prisma.election.findUnique({
      where: { id: election.id },
      include: {
        positions: {
          include: {
            candidates: true,
            county: true,
            constituency: true,
            ward: true
          }
        }
      }
    })

    res.status(201).json(completeElection)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create election' })
  }
})

// GET /api/elections/user/:userId - Get elections available to a specific user based on their location
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    // Get user's location
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        county: true,
        constituency: true,
        ward: true
      }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    if (!user.countyId || !user.constituencyId || !user.wardId) {
      return res.status(400).json({ error: 'User location not set. Please update your profile.' })
    }
    
    // Get elections with positions available to this user
    const elections = await prisma.election.findMany({
      include: {
        positions: {
          where: {
            OR: [
              // President - available to all users
              { positionType: 'PRESIDENT' },
              // County-level positions (Governor, Senator, Women Rep)
              {
                positionType: { in: ['GOVERNOR', 'SENATOR', 'WOMEN_REP'] },
                countyId: user.countyId
              },
              // Constituency-level positions (MP)
              {
                positionType: 'MP',
                constituencyId: user.constituencyId
              },
              // Ward-level positions (MCA)
              {
                positionType: 'MCA',
                wardId: user.wardId
              }
            ]
          },
          include: {
            candidates: true,
            county: true,
            constituency: true,
            ward: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Filter out elections with no available positions
    const availableElections = elections.filter(election => election.positions.length > 0)
    
    res.json({
      elections: availableElections,
      userLocation: {
        county: user.county,
        constituency: user.constituency,
        ward: user.ward
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch user elections' })
  }
})

// GET /api/elections/:electionId/ballot/:userId - Get ballot structure for a specific user and election
router.get('/:electionId/ballot/:userId', async (req, res) => {
  try {
    const { electionId, userId } = req.params
    
    // Get user's location
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        county: true,
        constituency: true,
        ward: true
      }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    if (!user.countyId || !user.constituencyId || !user.wardId) {
      return res.status(400).json({ error: 'User location not set. Please update your profile.' })
    }
    
    // Get the election
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        positions: {
          where: {
            OR: [
              // Ballot 1: Presidential candidates (same for everyone in Kenya)
              { positionType: 'PRESIDENT' },
              // Ballot 2: MP candidates (only for their Constituency)
              {
                positionType: 'MP',
                constituencyId: user.constituencyId
              },
              // Ballot 3: Senator candidates (only for their County)
              {
                positionType: 'SENATOR',
                countyId: user.countyId
              },
              // Ballot 4: Woman Rep candidates (only for their County)
              {
                positionType: 'WOMEN_REP',
                countyId: user.countyId
              },
              // Ballot 5: Governor candidates (only for their County)
              {
                positionType: 'GOVERNOR',
                countyId: user.countyId
              },
              // Ballot 6: MCA candidates (only for their Ward)
              {
                positionType: 'MCA',
                wardId: user.wardId
              }
            ]
          },
          include: {
            candidates: true,
            county: true,
            constituency: true,
            ward: true
          },
          orderBy: [
            // Order positions by ballot priority
            {
              positionType: 'asc'
            }
          ]
        }
      }
    })
    
    if (!election) {
      return res.status(404).json({ error: 'Election not found' })
    }
    
    // Structure the ballot according to the 6-ballot system
    const ballotStructure = {
      ballot1: election.positions.filter(p => p.positionType === 'PRESIDENT'),
      ballot2: election.positions.filter(p => p.positionType === 'MP'),
      ballot3: election.positions.filter(p => p.positionType === 'SENATOR'),
      ballot4: election.positions.filter(p => p.positionType === 'WOMEN_REP'),
      ballot5: election.positions.filter(p => p.positionType === 'GOVERNOR'),
      ballot6: election.positions.filter(p => p.positionType === 'MCA')
    }
    
    // Create ordered ballots array for easier frontend consumption
    const ballots = [
      {
        ballotNumber: 1,
        title: 'Presidential Election',
        description: 'Same for everyone in Kenya',
        positions: ballotStructure.ballot1
      },
      {
        ballotNumber: 2,
        title: 'Member of Parliament (MP)',
        description: `For ${user.constituency?.name} Constituency`,
        positions: ballotStructure.ballot2
      },
      {
        ballotNumber: 3,
        title: 'Senator',
        description: `For ${user.county?.name} County`,
        positions: ballotStructure.ballot3
      },
      {
        ballotNumber: 4,
        title: 'Woman Representative',
        description: `For ${user.county?.name} County`,
        positions: ballotStructure.ballot4
      },
      {
        ballotNumber: 5,
        title: 'Governor',
        description: `For ${user.county?.name} County`,
        positions: ballotStructure.ballot5
      },
      {
        ballotNumber: 6,
        title: 'Member of County Assembly (MCA)',
        description: `For ${user.ward?.name} Ward`,
        positions: ballotStructure.ballot6
      }
    ].filter(ballot => ballot.positions.length > 0) // Only include ballots with candidates
    
    res.json({
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        startTime: election.startTime,
        endTime: election.endTime
      },
      userLocation: {
        county: user.county,
        constituency: user.constituency,
        ward: user.ward
      },
      ballots,
      totalBallots: ballots.length
    })
    
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch ballot structure' })
  }
})

export default router
