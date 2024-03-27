import type { Request, Response } from 'express'

export const home = (req: Request, res: Response): void => {
  res.render('home/home', {
    title: 'Kita Loket'
  })
}
