import type { NextFunction, Request, Response } from 'express'

export const authStatus = (req: Request, res: Response, next: NextFunction): any => {
  res.locals.user = req.session?.user ?? false

  next()
}
