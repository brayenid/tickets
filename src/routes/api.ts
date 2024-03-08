import { Router } from 'express'
import { addUser, createSudo, deleteUser, getUser, getUsers, updateUser } from '../controllers/users'
import { addSession, removeSession } from '../controllers/auth'
import { Auth } from '../middlewares/Auth'
import { patchPassword } from '../controllers/credentials'
import { addEvent, deleteEvent, getEventById, getEvents, updateEvent } from '../controllers/events'
import { eventThumbnailMiddleware, updateEventThumbnailMiddleware } from '../middlewares/multer/Event'
const router: Router = Router()

const auth = new Auth('', [])
const adminAuth = new Auth('admin', ['sudo'])
const sudoAuth = new Auth('sudo', [])

/* LOCAL ADMINISTRATOR */
router.post('/users', sudoAuth.validate, addUser)
router.patch('/users/:userId', updateUser)
router.delete('/users/:userId', sudoAuth.validate, deleteUser)
router.get('/users', sudoAuth.validate, getUsers)
router.get('/users/detail', getUser)
router.patch('/credential', auth.validateSession, patchPassword)
router.get('/sudo/create', createSudo)

/* AUTH */
router.post('/auth', addSession)
router.delete('/auth', removeSession)

/* EVENTS */
router.post('/events', adminAuth.validate, eventThumbnailMiddleware, addEvent)
router.get('/events', getEvents)
router.get('/events/:eventId', getEventById)
router.put('/events/:eventId', adminAuth.validate, updateEventThumbnailMiddleware, updateEvent)
router.delete('/events/:eventId', adminAuth.validate, deleteEvent)

export default router
