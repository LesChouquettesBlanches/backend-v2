const express = require('express')

const router = express.Router()

const auth = require('../controllers/auth')
const { userAuth } = require('../middleware/authentication')

router.post('/signup', auth.signup)
router.post('/login', auth.login)
router.post('/token/verify', userAuth, auth.tokenVerify)

module.exports = router
