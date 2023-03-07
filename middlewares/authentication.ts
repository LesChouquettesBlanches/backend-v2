import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/user'

async function userAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, process.env.APP_SECRET_TOKEN)
    const { userId } = decodedToken
    const user = await User.findById(userId)

    if (user.id !== userId) {
      throw new Error('Invalid user ID')
    } else {
      req.auth = { userId }
      next()
    }
  } catch {
    res.status(401).json({
      error: 'Invalid request!',
    })
  }
}

async function adminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, process.env.APP_SECRET_TOKEN)
    const { userId } = decodedToken
    const user = await User.findById(userId)

    if (user.id !== userId) {
      throw new Error('Invalid user ID')
    } else if (!user.roles.includes('administrator')) {
      throw new Error('Unauthorized request')
    } else {
      req.auth = { userId }
      next()
    }
  } catch {
    res.status(401).json({
      error: 'Invalid request!',
    })
  }
}

module.exports = { userAuth, adminAuth }
