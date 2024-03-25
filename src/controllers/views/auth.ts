import type { Request, Response } from 'express'

export const loginPage = (req: Request, res: Response): void => {
  res.render('auth/login', {
    title: 'Login',
    layout: 'plain'
  })
}

export const registerPage = (req: Request, res: Response): void => {
  res.render('auth/register', {
    title: 'Register',
    layout: 'plain'
  })
}
