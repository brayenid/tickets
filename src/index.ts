import express, { type Express, type Request, type Response } from 'express'
import dotenv from 'dotenv'
import apiRoutes from './routes/api'
import viewsRoute from './routes/views'
import session from 'express-session'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import { prisma } from './utils/Db'
import { create } from 'express-handlebars'
import { limit } from './utils/RateLimiter'
import { loopTimes, formatDate, addCurrencySeparator } from './utils/helpers/HbsHelpers'
import { authStatus } from './middlewares/AuthStatus'

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

dotenv.config()

const app: Express = express()
const port: number | string = process.env.PORT ?? 3000
const limiter = limit(300)

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
app.use(authStatus)

/* Make a new handlebars obj. */
const hbs = create({
  helpers: {
    loopTimes,
    formatDate,
    addCurrencySeparator
  }
})

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')
app.set('views', './src/views')

app.use('/api', apiRoutes)
app.use('/', viewsRoute)

app.use((req: Request, res: Response) => {
  res.render('errors/not-found', {
    layout: 'plain'
  })
})

app.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`)
})
