import express from 'express'
import { userAuth, adminAuth } from '../middlewares/authentication'

import staff from '../controllers/staff'

const router = express.Router()

router.get('/list', adminAuth, staff.list)
router.post('/list', adminAuth, staff.list)
router.post('/upload/:document', userAuth, staff.uploadDocument)
router.get('/:id', adminAuth, staff.get)
router.post('/:id/upload/:document', adminAuth, staff.uploadForStaff)
router.put('/:id/update', adminAuth, staff.updateByid)

export default router
