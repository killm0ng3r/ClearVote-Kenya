// backend/src/index.ts
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import electionRoutes from './routes/elections'
import votesRoutes from './routes/votes'
import geographyRoutes from './routes/geography'
import adminRoutes from './routes/admin'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// ✅ Apply CORS before routes or JSON parsing
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// ✅ Middleware to handle preflight requests manually if needed
app.options('*', cors())

app.use(express.json())

app.use('/api/elections', electionRoutes)
app.use('/api/votes', votesRoutes)
app.use('/api/geography', geographyRoutes)
app.use('/api/admin', adminRoutes)

// ✅ Routes
app.use('/api', authRoutes)

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
