import type { Request, Response } from 'express'

export const loginPage = (req: Request, res: Response): void => {
  res.render('auth/login', {
    title: 'Masuk',
    layout: 'plain'
  })
}

export const registerPage = (req: Request, res: Response): void => {
  res.render('auth/register', {
    title: 'Daftar',
    layout: 'plain'
  })
}

export const forgetPage = (req: Request, res: Response): void => {
  res.render('auth/forget', {
    title: 'Lupa Password',
    layout: 'plain'
  })
}
