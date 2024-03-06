import { Router } from 'express'
import { addUser, deleteUser, getUser, getUsers, updateUser } from '../controllers/users'
import { addSession, removeSession } from '../controllers/auth'
import { Auth } from '../middlewares/Auth'
import { patchPassword } from '../controllers/credentials'
const router: Router = Router()

const adminAuth = new Auth('admin', ['sudo'])
const sudoAuth = new Auth('sudo', [])

/* LOCAL ADMINISTRATOR */
router.post('/users', addUser)
router.patch('/users/:userId', updateUser)
router.delete('/users/:userId', sudoAuth.validate, deleteUser)
router.get('/users', adminAuth.validate, getUsers)
router.get('/users/detail', getUser)
router.patch('/users/credential', patchPassword)

/* AUTH */
router.post('/auth', addSession)
router.delete('/auth', removeSession)

export default router
