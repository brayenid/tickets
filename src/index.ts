import express, { type Express } from 'express'
import dotenv from 'dotenv'
import apiRoutes from './routes/api'

dotenv.config()

const app: Express = express()
const port: number | string = process.env.PORT ?? 3000

app.use(express.json())
app.use('/api', apiRoutes)

app.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`)
})
