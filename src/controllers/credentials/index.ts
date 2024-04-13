import type { Request, Response } from 'express'
import { AuthError, BadRequestError, PrismaError } from '../../utils/Errors'
import { createForgetPasswordTokenService, patchPasswordService } from '../../services/credentials'
import { logger } from '../../utils/Logger'
import { z } from 'zod'

export const patchPassword = async (req: Request, res: Response): Promise<Response> => {
  const { oldPassword, newPassword } = req.body
  const session = req.session.user

  try {
    await patchPasswordService({ id: session?.id, oldPassword, newPassword })

    return res.status(200).json({
      status: 'success',
      message: 'Password berhasil diubah'
    })
  } catch (error: any) {
    if (
      error instanceof AuthError ||
      error instanceof PrismaError ||
      error instanceof BadRequestError
    ) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    logger.error(error.message)
    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}

export const createForgetPasswordToken = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body

  try {
    const payloadSchema = z.object({
      email: z.string().email()
    })

    payloadSchema.parse({
      email
    })

    await createForgetPasswordTokenService(email as string)

    return res.status(201).json({
      status: 'success',
      message: 'Kami telah mengirim tautan perubahan password ke email kamu'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError || error instanceof BadRequestError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    logger.error(error.message)
    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}
