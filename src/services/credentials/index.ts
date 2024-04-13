import type { Credential } from '../../interfaces/Credentials'
import { prisma } from '../../utils/Db'
import { PrismaError, AuthError, BadRequestError } from '../../utils/Errors'
import bcrypt from 'bcrypt'
import { getUserByEmailService } from '../users'
import { generateIdSimple } from '../../utils/IDGenerator'
import { redis } from '../../utils/Redis'
import { sendEmailService } from '../mail'
import { config } from '../../utils/Config'

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

export const createForgetPasswordTokenService = async (email: string): Promise<void> => {
  const user = await getUserByEmailService(email)

  if (!user) {
    throw new BadRequestError('Akun tidak ditemukan')
  }

  const token = generateIdSimple(52)

  await redis.setex(`forget:${user.email}`, 300, token)

  await sendEmailService({
    target: user.email,
    subject: 'Kita Loket - Lupa Password',
    message: `<a href="${config.protocol}/${config.host}/credential/forget?token=${token}&email=${user.email}" target="_blank">Reset Password</a>`,
    msgHeader: 'Reset Password',
    msgBody: 'Silahkan klik tautan di bawah ini untuk me-reset password anda'
  })
}

export const verifyForgetTokenService = async (
  email: string,
  inputToken: string
): Promise<void> => {
  const token = await redis.get(`forget:${email}`)
  if (!token) {
    throw new BadRequestError('Permintaan tidak valid')
  }

  if (inputToken !== token) {
    throw new BadRequestError('Token tidak sesuai')
  }
}

export const deleteForgetTokenService = async (email: string): Promise<void> => {
  await redis.del(`forget:${email}`)
}
