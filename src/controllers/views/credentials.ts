import type { Request, Response } from 'express'
import { verifyForgetTokenService } from '../../services/credentials'
import { BadRequestError } from '../../utils/Errors'

export const patchPassword = (req: Request, res: Response): void => {
  res.render('credential/change-password', {
    title: 'Change Password'
  })
}

export const forgetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, token } = req.query

  if (!email || !token) {
    res.status(404).render('errors/not-found', {
      title: 404,
      layout: 'plain'
    })
    return
  }

  try {
    await verifyForgetTokenService(email as string, token as string)

    res.render('credential/forget-password', {
      title: 'Lupa Password',
      layout: 'plain',
      email: String(email),
      token: String(token)
    })
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      res.status(404).render('errors/not-found', {
        title: 404,
        layout: 'plain'
      })
    }
  }
}
