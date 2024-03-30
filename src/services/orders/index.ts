import type { OrderOutput, OrderPayload } from '../../interfaces/Order'
import { Prisma, prisma } from '../../utils/Db'
import { PrismaError } from '../../utils/Errors'

export const addOrderService = async (payload: OrderPayload): Promise<void> => {
  const { id, eventId, userId, source, status } = payload

  try {
    await prisma.$transaction(async (prismaClient) => {
      await prismaClient.orders.create({
        data: {
          id,
          eventId: String(eventId),
          userId: String(userId),
          source: String(source),
          status: status ?? 'pending'
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

export const getOrderByIdService = async (id: string): Promise<OrderOutput> => {
  const order = await prisma.orders.findUnique({
    select: {
      id: true,
      status: true,
      source: true,
      userId: true,
      paymentToken: true,
      redirectUrl: true,
      event: {
        select: {
          name: true,
          thumbnail: true
        }
      },
      OrderItems: {
        select: {
          id: true,
          amount: true,
          quantity: true,
          createdAt: true,
          updatedAt: true
        }
      }
    },
    where: {
      id
    }
  })

  const orderMapped = {
    id: order?.id,
    status: order?.status,
    source: order?.source,
    userId: order?.userId,
    eventName: order?.event.name,
    eventThumbnail: order?.event.thumbnail,
    paymentToken: order?.paymentToken,
    redirectUrl: order?.redirectUrl,
    items: order?.OrderItems
  }

  return orderMapped as OrderOutput
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

export const getOrdersByUserIdService = async (userId: string): Promise<OrderOutput[]> => {
  const orders = await prisma.orders.findMany({
    select: {
      id: true,
      status: true,
      source: true,
      updatedAt: true,
      event: {
        select: {
          name: true,
          thumbnail: true
        }
      },
      OrderItems: {
        select: {
          id: true,
          amount: true,
          quantity: true,
          createdAt: true,
          updatedAt: true
        }
      }
    },
    where: {
      userId
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  const ordersMapped = orders.map((order) => {
    return {
      id: order.id,
      status: order.status,
      source: order.source,
      eventName: order.event.name,
      eventThumbnail: order.event.thumbnail,
      items: order.OrderItems,
      updatedAt: order.updatedAt
    }
  })

  return ordersMapped
}
