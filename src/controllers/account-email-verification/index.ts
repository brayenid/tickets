import type { Request, Response } from 'express'
import { BadRequestError } from '../../utils/Errors'
import { sendEmailService } from '../../services/mail'
import { generateRandomNumbers } from '../../utils/NumberGenerator'
import { z } from 'zod'
import { setKeyService, verifyEmailToKey } from '../../services/email-verification'
import { nanoid } from 'nanoid'
import { getUserByEmailService } from '../../services/users'

export const addEmailVerification = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body
  const key = generateRandomNumbers()

  try {
    const payloadSchema = z.object({
      email: z.string().email()
    })

    payloadSchema.parse({ email })

    const user = await getUserByEmailService(email as string)
    if (user) {
      throw new BadRequestError('Email sudah dipakai')
    }

    await setKeyService({ email, key })
    await sendEmailService({
      target: email as string,
      subject: 'Email verification',
      message: key
    })

    return res.status(201).json({
      status: 'success',
      message: 'Token verifikasi telah dikirim ke email kamu'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof BadRequestError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
    console.log(error.message)

    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    })
  }
}

export const verifyEmailActivation = async (req: Request, res: Response): Promise<Response> => {
  const { email, token } = req.body
  const id = nanoid(16)

  const payloadSchema = z.object({
    email: z.string().email(),
    token: z.string()
  })

  try {
    payloadSchema.parse({
      email,
      token
    })
    await verifyEmailToKey({
      email,
      key: token,
      id
    })

    return res.status(200).json({
      status: 'success',
      message: 'Verifikasi email berhasil',
      data: id
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof BadRequestError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
    console.log(error.message)

    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    })
  }
}
