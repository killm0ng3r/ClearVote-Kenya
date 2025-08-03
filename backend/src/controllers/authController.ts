// backend/src/controllers/authController.ts
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

export const loginUser = async (req: Request, res: Response) => {
  console.log("Post request received at /login")
  const { email, password } = req.body

  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      county: true,
      constituency: true,
      ward: true
    }
  })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' })
  res.json({
    token,
    role: user.role,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      county: user.county,
      constituency: user.constituency,
      ward: user.ward
    }
  })
}

// backend/src/controllers/authController.ts
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, countyId, constituencyId, wardId } = req.body

  if (!name || !email || !password || !countyId || !constituencyId || !wardId)
    return res.status(400).json({ error: 'All fields including location information are required' })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing)
    return res.status(409).json({ error: 'User already exists' })

  const hashed = await bcrypt.hash(password, 10)
  
  const userData = {
    name,
    email,
    password: hashed,
    role: 'VOTER' as const,
    countyId: parseInt(countyId),
    constituencyId,
    wardId
  }

  const user = await prisma.user.create({
    data: userData,
    include: {
      county: true,
      constituency: true,
      ward: true
    }
  })

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' })

  res.status(201).json({
    token,
    role: user.role,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      county: user.county,
      constituency: user.constituency,
      ward: user.ward
    }
  })
}

// Update user profile with location
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { name, countyId, constituencyId, wardId } = req.body

    const updateData: any = {}
    if (name) updateData.name = name
    if (countyId) updateData.countyId = parseInt(countyId)
    if (constituencyId) updateData.constituencyId = constituencyId
    if (wardId) updateData.wardId = wardId

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        county: true,
        constituency: true,
        ward: true
      }
    })

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        county: user.county,
        constituency: user.constituency,
        ward: user.ward
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

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

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        county: user.county,
        constituency: user.constituency,
        ward: user.ward
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

