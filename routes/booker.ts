import express from 'express'
import { adminAuth } from '../middlewares/authentication'

import booker from '../controllers/booker'

const router = express.Router()

router.get('/list', adminAuth, booker.list)
router.post('/create', adminAuth, booker.create)
router.put('/update', adminAuth, booker.update)
router.get('/:id', adminAuth, booker.get)
router.put('/:id/update', adminAuth, booker.updateByid)

export default router
