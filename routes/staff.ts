const express = require('express')

const router = express.Router()
const { userAuth, adminAuth } = require('../middleware/authentication')

const staff = require('../controllers/staff')

router.get('/list', adminAuth, staff.list)
router.post('/list', adminAuth, staff.list)
router.post('/upload/:document', userAuth, staff.uploadDocument)
router.get('/:id', adminAuth, staff.get)
router.post('/:id/upload/:document', adminAuth, staff.uploadForStaff)
router.put('/:id/update', adminAuth, staff.updateByid)

module.exports = router
