import { Router } from 'express'
import {
  addUser,
  createSudo,
  deleteUser,
  getUser,
  getUsers,
  resetUserPassword,
  resetUserPasswordByEmail,
  updateUser
} from '../controllers/users'
import { addSession, removeSession } from '../controllers/auth'
import { Auth } from '../middlewares/Auth'
import { createForgetPasswordToken, patchPassword } from '../controllers/credentials'
import {
  addEvent,
  addEventBySession,
  deleteEvent,
  getEventAttenders,
  getEventAttendersAge,
  getEventAttendersGender,
  getEventById,
  getEvents,
  getEventsBySession,
  updateEvent,
  updateEventBySession
} from '../controllers/events'
import {
  eventThumbnailMiddleware,
  updateEventThumbnailMiddleware
} from '../middlewares/multer/Event'
import {
  addEventPrice,
  deleteEventPrice,
  evaluateEventPriceStock,
  getEventPriceByEventId,
  updateEventPrice
} from '../controllers/event-prices'
import {
  addEmailVerification,
  verifyEmailActivation
} from '../controllers/account-email-verification'
import { addCustomer, updateCustomer } from '../controllers/customer-acc'
import { limit } from '../utils/RateLimiter'
import {
  addOfflineTransaction,
  addOfflineTransactionVendor,
  addTransaction
} from '../controllers/transactions'
import { processTransactionNotif } from '../controllers/transactions/notification'
import {
  getActiveTickets,
  getTicketsByCategory,
  getTicketsById,
  getTicketsByUserId,
  ticketActivation,
  ticketToPdfDirect
} from '../controllers/tickets'
import {
  getOrderById,
  getOrdersByDay,
  getOrdersByEventIdSource,
  getOrdersByUserId,
  orderCancel
} from '../controllers/orders'
import {
  getOfflineSaleCapability,
  setOfflineSaleCapability
} from '../controllers/account-attribute'

const router: Router = Router()

const auth = new Auth('', [])
const adminAuth = new Auth('admin', ['sudo'])
const sudoAuth = new Auth('sudo', [])
const customerAuth = new Auth('customer')
const customerAuthLoose = new Auth('customer', ['admin', 'sudo'])
const customerAuthLooseAndVendor = new Auth('customer', ['admin', 'sudo', 'vendor'])
const vendorAuth = new Auth('vendor', [])
const vendorAuthLoose = new Auth('vendor', ['admin', 'sudo'])

/* RATE LIMITER */
const limitLogin = limit(10)
const limitEmailVerification = limit(12)

/* USERS */
router.post('/users', adminAuth.validate, addUser)
router.patch('/users/:userId', sudoAuth.validate, updateUser)
router.delete('/users/:userId', sudoAuth.validate, deleteUser)
router.get('/users/detail', getUser)
router.get('/sudo/create', createSudo)
router.get('/users', vendorAuthLoose.validate, getUsers)
router.patch('/credential', auth.validateSession, patchPassword)
router.patch('/credential/reset', adminAuth.validate, resetUserPassword)
router.post('/credential/forget', createForgetPasswordToken)
router.patch('/credential/forget', resetUserPasswordByEmail)

/* AUTH */
router.post('/auth', limitLogin, addSession)
router.delete('/auth', removeSession)

/* CUSTOMER ACCOUNT */
router.post('/customers', addCustomer)
router.patch('/customers', customerAuth.validate, updateCustomer)

/* EMAIL VERIFICATION */
router.post('/register/verification', limitEmailVerification, addEmailVerification)
router.post('/register/verification/token', verifyEmailActivation)

/* EVENT PRICE */
router.post('/event-price', vendorAuthLoose.validate, addEventPrice)
router.get('/event-price/:eventId', getEventPriceByEventId)
router.delete('/event-price/:eventPriceId', vendorAuthLoose.validate, deleteEventPrice)
router.get('/evaluate/event-price/:orderId', auth.validateSession, evaluateEventPriceStock)
router.put('/event-price/:eventPriceId', vendorAuthLoose.validate, updateEventPrice)

/* EVENTS */
router.post('/events', adminAuth.validate, eventThumbnailMiddleware, addEvent)
router.get('/events', getEvents)
router.get('/events/detail/:eventId', getEventById)
router.put('/events/:eventId', adminAuth.validate, updateEventThumbnailMiddleware, updateEvent)
router.delete('/events/:eventId', adminAuth.validate, deleteEvent)
router.get('/events/attenders/:eventId', getEventAttenders)
router.get('/statistic/events/attenders/:eventId/age', getEventAttendersAge)
router.get('/statistic/events/attenders/:eventId/gender', getEventAttendersGender)

/* EVENTS VENDOR SIDE */
router.post('/vendor/events', vendorAuth.validate, eventThumbnailMiddleware, addEventBySession)
router.put(
  '/vendor/events/:eventId',
  vendorAuth.validate,
  updateEventThumbnailMiddleware,
  updateEventBySession
)
router.get('/vendor/events', vendorAuth.validate, getEventsBySession)

/* ORDERS */
router.get('/orders/detail', customerAuth.validate, getOrdersByUserId)
router.get('/orders/detail/:orderId', customerAuthLoose.validate, getOrderById)
router.get('/statistic/orders/source', vendorAuthLoose.validate, getOrdersByEventIdSource)
router.get('/statistic/orders/date', vendorAuthLoose.validate, getOrdersByDay)
router.post('/order/cancel/:orderId', customerAuth.validate, orderCancel)

/* TRANSACTIONS */
router.post('/transaction', customerAuth.validate, addTransaction)
router.post('/transaction/offline', adminAuth.validate, addOfflineTransaction)

/* OFFLINE TRANSACTION VENDOR SIDE */
router.post('/vendor/transaction/offline', vendorAuth.validate, addOfflineTransactionVendor)

/* TRANSACTION NOTIF */
router.post('/notification/transaction', processTransactionNotif)

/* TICKETS */
router.get('/tickets/user', customerAuth.validate, getTicketsByUserId)
router.get('/tickets/detail/:ticketId', customerAuthLoose.validate, getTicketsById)
router.get('/statistic/tickets/:eventId/category', vendorAuthLoose.validate, getTicketsByCategory)
router.get(
  '/tickets/download/:ticketId/direct',
  customerAuthLooseAndVendor.validate,
  ticketToPdfDirect
)
router.post('/tickets/activation', vendorAuthLoose.validate, ticketActivation)
router.get('/tickets/active', vendorAuthLoose.validate, getActiveTickets)

/* ACCOUNT ATTRIBUTE */
router.post('/accounts/offline-capability', adminAuth.validate, setOfflineSaleCapability)
router.get('/accounts/offline-capability', adminAuth.validate, getOfflineSaleCapability)

export default router
