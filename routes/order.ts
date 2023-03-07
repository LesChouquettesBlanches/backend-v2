const express = require('express')

const router = express.Router()
const { userAuth, adminAuth } = require('../middleware/authentication')

const order = require('../controllers/order')

router.get('/list', adminAuth, order.listOrders)
router.post('/list', adminAuth, order.listOrders)
router.post('/create', userAuth, order.createOrder)
router.get('/:id', userAuth, order.getOrder)
router.put('/:id/archived', userAuth, order.setArchived)
router.put('/:id/status', adminAuth, order.setOrderStatus)
router.put('/:id/teams', adminAuth, order.updateOrderTeams)
router.put('/:id/team/:teamId/members', adminAuth, order.updateOrderTeamMembers)
router.put('/:id', userAuth, order.updateOrder)
router.delete('/:id', adminAuth, order.deleteOrder)

module.exports = router
