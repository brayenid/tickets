/*
LOCAL ADMINISTRATOR
*/

import type { Request, Response } from 'express'
import type { UserRequestBody, User } from '../../interfaces/Users'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import {
  addUserService,
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService
} from '../../services/users'
import { BadRequestError, NotFoundError, PrismaError } from '../../utils/Errors'

export const addUser = async (req: Request, res: Response): Promise<Response> => {
  const { name, username, password, role }: UserRequestBody = req.body
  const id: string = nanoid(12)

  try {
    const payloadSchema = z.object({
      name: z.string(),
      username: z.string(),
      password: z.string(),
      role: z.string()
    })

    payloadSchema.parse({ name, username, password, role })
    const hashedPassword = await bcrypt.hash(password, 10)

    const payload: User = {
      id,
      name,
      password: hashedPassword,
      username,
      role
    }

    await addUserService(payload)

    return res.status(200).json({
      status: 'success',
      message: 'Account successfully created'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: error.issues
      })
    }

    if (error instanceof PrismaError) {
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

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params
  const { name } = req.body

  try {
    const payloadSchema = z.object({
      name: z.string()
    })

    payloadSchema.parse({
      name
    })

    await updateUserService(userId, { name })

    return res.status(200).json({
      status: 'success',
      message: 'Account updated successfully'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: error.issues
      })
    }

    if (error instanceof PrismaError) {
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

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params

  try {
    const user = await getUserByIdService(userId)
    if (user.role === 'sudo') {
      throw new BadRequestError('The one and only, your majesty, SUDO could not be deleted!')
    }
    await deleteUserService(userId)

    return res.status(200).json({
      status: 'success',
      message: 'Account successfully deleted'
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

export const getUsers = async (req: Request, res: Response): Promise<Response> => {
  const { search, limit } = req.query

  try {
    const users = await getUsersService(search as string, limit ? Number(limit) : 10)
    return res.status(200).json({
      status: 'success',
      data: users
    })
  } catch (error: any) {
    if (error instanceof PrismaError) {
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

export const getUser = async (req: Request, res: Response): Promise<Response> => {
  const session = req.session.user

  try {
    if (!session) {
      throw new Error('Invalid session')
    }

    const user = await getUserByIdService(session.id)

    return res.status(200).json({
      status: 'success',
      data: user
    })
  } catch (error: any) {
    if (error instanceof PrismaError || error instanceof NotFoundError) {
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