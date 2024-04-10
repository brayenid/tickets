import type { User, Users, UserUpdate } from '../../interfaces/Users'
import { BadRequestError, NotFoundError, PrismaError } from '../../utils/Errors'

import { prisma, Prisma } from '../../utils/Db'
import { redis } from '../../utils/Redis'

export const addUserService = async (payload: User): Promise<void> => {
  const { id, name, password, email, role, isActive, address, birth, gender, phone } = payload

  try {
    await prisma.users.create({
      data: {
        id,
        name,
        password,
        email,
        role,
        isActive,
        address,
        birth,
        gender,
        phone
      }
    })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new PrismaError('Email has already taken')
      }
    }
    throw new Error(error.message as string)
  }
}

export const updateUserService = async (
  id: string | undefined,
  payload: UserUpdate
): Promise<void> => {
  const { name, address, birth } = payload
  const currentTime = new Date()

  try {
    await prisma.users.update({
      where: {
        id
      },
      data: {
        name,
        address,
        birth,
        updatedAt: currentTime
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

export const getUserByEmailService = async (email: string): Promise<Users | null> => {
  const user = await prisma.users.findUnique({
    select: {
      id: true,
      name: true,
      role: true,
      email: true,
      password: true
    },
    where: {
      email
    }
  })

  return user
}

export const getUserByIdService = async (id: string): Promise<Users> => {
  const user = await prisma.users.findUnique({
    select: {
      id: true,
      name: true,
      role: true,
      email: true
    },
    where: {
      id
    }
  })

  if (!user) {
    throw new NotFoundError('Account does not exist')
  }

  return user
}

export const createSudoService = async (payload: User): Promise<void> => {
  const { id, name, password, role, email } = payload
  const sudo = await prisma.users.findMany({
    where: {
      role: 'sudo'
    },
    take: 1
  })

  if (sudo.length > 0) {
    throw new BadRequestError('Creating sudo fail, it is already existed')
  }

  await prisma.users.create({
    data: {
      id,
      name,
      password,
      role,
      email
    }
  })
}

export const resetUserPasswordService = async (id: string, password: string): Promise<void> => {
  const currentTime = new Date()

  await prisma.users.update({
    data: {
      password,
      updatedAt: currentTime
    },
    where: {
      id
    }
  })
}

export const getUserCompleteService = async (id: string, role: string): Promise<Users> => {
  const user = await prisma.users.findUnique({
    select: {
      id: true,
      name: true,
      role: true,
      email: true,
      birth: true,
      address: true,
      phone: true
    },
    where: {
      id,
      role
    }
  })

  if (!user) {
    throw new NotFoundError('User does not exist')
  }

  return user
}

export const getUsersByRoleService = async (
  search: string = '',
  role: string,
  limit: number = 9,
  pageNumber: number = 1
): Promise<Users[]> => {
  const offset = (pageNumber - 1) * limit
  const vendors = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      email: true
    },
    where: {
      AND: [
        {
          role
        },
        {
          OR: [
            {
              id: {
                contains: search
              }
            },
            {
              name: {
                contains: search
              }
            }
          ]
        }
      ]
    },
    skip: offset,
    take: limit,
    orderBy: {
      createdAt: 'desc'
    }
  })

  return vendors
}

export const getUsersByRoleTotalService = async (
  search: string = '',
  role: string,
  page: number = 0,
  limit: number = 0
): Promise<number> => {
  let vendorsTotal: number = 0

  if (page || limit || search) {
    const vendorsTotalFromDb = await prisma.users.aggregate({
      _count: {
        id: true
      },
      where: {
        name: {
          contains: search
        },
        role
      }
    })

    vendorsTotal = vendorsTotalFromDb._count.id
  } else {
    const eventsFromCache = await redis.get(`${role}s:total`)

    if (eventsFromCache) {
      vendorsTotal = Number(eventsFromCache)
    } else {
      const vendorsTotalFromDb = await prisma.users.aggregate({
        _count: {
          id: true
        },
        where: {
          role
        }
      })

      vendorsTotal = vendorsTotalFromDb._count.id
      await redis.setex(`${role}s:total`, 900, vendorsTotal)
    }
  }

  return vendorsTotal
}
