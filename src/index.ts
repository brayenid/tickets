import express, { type Express } from 'express'
import dotenv from 'dotenv'
import apiRoutes from './routes/api'
import session from 'express-session'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import { prisma } from './utils/Db'

dotenv.config()

const app: Express = express()
const port: number | string = process.env.PORT ?? 3000

app.use(express.static('public'))
app.use(express.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'secret',
    name: 'ticket.session',
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hrs
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined
    })
  })
)

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string
      name: string
      email?: string
      role: string
      username?: string
    }
  }
}

app.use('/api', apiRoutes)

app.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`)
})
