import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface MockElectionData {
  elections: Array<{
    id: string
    title: string
    description: string
    startTime: string
    endTime: string
    isPublished: boolean
    createdBy: string
  }>
  positions: Array<{
    id: string
    title: string
    positionType: string
    electionId: string
    countyId: number | null
    constituencyId: string | null
    wardId: string | null
  }>
  candidates: Array<{
    id: string
    name: string
    party: string
    bio: string
    positionId: string
    electionId: string
  }>
}

async function main() {
  console.log('🚀 Starting database seeding...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.vote.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.position.deleteMany()
  await prisma.election.deleteMany()
  await prisma.user.deleteMany()

  // Hash passwords
  const passwordHash = await bcrypt.hash('password123', 10)

  // Create admin user
  console.log('👤 Creating admin user...')
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@clearvote.co.ke',
      password: passwordHash,
      role: 'ADMIN',
      countyId: 47, // Nairobi County
    }
  })

  // Get some constituency and ward IDs for sample voters
  const westlandsConstituency = await prisma.constituency.findFirst({
    where: { name: 'Westlands', countyId: 47 }
  })
  
  const mvitaConstituency = await prisma.constituency.findFirst({
    where: { name: 'Mvita', countyId: 1 }
  })

  const kitisuru = await prisma.ward.findFirst({
    where: { name: 'Kitisuru' }
  })

  const mjiwakale = await prisma.ward.findFirst({
    where: { name: 'Mji wa Kale/Makadara' }
  })

  // Create sample voters with complete location information
  console.log('👥 Creating sample voters...')
  const voters = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Kamau',
        email: 'john.kamau@example.com',
        password: passwordHash,
        role: 'VOTER',
        countyId: 47, // Nairobi County
        constituencyId: westlandsConstituency?.id,
        wardId: kitisuru?.id
      }
    }),
    prisma.user.create({
      data: {
        name: 'Mary Wanjiku',
        email: 'mary.wanjiku@example.com',
        password: passwordHash,
        role: 'VOTER',
        countyId: 47, // Nairobi County
        constituencyId: westlandsConstituency?.id,
        wardId: kitisuru?.id
      }
    }),
    prisma.user.create({
      data: {
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@example.com',
        password: passwordHash,
        role: 'VOTER',
        countyId: 1, // Mombasa County
        constituencyId: mvitaConstituency?.id,
        wardId: mjiwakale?.id
      }
    }),
    prisma.user.create({
      data: {
        name: 'Grace Nyong\'o',
        email: 'grace.nyongo@example.com',
        password: passwordHash,
        role: 'VOTER',
        countyId: 1, // Mombasa County
        constituencyId: mvitaConstituency?.id,
        wardId: mjiwakale?.id
      }
    })
  ])

  // Load mock election data
  console.log('📊 Loading mock election data...')
  const mockDataPath = path.join(__dirname, '../../mock-election-data.json')
  const mockDataRaw = fs.readFileSync(mockDataPath, 'utf-8')
  const mockData: MockElectionData = JSON.parse(mockDataRaw)

  // Create elections
  console.log('🗳️ Creating elections...')
  for (const electionData of mockData.elections) {
    await prisma.election.create({
      data: {
        id: electionData.id,
        title: electionData.title,
        description: electionData.description,
        startTime: new Date(electionData.startTime),
        endTime: new Date(electionData.endTime),
        isPublished: electionData.isPublished,
        createdBy: admin.id, // Use the actual admin ID
      }
    })
  }


  // Create positions with proper geographical references
  console.log('🏛️ Creating positions...')
  for (const positionData of mockData.positions) {
    let constituencyId = positionData.constituencyId
    let wardId = positionData.wardId

    // Map placeholder IDs to actual IDs
    if (positionData.constituencyId === 'westlands-constituency-id') {
      constituencyId = westlandsConstituency?.id || null
    }
    if (positionData.constituencyId === 'mvita-constituency-id') {
      constituencyId = mvitaConstituency?.id || null
    }
    if (positionData.wardId === 'kitisuru-ward-id') {
      wardId = kitisuru?.id || null
    }

    await prisma.position.create({
      data: {
        id: positionData.id,
        title: positionData.title,
        positionType: positionData.positionType as any,
        electionId: positionData.electionId,
        countyId: positionData.countyId,
        constituencyId: constituencyId,
        wardId: wardId,
      }
    })
  }

  // Create candidates
  console.log('🏃‍♂️ Creating candidates...')
  for (const candidateData of mockData.candidates) {
    await prisma.candidate.create({
      data: {
        id: candidateData.id,
        name: candidateData.name,
        party: candidateData.party,
        bio: candidateData.bio,
        positionId: candidateData.positionId,
        electionId: candidateData.electionId,
      }
    })
  }

  // Create some sample votes for demonstration
  console.log('🗳️ Creating sample votes...')
  const generalElection = await prisma.election.findFirst({
    where: { id: 'election-2025-general' }
  })

  if (generalElection) {
    // Get some positions and candidates for voting
    const presidentialPosition = await prisma.position.findFirst({
      where: { positionType: 'PRESIDENT', electionId: generalElection.id },
      include: { candidates: true }
    })

    const nairobiGovernorPosition = await prisma.position.findFirst({
      where: { positionType: 'GOVERNOR', countyId: 47, electionId: generalElection.id },
      include: { candidates: true }
    })

    // Create sample votes
    if (presidentialPosition && presidentialPosition.candidates.length > 0) {
      await prisma.vote.create({
        data: {
          voterId: voters[0].id,
          candidateId: presidentialPosition.candidates[0].id,
          electionId: generalElection.id,
        }
      })

      await prisma.vote.create({
        data: {
          voterId: voters[1].id,
          candidateId: presidentialPosition.candidates[1].id,
          electionId: generalElection.id,
        }
      })
    }

    if (nairobiGovernorPosition && nairobiGovernorPosition.candidates.length > 0) {
      await prisma.vote.create({
        data: {
          voterId: voters[0].id,
          candidateId: nairobiGovernorPosition.candidates[0].id,
          electionId: generalElection.id,
        }
      })

      await prisma.vote.create({
        data: {
          voterId: voters[1].id,
          candidateId: nairobiGovernorPosition.candidates[1].id,
          electionId: generalElection.id,
        }
      })
    }
  }

  // Print summary
  console.log('📈 Seeding completed! Summary:')
  const electionCount = await prisma.election.count()
  const positionCount = await prisma.position.count()
  const candidateCount = await prisma.candidate.count()
  const userCount = await prisma.user.count()
  const voteCount = await prisma.vote.count()
  const countyCount = await prisma.county.count()
  const constituencyCount = await prisma.constituency.count()
  const wardCount = await prisma.ward.count()

  console.log(`✅ Elections: ${electionCount}`)
  console.log(`✅ Positions: ${positionCount}`)
  console.log(`✅ Candidates: ${candidateCount}`)
  console.log(`✅ Users: ${userCount}`)
  console.log(`✅ Votes: ${voteCount}`)
  console.log(`✅ Counties: ${countyCount}`)
  console.log(`✅ Constituencies: ${constituencyCount}`)
  console.log(`✅ Wards: ${wardCount}`)

  console.log('\n🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
