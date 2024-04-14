import type { Request, Response } from 'express'

export const termsAndConditions = (req: Request, res: Response): void => {
  const paths = [
    {
      label: 'Syarat dan Ketentuan Penggunaan',
      url: '/toc'
    }
  ]

  res.render('policies/tac', {
    title: 'Syarat dan Ketentuan Penggunaan',
    paths
  })
}
