import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import {
  getBlockchainResults,
  getElectionBlockchainResults,
  exportBlockchainResults,
  getBlockchainStatus
} from '../controllers'

const router = Router()

// Middleware to ensure only admins can access these routes
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// Apply authentication and admin check to all routes
router.use(authenticateToken)
router.use(requireAdmin)

// Get all blockchain voting results (anonymized)
router.get('/blockchain/results', getBlockchainResults)

// Get blockchain results for specific election (anonymized)
router.get('/blockchain/results/:electionId', getElectionBlockchainResults)

// Export blockchain results in CSV or JSON format
router.get('/blockchain/export', exportBlockchainResults)

// Get blockchain connection status
router.get('/blockchain/status', getBlockchainStatus)

export default router