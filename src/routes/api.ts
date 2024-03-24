import { Router } from 'express'
import { addUser, createSudo, deleteUser, getUser, getUsers, resetUserPassword, updateUser } from '../controllers/users'
import { addSession, removeSession } from '../controllers/auth'
import { Auth } from '../middlewares/Auth'
import { patchPassword } from '../controllers/credentials'
import {
  addEvent,
  deleteEvent,
  getEventAttenders,
  getEventAttendersAge,
  getEventAttendersGender,
  getEventById,
  getEvents,
  updateEvent
} from '../controllers/events'
import { eventThumbnailMiddleware, updateEventThumbnailMiddleware } from '../middlewares/multer/Event'
import { addEventPrice, deleteEventPrice, getEventPriceByEventId } from '../controllers/event-prices'
import { addEmailVerification, verifyEmailActivation } from '../controllers/account-email-verification'
import { addCustomer, updateCustomer } from '../controllers/customer-acc'
import { limit } from '../utils/RateLimiter'
import { addOfflineTransaction, addTransaction } from '../controllers/transactions'
import { processTransactionNotif } from '../controllers/transactions/notification'
import { getTicketsById, getTicketsByUserId } from '../controllers/tickets'
import { getOrderById, getOrdersByUserId } from '../controllers/orders'

const router: Router = Router()

const auth = new Auth('', [])
const adminAuth = new Auth('admin', ['sudo'])
const sudoAuth = new Auth('sudo', [])
const customerAuth = new Auth('customer')
const customerAuthLoose = new Auth('customer', ['admin', 'sudo'])

/* RATE LIMITER */
const limitLogin = limit(10)

/* USERS */
router.post('/users', sudoAuth.validate, addUser)
router.patch('/users/:userId', sudoAuth.validate, updateUser)
router.delete('/users/:userId', sudoAuth.validate, deleteUser)
router.get('/users', sudoAuth.validate, getUsers)
router.get('/users/detail', getUser)
router.patch('/credential', auth.validateSession, patchPassword)
router.patch('/credential/reset', adminAuth.validate, resetUserPassword)
router.get('/sudo/create', createSudo)

/* AUTH */
router.post('/auth', limitLogin, addSession)
router.delete('/auth', removeSession)

/* CUSTOMER ACCOUNT */
router.post('/customers', addCustomer)
router.patch('/customers', customerAuth.validate, updateCustomer)

/* EMAIL VERIFICATION */
router.post('/register/verification', addEmailVerification)
router.post('/register/verification/token', verifyEmailActivation)

/* EVENT PRICE */
router.post('/event-price', adminAuth.validate, addEventPrice)
router.get('/event-price/:eventId', getEventPriceByEventId)
router.delete('/event-price/:eventPriceId', deleteEventPrice)

/* EVENTS */
router.post('/events', adminAuth.validate, eventThumbnailMiddleware, addEvent)
router.get('/events', getEvents)
router.get('/events/detail/:eventId', getEventById)
router.put('/events/:eventId', adminAuth.validate, updateEventThumbnailMiddleware, updateEvent)
router.delete('/events/:eventId', adminAuth.validate, deleteEvent)
router.get('/events/attenders/:eventId', getEventAttenders)
router.get('/statistic/events/attenders/:eventId/age', getEventAttendersAge)
router.get('/statistic/events/attenders/:eventId/gender', getEventAttendersGender)

/* ORDERS */
router.get('/orders/detail', customerAuth.validate, getOrdersByUserId)
router.get('/orders/detail/:orderId', customerAuthLoose.validate, getOrderById)

/* TRANSACTIONS */
router.post('/transaction', customerAuth.validate, addTransaction)
router.post('/transaction/offline', adminAuth.validate, addOfflineTransaction)

/* TRANSACTION NOTIF */
router.post('/notification/transaction', processTransactionNotif)

/* TICKETS */
router.get('/tickets/user', customerAuth.validate, getTicketsByUserId)
router.get('/tickets/detail/:ticketId', customerAuthLoose.validate, getTicketsById)

export default router
