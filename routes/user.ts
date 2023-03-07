const express = require('express')

const router = express.Router()
const { userAuth, adminAuth } = require('../middleware/authentication')

const user = require('../controllers/user')

router.get('/list', adminAuth, user.listUsers)
router.post('/profile', userAuth, user.profile)
router.put('/profile/update', userAuth, user.update)
router.put('/profile/update/password', userAuth, user.updatePassword)
router.post('/orders/list', userAuth, user.ordersList)
router.get('/order/:id', userAuth, user.order)
router.get('/:id', adminAuth, user.findById)
router.put('/:id/update', adminAuth, user.updateById)
router.delete('/:id/delete', adminAuth, user.deleteById)
router.put('/:id/status', adminAuth, user.setIsActive)

module.exports = router
