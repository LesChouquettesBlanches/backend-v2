const express = require('express')

const router = express.Router()
const { adminAuth } = require('../middleware/authentication')

const booker = require('../controllers/booker')

router.get('/list', adminAuth, booker.list)
router.post('/create', adminAuth, booker.create)
router.put('/update', adminAuth, booker.update)
router.get('/:id', adminAuth, booker.get)
router.put('/:id/update', adminAuth, booker.updateByid)

module.exports = router
