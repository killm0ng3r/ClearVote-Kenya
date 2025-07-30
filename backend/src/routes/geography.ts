// backend/src/routes/geography.ts
import express from 'express'
import { prisma } from '../lib/prisma'

const router = express.Router()

// GET /api/geography/counties - Get all counties
router.get('/counties', async (req, res) => {
  try {
    const counties = await prisma.county.findMany({
      orderBy: { name: 'asc' }
    })
    res.json(counties)
  } catch (error) {
    console.error('Error fetching counties:', error)
    res.status(500).json({ error: 'Failed to fetch counties' })
  }
})

// GET /api/geography/counties/:countyId/constituencies - Get constituencies for a county
router.get('/counties/:countyId/constituencies', async (req, res) => {
  try {
    const { countyId } = req.params
    const constituencies = await prisma.constituency.findMany({
      where: { countyId: parseInt(countyId) },
      orderBy: { name: 'asc' }
    })
    res.json(constituencies)
  } catch (error) {
    console.error('Error fetching constituencies:', error)
    res.status(500).json({ error: 'Failed to fetch constituencies' })
  }
})

// GET /api/geography/constituencies/:constituencyId/wards - Get wards for a constituency
router.get('/constituencies/:constituencyId/wards', async (req, res) => {
  try {
    const { constituencyId } = req.params
    const wards = await prisma.ward.findMany({
      where: { constituencyId },
      orderBy: { name: 'asc' }
    })
    res.json(wards)
  } catch (error) {
    console.error('Error fetching wards:', error)
    res.status(500).json({ error: 'Failed to fetch wards' })
  }
})

// GET /api/geography/full-hierarchy - Get complete geographical hierarchy
router.get('/full-hierarchy', async (req, res) => {
  try {
    const counties = await prisma.county.findMany({
      include: {
        constituencies: {
          include: {
            wards: true
          },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })
    res.json(counties)
  } catch (error) {
    console.error('Error fetching full hierarchy:', error)
    res.status(500).json({ error: 'Failed to fetch geographical hierarchy' })
  }
})

export default router