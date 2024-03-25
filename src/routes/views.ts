import { Router } from 'express'
import { loginPage, registerPage } from '../controllers/views/auth'

const router: Router = Router()

router.get('/login', loginPage)
router.get('/register', registerPage)

export default router
