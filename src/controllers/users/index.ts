import type { Request, Response } from 'express'
import type { UserRequestBody, User } from '../../interfaces/Users'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { addUserService } from '../../services/users'

export const addUser = async (req: Request, res: Response): Promise<Response> => {
  const { name, username, password }: User = req.body
  const id: string = nanoid(12)

  try {
    const payloadSchema = z.object({
      name: z.string(),
      username: z.string(),
      password: z.string()
    })

    payloadSchema.parse({ name, username, password })
    const hashedPassword = await bcrypt.hash(password, 10)

    const payload: UserRequestBody = {
      id,
      name,
      password: hashedPassword,
      username
    }

    await addUserService(payload)

    return res.status(200).json({
      status: 'success',
      message: 'Hello world users'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: error.issues
      })
    }

    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}
