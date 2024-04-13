import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit'
import { config } from './Config'
import type { Request, Response } from 'express'

/**
 * Express rate limiter
 * @param request accept number to limit request per minutes
 * @returns  return RateLimitRequestHandler
 */
export const limit = (request: number): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    limit: request, // Limit each IP to 100 requests per `window` (here, per 1 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    validate: {
      trustProxy: true
      // xForwardedForHeader: config.env !== 'dev'
    },
    handler: (req: Request, res: Response): Response => {
      return res.status(429).json({
        status: 'fail',
        message: 'Too many request'
      })
    }
  })
}
