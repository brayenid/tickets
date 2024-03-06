import type { Request, Response } from 'express'
import { AuthError, PrismaError, BadRequestError } from '../../utils/Errors'
import { getUserByUsernameService } from '../../services/users'
import bcrypt from 'bcrypt'

export const addSession = async (req: Request, res: Response): Promise<Response> => {
  const { username, password } = req.body

  try {
    if (req.session.user) {
      throw new BadRequestError('You are logged in')
    }

    const user = await getUserByUsernameService(username as string)

    if (user.length < 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Account does not exist'
      })
    }

    if (!user[0].password) {
      throw new Error('Password is undefined')
    }

    const isMatched = await bcrypt.compare(password as string, user[0].password)

    if (!isMatched) {
      throw new AuthError('Password is not matched')
    }

    req.session.user = {
      id: user[0].id,
      username: user[0].username,
      name: user[0].name,
      role: user[0].role
    }

    return res.status(200).json({
      status: 'success',
      message: 'Login successfully'
    })
  } catch (error: any) {
    if (error instanceof PrismaError || error instanceof BadRequestError || error instanceof AuthError) {
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
