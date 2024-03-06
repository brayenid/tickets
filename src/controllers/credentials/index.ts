import type { Request, Response } from 'express'
import { AuthError, PrismaError } from '../../utils/Errors'
import { patchPasswordService } from '../../services/credentials'
export const patchPassword = async (req: Request, res: Response): Promise<Response> => {
  const { oldPassword, newPassword } = req.body
  const session = req.session.user

  try {
    await patchPasswordService({ id: session?.id, oldPassword, newPassword })

    return res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    })
  } catch (error: any) {
    if (error instanceof AuthError || error instanceof PrismaError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}
