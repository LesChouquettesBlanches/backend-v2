import express from 'express'
import auth from '../controllers/auth'
import { userAuth } from '../middlewares/authentication'

const router = express.Router()

router.post('/signup', auth.signup)
router.post('/login', auth.login)
router.post('/token/verify', userAuth, auth.tokenVerify)

export default router
