import type { OrderPayload } from '../../interfaces/Order'
import { Prisma, prisma } from '../../utils/Db'
import { PrismaError } from '../../utils/Errors'

export const addOrderService = async (payload: OrderPayload): Promise<void> => {
  const { id, eventId, userId, source } = payload

  try {
    await prisma.$transaction(async (prismaClient) => {
      await prismaClient.orders.create({
        data: {
          id,
          eventId: String(eventId),
          userId: String(userId),
          source: String(source)
        }
      })
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003' || error.code === 'P2028') {
        throw new PrismaError('Invalid request')
      }
    }
    console.log(error)
  }
}

export const updateOrderService = async (payload: OrderPayload): Promise<void> => {
  const { id, paymentToken, redirectUrl } = payload
  const currentTime = new Date()

  await prisma.orders.update({
    data: {
      paymentToken,
      redirectUrl,
      updatedAt: currentTime
    },
    where: {
      id
    }
  })
}

export const updateOrderStatusService = async (payload: OrderPayload): Promise<void> => {
  const { id, source, status } = payload
  const currentTime = new Date()

  await prisma.orders.update({
    data: {
      status,
      source,
      updatedAt: currentTime
    },
    where: {
      id
    }
  })
}

export const deleteOrderService = async (id: string): Promise<void> => {
  await prisma.orders.delete({
    where: {
      id
    }
  })
}
