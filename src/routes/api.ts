import { Router } from 'express'
import { addUser } from '../controllers/users'
const router: Router = Router()

router.post('/users', addUser)

export default router
