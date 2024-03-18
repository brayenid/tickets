import { Router } from 'express'
import { addUser, createSudo, deleteUser, getUser, getUsers, resetUserPassword, updateUser } from '../controllers/users'
import { addSession, removeSession } from '../controllers/auth'
import { Auth } from '../middlewares/Auth'
import { patchPassword } from '../controllers/credentials'
import { addEvent, deleteEvent, getEventById, getEvents, updateEvent } from '../controllers/events'
import { eventThumbnailMiddleware, updateEventThumbnailMiddleware } from '../middlewares/multer/Event'
import { addEventPrice, deleteEventPrice, getEventPriceByEventId } from '../controllers/event-prices'
import { addEmailVerification, verifyEmailActivation } from '../controllers/account-email-verification'
import { addCustomer, updateCustomer } from '../controllers/customer-acc'
import { limit } from '../utils/RateLimiter'

const router: Router = Router()

const auth = new Auth('', [])
const adminAuth = new Auth('admin', ['sudo'])
const sudoAuth = new Auth('sudo', [])
const customerAuth = new Auth('customer')

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
router.get('/events/:eventId', getEventById)
router.put('/events/:eventId', adminAuth.validate, updateEventThumbnailMiddleware, updateEvent)
router.delete('/events/:eventId', adminAuth.validate, deleteEvent)

export default router
