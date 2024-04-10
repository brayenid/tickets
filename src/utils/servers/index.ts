import express, { type Express } from 'express'
import { Server } from 'socket.io'
import http from 'http'

export const app: Express = express()
export const server = http.createServer(app)
export const io = new Server(server)
