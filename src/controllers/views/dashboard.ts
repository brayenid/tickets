import type { Request, Response } from 'express'

export const main = (req: Request, res: Response): void => {
  res.render('dashboard/main', {
    title: 'Dashboard',
    layout: 'dashboard'
  })
}
