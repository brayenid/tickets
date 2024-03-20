import type { OrderPayload } from '../../interfaces/Order'
import { prisma } from '../../utils/Db'

export const addOrderService = async (payload: OrderPayload): Promise<void> => {
  const { id, eventId, userId } = payload

  try {
    await prisma.$transaction(async (prismaClient) => {
      await prismaClient.orders.create({
        data: {
          id,
          eventId: String(eventId),
          userId: String(userId)
        }
      })
    })
  } catch (error) {
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
