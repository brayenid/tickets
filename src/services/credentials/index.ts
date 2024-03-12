import type { Credential } from '../../interfaces/Credentials'
import { prisma } from '../../utils/Db'
import { PrismaError, AuthError } from '../../utils/Errors'
import bcrypt from 'bcrypt'

export const patchPasswordService = async (payload: Credential): Promise<void> => {
  const { id, newPassword, oldPassword } = payload
  const currentTime = new Date()

  const account = await prisma.users.findUnique({
    where: {
      id
    },
    select: {
      password: true
    }
  })

  if (!account) {
    throw new PrismaError('Account does not exist')
  }

  const isMatched = await bcrypt.compare(oldPassword, account.password)

  if (!isMatched) {
    throw new AuthError('Password is not matched')
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.users.update({
    data: {
      password: newHashedPassword,
      updatedAt: currentTime
    },
    where: {
      id
    }
  })
}
