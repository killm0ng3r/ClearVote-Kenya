import { Request, Response } from 'express'
import { blockchainService } from '../services/blockchainService'
import { prisma } from '../lib/prisma'
import { exportToCsv, exportToJson } from '../utils'

// Get all blockchain voting results (anonymized)
export const getBlockchainResults = async (req: Request, res: Response) => {
  try {
    const allVotes = await blockchainService.getAllVotes()
    
    // Anonymize the data by removing voter addresses and adding vote IDs
    const anonymizedVotes = allVotes.map((vote, index) => ({
      voteId: `vote_${index + 1}`,
      electionId: vote.electionId,
      candidateId: vote.candidateId,
      timestamp: new Date().toISOString() // In real implementation, get from blockchain events
    }))

    // Get election and candidate details to enrich the data
    const enrichedVotes = await Promise.all(
      anonymizedVotes.map(async (vote) => {
        try {
          // Get election details
          const election = await prisma.election.findUnique({
            where: { id: vote.electionId },
            select: { title: true, description: true }
          })

          // Get candidate details
          const candidate = await prisma.candidate.findUnique({
            where: { id: vote.candidateId },
            select: { name: true, party: true, position: true }
          })

          return {
            ...vote,
            electionTitle: election?.title || 'Unknown Election',
            candidateName: candidate?.name || 'Unknown Candidate',
            candidateParty: candidate?.party || 'Independent',
            position: candidate?.position || 'Unknown Position'
          }
        } catch (error) {
          console.error('Error enriching vote data:', error)
          return vote
        }
      })
    )

    res.json({
      success: true,
      totalVotes: enrichedVotes.length,
      votes: enrichedVotes
    })
  } catch (error) {
    console.error('Error fetching blockchain results:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch blockchain results' 
    })
  }
}

// Get blockchain results for specific election (anonymized)
export const getElectionBlockchainResults = async (req: Request, res: Response) => {
  try {
    const { electionId } = req.params
    
    // Get election tally from blockchain
    const tally = await blockchainService.getElectionTally(electionId)
    
    // Get all votes for this election (anonymized)
    const allVotes = await blockchainService.getAllVotes()
    const electionVotes = allVotes.filter(vote => 
      vote.electionId === electionId || vote.electionId.startsWith(`${electionId}-`)
    )

    // Anonymize votes
    const anonymizedVotes = electionVotes.map((vote, index) => ({
      voteId: `${electionId}_vote_${index + 1}`,
      electionId: vote.electionId,
      candidateId: vote.candidateId,
      timestamp: new Date().toISOString()
    }))

    // Get election details
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        positions: {
          include: {
            candidates: true
          }
        }
      }
    })

    if (!election) {
      return res.status(404).json({ 
        success: false, 
        error: 'Election not found' 
      })
    }

    // Enrich tally data with candidate information
    const enrichedTally = await Promise.all(
      tally.map(async (tallyItem) => {
        const candidate = await prisma.candidate.findUnique({
          where: { id: tallyItem.candidateId },
          select: { name: true, party: true, position: true }
        })

        return {
          candidateId: tallyItem.candidateId,
          candidateName: candidate?.name || 'Unknown Candidate',
          candidateParty: candidate?.party || 'Independent',
          position: candidate?.position || 'Unknown Position',
          voteCount: tallyItem.voteCount
        }
      })
    )

    res.json({
      success: true,
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        startTime: election.startTime,
        endTime: election.endTime
      },
      totalVotes: anonymizedVotes.length,
      tally: enrichedTally,
      votes: anonymizedVotes
    })
  } catch (error) {
    console.error('Error fetching election blockchain results:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch election blockchain results' 
    })
  }
}

// Export blockchain results in CSV or JSON format
export const exportBlockchainResults = async (req: Request, res: Response) => {
  try {
    const { format = 'json', electionId } = req.query
    
    let data
    if (electionId) {
      // Export specific election data
      const tally = await blockchainService.getElectionTally(electionId as string)
      const election = await prisma.election.findUnique({
        where: { id: electionId as string },
        select: { title: true, description: true, startTime: true, endTime: true }
      })

      // Enrich tally data
      const enrichedTally = await Promise.all(
        tally.map(async (tallyItem) => {
          const candidate = await prisma.candidate.findUnique({
            where: { id: tallyItem.candidateId },
            select: { name: true, party: true, position: true }
          })

          return {
            electionId: electionId as string,
            electionTitle: election?.title || 'Unknown Election',
            candidateId: tallyItem.candidateId,
            candidateName: candidate?.name || 'Unknown Candidate',
            candidateParty: candidate?.party || 'Independent',
            position: candidate?.position || 'Unknown Position',
            voteCount: tallyItem.voteCount,
            exportDate: new Date().toISOString()
          }
        })
      )

      data = enrichedTally
    } else {
      // Export all voting data (anonymized)
      const allVotes = await blockchainService.getAllVotes()
      
      // Create anonymized summary by election and candidate
      const voteSummary: { [key: string]: number } = {}
      allVotes.forEach(vote => {
        const key = `${vote.electionId}:${vote.candidateId}`
        voteSummary[key] = (voteSummary[key] || 0) + 1
      })

      // Convert to exportable format
      data = await Promise.all(
        Object.entries(voteSummary).map(async ([key, count]) => {
          const [electionId, candidateId] = key.split(':')
          
          const election = await prisma.election.findUnique({
            where: { id: electionId },
            select: { title: true }
          })

          const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
            select: { name: true, party: true, position: true }
          })

          return {
            electionId,
            electionTitle: election?.title || 'Unknown Election',
            candidateId,
            candidateName: candidate?.name || 'Unknown Candidate',
            candidateParty: candidate?.party || 'Independent',
            position: candidate?.position || 'Unknown Position',
            voteCount: count,
            exportDate: new Date().toISOString()
          }
        })
      )
    }

    if (format === 'csv') {
      const csvData = exportToCsv(data)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="blockchain-results-${Date.now()}.csv"`)
      res.send(csvData)
    } else {
      const jsonData = exportToJson(data)
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="blockchain-results-${Date.now()}.json"`)
      res.send(jsonData)
    }
  } catch (error) {
    console.error('Error exporting blockchain results:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export blockchain results' 
    })
  }
}

// Get blockchain connection status
export const getBlockchainStatus = async (req: Request, res: Response) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo()
    const isConnected = await blockchainService.isConnected()

    res.json({
      success: true,
      status: {
        isConnected,
        networkId: networkInfo.networkId,
        blockNumber: networkInfo.blockNumber,
        accountsCount: networkInfo.accountsCount,
        contractAddress: networkInfo.contractAddress,
        lastChecked: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error getting blockchain status:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get blockchain status',
      status: {
        isConnected: false,
        lastChecked: new Date().toISOString()
      }
    })
  }
}