import { PrismaClient, Prisma } from '@prisma/client'
import type { UserRequestBody } from '../../interfaces/Users'

const prisma = new PrismaClient()

export const addUserService = async (payload: UserRequestBody): Promise<void> => {
  const { id, name, password, username } = payload

  try {
    await prisma.users.create({
      data: {
        id,
        name,
        password,
        username
      }
    })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('Username has already taken')
      }
    }
    throw new Error(error.message as string)
  }
}
