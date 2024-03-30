import { Router } from 'express'
import { loginPage, registerPage } from '../controllers/views/auth'
import { home } from '../controllers/views/home'
import { eventDetail } from '../controllers/views/events'
import { orderDetail, orders } from '../controllers/views/orders'
import { Auth } from '../middlewares/Auth'
import { ticketDetail, tickets } from '../controllers/views/tickets'
import { patchPassword } from '../controllers/views/credentials'
import { main } from '../controllers/views/dashboard'

const router: Router = Router()
const customerAuth = new Auth('customer', [], 'view')
const customerAuthLoose = new Auth('customer', ['admin', 'sudo'], 'view')
const adminAuth = new Auth('admin', ['sudo'], 'view')

router.get('/login', loginPage)
router.get('/register', registerPage)

router.get('/', home)
router.get('/events/:eventId', eventDetail)

router.get('/user/orders', customerAuth.validate, orders)
router.get('/user/orders/:orderId', customerAuth.validate, orderDetail)

router.get('/user/tickets', customerAuth.validate, tickets)
router.get('/user/tickets/:ticketId', customerAuth.validate, ticketDetail)

router.get('/user/credential', customerAuthLoose.validate, patchPassword)

/* DASHBOARD */
router.get('/dashboard', adminAuth.validate, main)

export default router
