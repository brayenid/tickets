import { Router } from 'express'
import { forgetPage, loginPage, registerPage } from '../controllers/views/auth'
import { home } from '../controllers/views/home'
import { eventDetail } from '../controllers/views/events'
import { orderDetail, orders } from '../controllers/views/orders'
import { Auth } from '../middlewares/Auth'
import { ticketDetail, tickets } from '../controllers/views/tickets'
import { forgetPassword, patchPassword } from '../controllers/views/credentials'
import {
  adminDetailDashboard,
  createAdmin,
  createCustomer,
  createEvent,
  createVendors,
  customerDetailDashboard,
  eventDetailDashboard,
  eventPriceDetail,
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
import {
  createEventVendor,
  eventDetailDashboardVendor,
  eventPriceDetailVendor,
  eventSummaryDashboardVendor,
  offlineSaleVendor,
  orderDetailDashboardVendor,
  orderListVendor,
  ticketActivationVendor,
  ticketDetailDashboardVendor,
  ticketListVendor
} from '../controllers/views/vendor-dashboard'

const router: Router = Router()
const customerAuth = new Auth('customer', [], 'view')
const customerAuthLoose = new Auth('customer', ['admin', 'sudo'], 'view')
const vendorAuth = new Auth('vendor', [], 'view')
// const customerAuthLoose = new Auth('customer', ['admin', 'sudo'], 'view')
const adminAuth = new Auth('admin', ['sudo'], 'view')
const sudoAuth = new Auth('sudo', [], 'view')

router.get('/login', loginPage)
router.get('/register', registerPage)
router.get('/forget', forgetPage)

router.get('/', home)
router.get('/events/:eventId', eventDetail)

router.get('/user/orders', customerAuth.validate, orders)
router.get('/user/orders/:orderId', customerAuth.validate, orderDetail)

router.get('/user/tickets', customerAuth.validate, tickets)
router.get('/user/tickets/:ticketId', customerAuth.validate, ticketDetail)

router.get('/user/credential', customerAuthLoose.validate, patchPassword)
router.get('/credential/forget', forgetPassword)

/* DASHBOARD */
router.get('/dashboard', adminAuth.validate, main)
router.get('/dashboard/events', adminAuth.validate, createEvent)
router.get('/dashboard/events/:eventId', adminAuth.validate, eventSummaryDashboard)
router.get('/dashboard/events/:eventId/detail', adminAuth.validate, eventDetailDashboard)
router.get(
  '/dashboard/events/:eventId/event-price/:eventPriceId',
  adminAuth.validate,
  eventPriceDetail
)
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

/* VENDOR DASHBOARD */
router.get('/vendor/dashboard/events', vendorAuth.validate, createEventVendor)
router.get('/vendor/dashboard/events/:eventId', vendorAuth.validate, eventSummaryDashboardVendor)
router.get(
  '/vendor/dashboard/events/:eventId/detail',
  vendorAuth.validate,
  eventDetailDashboardVendor
)
router.get(
  '/vendor/dashboard/events/:eventId/event-price/:eventPriceId',
  vendorAuth.validate,
  eventPriceDetailVendor
)

router.get('/vendor/dashboard/orders', vendorAuth.validate, orderListVendor)
router.get('/vendor/dashboard/orders/:orderId', vendorAuth.validate, orderDetailDashboardVendor)
router.get('/vendor/dashboard/tickets', vendorAuth.validate, ticketListVendor)
router.get('/vendor/dashboard/tickets/:ticketId', vendorAuth.validate, ticketDetailDashboardVendor)
router.get('/vendor/dashboard/ticket-activation', vendorAuth.validate, ticketActivationVendor)
router.get('/vendor/dashboard/offline-sale', vendorAuth.validate, offlineSaleVendor)

export default router
