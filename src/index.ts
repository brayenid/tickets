import express, { type Express } from 'express'
import dotenv from 'dotenv'
import apiRoutes from './routes/api'
import session from 'express-session'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import { prisma } from './utils/Db'
import { rateLimit } from 'express-rate-limit'

dotenv.config()

const app: Express = express()
const port: number | string = process.env.PORT ?? 3000
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  limit: 150, // Limit each IP to 150 requests per `window` (here, per 1 minutes).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false // Disable the `X-RateLimit-*` headers.
})

app.use(limiter)
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
