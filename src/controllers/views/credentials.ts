import type { Request, Response } from 'express'

export const patchPassword = (req: Request, res: Response): void => {
  res.render('credential/change-password', {
    title: 'Change Password'
  })
}
