import type { User, Users } from '../../interfaces/Users'
import { NotFoundError, PrismaError } from '../../utils/Errors'

import { prisma, Prisma } from '../../utils/Db'

export const addUserService = async (payload: User): Promise<void> => {
  const { id, name, password, username, role } = payload

  try {
    await prisma.users.create({
      data: {
        id,
        name,
        password,
        username,
        role
      }
    })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new PrismaError('Username has already taken')
      }
    }
    throw new Error(error.message as string)
  }
}

export const updateUserService = async (id: string, payload: { name: string }): Promise<void> => {
  const { name } = payload

  try {
    await prisma.users.update({
      where: {
        id
      },
      data: {
        name
      }
    })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new PrismaError('Account does not exist')
      }
    }

    throw new Error(error.message as string)
  }
}

export const deleteUserService = async (id: string): Promise<void> => {
  try {
    await prisma.users.delete({
      where: {
        id
      }
    })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new PrismaError('Account does not exist')
      }
    }

    throw new Error(error.message as string)
  }
}

export const getUsersService = async (search: string = '', limit: number): Promise<Users[]> => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        username: true
      },
      where: {
        AND: [
          {
            name: {
              contains: search
            }
          }
        ]
      },
      take: limit
    })

    return users
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new PrismaError(error.message)
    } else {
      throw new PrismaError('Server error')
    }
  }
}

export const getUserByUsernameService = async (username: string): Promise<Users[]> => {
  const user = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      username: true,
      password: true
    },
    where: {
      username
    },
    take: 1
  })

  return user
}

export const getUserByIdService = async (id: string): Promise<Users> => {
  const user = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      username: true
    },
    where: {
      id
    }
  })

  if (user.length < 1) {
    throw new NotFoundError('Account does not exist')
  }

  return user[0]
}