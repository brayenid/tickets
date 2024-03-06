import { Router } from 'express'
import { addUser, createSudo, deleteUser, getUser, getUsers, updateUser } from '../controllers/users'
import { addSession, removeSession } from '../controllers/auth'
import { Auth } from '../middlewares/Auth'
import { patchPassword } from '../controllers/credentials'
const router: Router = Router()

const auth = new Auth('', [])
// const adminAuth = new Auth('admin', ['sudo'])
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

export default router
