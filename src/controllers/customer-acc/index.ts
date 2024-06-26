import type { Request, Response } from 'express'
import type { User, UserRequestBody } from '../../interfaces/Users'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { addUserService, updateUserService } from '../../services/users'
import { BadRequestError, PrismaError } from '../../utils/Errors'
import { verifyEmailToTokenId } from '../../services/email-verification'
import { generateIdSimple } from '../../utils/IDGenerator'

/*
Only for customer, but for several functions,
it uses the same functions as the "users" used
(not directly inhereted)
*/

export const addCustomer = async (req: Request, res: Response): Promise<Response> => {
  const { name, email, password, address, birth, registerId, gender }: UserRequestBody = req.body
  const id: string = generateIdSimple(24)

  try {
    const payloadSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
      birth: z.string(),
      address: z.string(),
      registerId: z.string(),
      gender: z.string()
    })

    payloadSchema.parse({ name, email, password, address, birth, registerId, gender })

    await verifyEmailToTokenId({ email, id: registerId })

    const hashedPassword = await bcrypt.hash(password, 10)

    const payload: User = {
      id,
      name,
      password: hashedPassword,
      email,
      role: 'customer',
      address,
      birth,
      isActive: true,
      gender
    }

    await addUserService(payload)

    return res.status(200).json({
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

    if (error instanceof PrismaError || error instanceof BadRequestError) {
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

export const updateCustomer = async (req: Request, res: Response): Promise<Response> => {
  const session = req.session.user
  const { name, birth, address } = req.body

  try {
    const payloadSchema = z.object({
      name: z.string(),
      birth: z.string(),
      address: z.string()
    })

    payloadSchema.parse({
      name,
      birth,
      address
    })

    await updateUserService(session?.id, { name, address, birth })

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

    console.log(error.message)

    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    })
  }
}
