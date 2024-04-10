import { Router } from 'express'
import { loginPage, registerPage } from '../controllers/views/auth'
import { home } from '../controllers/views/home'
import { eventDetail } from '../controllers/views/events'
import { orderDetail, orders } from '../controllers/views/orders'
import { Auth } from '../middlewares/Auth'
import { ticketDetail, tickets } from '../controllers/views/tickets'
import { patchPassword } from '../controllers/views/credentials'
import {
  adminDetailDashboard,
  createAdmin,
  createCustomer,
  createEvent,
  createVendors,
  customerDetailDashboard,
  eventDetailDashboard,
  eventSummaryDashboard,
  main,
  offlineSale,
  orderDetailDashboard,
  orderList,
  resetPassword,
  ticketActivation,
  ticketDetailDashboard,
  ticketList,
  vendorDetailDashboard
} from '../controllers/views/dashboard'

const router: Router = Router()
const customerAuth = new Auth('customer', [], 'view')
const customerAuthLoose = new Auth('customer', ['admin', 'sudo'], 'view')
const adminAuth = new Auth('admin', ['sudo'], 'view')
const sudoAuth = new Auth('sudo', [], 'view')

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
router.get('/dashboard/events', adminAuth.validate, createEvent)
router.get('/dashboard/events/:eventId', adminAuth.validate, eventSummaryDashboard)
router.get('/dashboard/events/:eventId/detail', adminAuth.validate, eventDetailDashboard)
router.get('/dashboard/vendors', adminAuth.validate, createVendors)
router.get('/dashboard/vendors/:userId', adminAuth.validate, vendorDetailDashboard)
router.get('/dashboard/customers', adminAuth.validate, createCustomer)
router.get('/dashboard/customers/:userId', adminAuth.validate, customerDetailDashboard)
router.get('/dashboard/orders', adminAuth.validate, orderList)
router.get('/dashboard/orders/:orderId', adminAuth.validate, orderDetailDashboard)
router.get('/dashboard/tickets', adminAuth.validate, ticketList)
router.get('/dashboard/tickets/:ticketId', adminAuth.validate, ticketDetailDashboard)
router.get('/dashboard/ticket-activation', adminAuth.validate, ticketActivation)
router.get('/dashboard/offline-sale', adminAuth.validate, offlineSale)

router.get('/sudo/admins', sudoAuth.validate, createAdmin)
router.get('/sudo/admins/:userId', sudoAuth.validate, adminDetailDashboard)
router.get('/sudo/credential', sudoAuth.validate, resetPassword)

export default router
