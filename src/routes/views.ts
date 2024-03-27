import { Router } from 'express'
import { loginPage, registerPage } from '../controllers/views/auth'
import { home } from '../controllers/views/home'
import { eventDetail } from '../controllers/views/events'

const router: Router = Router()

router.get('/login', loginPage)
router.get('/register', registerPage)

router.get('/', home)
router.get('/events/:eventId', eventDetail)

export default router
