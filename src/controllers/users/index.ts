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
  createSudoService,
  deleteUserService,
  getUserByIdService,
  getUsersByRoleService,
  resetUserPasswordByEmailService,
  resetUserPasswordService,
  updateUserService
} from '../../services/users'
import { BadRequestError, NotFoundError, PrismaError } from '../../utils/Errors'
import { logger } from '../../utils/Logger'
import { deleteForgetTokenService, verifyForgetTokenService } from '../../services/credentials'

export const addUser = async (req: Request, res: Response): Promise<Response> => {
  const { name, email, password, role, address, birth, phone }: UserRequestBody = req.body
  const id: string = nanoid(24)

  try {
    const payloadSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
      role: z.string()
    })

    payloadSchema.parse({ name, email, password, role })
    const hashedPassword = await bcrypt.hash(password, 10)

    const payload: User = {
      id,
      name,
      password: hashedPassword,
      email,
      role,
      isActive: true,
      address: address ?? 'Sendawar',
      birth: birth ?? '1970-01-01',
      phone: phone ?? '0'
    }

    await addUserService(payload)

    return res.status(201).json({
      status: 'success',
      message: 'Akun berhasil dibuat'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError) {
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

    await updateUserService(userId, {
      name,
      address: '0',
      birth: '1970-01-01'
    })

    return res.status(200).json({
      status: 'success',
      message: 'Akun berhasil diubah'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError) {
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

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params

  try {
    const user = await getUserByIdService(userId)
    if (user.role === 'sudo') {
      throw new BadRequestError('Super admin tidak bisa dihapus')
    }
    await deleteUserService(userId)

    return res.status(200).json({
      status: 'success',
      message: 'Akun berhasil dihapus'
    })
  } catch (error: any) {
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

    logger.error(error.message)
    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}

export const createSudo = async (req: Request, res: Response): Promise<Response> => {
  const email = String(process.env.SUDO_USERNAME)
  const password = String(process.env.SUDO_PASSWORD)

  const hashedPassword = await bcrypt.hash(password, 10)
  const id = nanoid(12)

  try {
    await createSudoService({
      id,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'sudo',
      email
    })

    return res.status(201).json({
      status: 'success',
      message: 'Sudo created successfully'
    })
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({
        status: 'fail',
        error: error.message
      })
    }

    return res.status(500).json({
      status: 'fail',
      error: error.message
    })
  }
}

export const resetUserPassword = async (req: Request, res: Response): Promise<Response> => {
  const { id, password } = req.body
  const hashedPassword = await bcrypt.hash(password as string, 10)

  try {
    await resetUserPasswordService(id as string, hashedPassword)

    return res.status(200).json({
      status: 'success',
      message: 'Password berhasil diubah'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    logger.error(error.message)
    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    })
  }
}

/**
 * ONLY FOR FORGET PASSWORD PROCEDURE
 */
export const resetUserPasswordByEmail = async (req: Request, res: Response): Promise<Response> => {
  const { email, forgetToken, password } = req.body

  try {
    const payloadSchema = z.object({
      email: z.string().email(),
      forgetToken: z.string(),
      password: z.string()
    })

    payloadSchema.parse({
      email,
      forgetToken,
      password
    })

    const hashedPassword = await bcrypt.hash(password as string, 10)

    await verifyForgetTokenService(email as string, forgetToken as string)
    await resetUserPasswordByEmailService(email as string, hashedPassword)
    await deleteForgetTokenService(email as string)

    return res.status(200).json({
      status: 'success',
      message: 'Password berhasil diubah'
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
      message: 'Server error'
    })
  }
}

export const getUsers = async (req: Request, res: Response): Promise<Response> => {
  const { search, role } = req.query

  const searchQ = search ? String(search) : ''
  const roleQ = role ? String(role) : 'customer'

  try {
    const users = await getUsersByRoleService(searchQ, roleQ)

    return res.status(200).json({
      status: 'success',
      data: users
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError) {
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
