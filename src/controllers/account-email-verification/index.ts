import type { Request, Response } from 'express'
import { BadRequestError } from '../../utils/Errors'
import { sendEmailService } from '../../services/mail'
import { generateRandomNumbers } from '../../utils/NumberGenerator'
import { z } from 'zod'
import { redis } from '../../utils/Redis'

export const addEmailVerification = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body
  const key = generateRandomNumbers()

  try {
    const payloadSchema = z.object({
      email: z.string().email()
    })

    payloadSchema.parse({ email })
    await redis.del(`email:${email}`)
    await redis.setex(`email:${email}`, 300, String(key))

    await sendEmailService({
      target: email as string,
      subject: 'Email verification',
      message: key
    })

    return res.status(201).json({
      status: 'success',
      message: 'Verification token has sent to your email'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: error.issues
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
  const payloadSchema = z.object({
    email: z.string().email(),
    token: z.string()
  })

  try {
    payloadSchema.parse({
      email,
      token
    })
    const storedToken = await redis.get(`email:${email}`)
    if (token !== storedToken) {
      throw new BadRequestError('Invalid token')
    }

    await redis.del(`email:${email}`)

    return res.status(200).json({
      status: 'success',
      message: 'Email verifed successfully'
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
