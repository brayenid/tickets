import type { Request, Response } from 'express'
import { AuthError, PrismaError, BadRequestError } from '../../utils/Errors'
import { getUserByEmailService } from '../../services/users'
import bcrypt from 'bcrypt'
import { z } from 'zod'

export const addSession = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body

  try {
    const payloadSchema = z.object({
      email: z.string(),
      password: z.string()
    })

    payloadSchema.parse({
      email,
      password
    })

    if (req.session.user) {
      throw new BadRequestError('You are logged in')
    }

    const user = await getUserByEmailService(email as string)

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Account does not exist'
      })
    }

    if (!user.password) {
      throw new Error('Password is undefined')
    }

    const isMatched = await bcrypt.compare(password as string, user.password)

    if (!isMatched) {
      throw new AuthError('Password is not matched')
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }

    return res.status(200).json({
      status: 'success',
      message: 'Login successfully'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }
    if (error instanceof PrismaError || error instanceof BadRequestError || error instanceof AuthError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    })
  }
}

export const removeSession = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req.session

  try {
    if (!user) {
      throw new BadRequestError('Invalid request, You are not logged in.')
    }

    req.session.destroy((err: any) => {
      if (err) {
        throw new BadRequestError(err as string)
      }
    })

    return res.status(200).clearCookie('ticket.session').json({
      status: 'success',
      message: 'Logged out successfully'
    })
  } catch (error: any) {
    if (error instanceof PrismaError || error instanceof BadRequestError) {
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
