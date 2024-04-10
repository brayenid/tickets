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
          status: status ?? 'waiting'
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
      createdAt: true,
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
    createdAt: order?.createdAt,
    updatedAt: order?.updatedAt,
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

export const getsOrdersService = async (
  search: string = '',
  status: string = '',
  limit: number,
  pageNumber: number
): Promise<OrderOutput[]> => {
  const offset = (pageNumber - 1) * limit

  // Objek kriteria pencarian awal tanpa status
  let whereCriteria: any = {
    OR: [
      {
        id: {
          contains: search
        }
      },
      {
        user: {
          name: search
        }
      },
      {
        event: {
          name: search
        }
      }
    ]
  }

  // Menambahkan status ke kriteria pencarian jika status tidak falsy
  if (status) {
    whereCriteria = {
      ...whereCriteria,
      status
    }
  }

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
    orderBy: {
      updatedAt: 'desc'
    },
    where: whereCriteria, // Menggunakan kriteria pencarian yang telah dibuat
    take: limit,
    skip: offset
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

export const getsOrdersTotalService = async (
  search: string = '',
  status: string = ''
): Promise<number> => {
  let whereCriteria: any = {
    OR: [
      {
        id: {
          contains: search
        }
      },
      {
        user: {
          name: search
        }
      },
      {
        event: {
          name: search
        }
      }
    ]
  }

  // Menambahkan status ke kriteria pencarian jika status tidak falsy
  if (status) {
    whereCriteria = {
      ...whereCriteria,
      status
    }
  }

  const orders = await prisma.orders.aggregate({
    _count: {
      id: true
    },
    where: whereCriteria
  })

  return orders._count.id
}

// SETTLEMENT ORDERS ONLY
export const getOrdersByEventIdService = async (eventId: string): Promise<OrderOutput[]> => {
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
      }
    },
    where: {
      AND: [
        {
          eventId
        },
        {
          OR: [
            {
              status: 'settlement'
            },
            {
              status: 'capture'
            }
          ]
        }
      ]
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
      updatedAt: order.updatedAt
    }
  })

  return ordersMapped
}

export const getOrdersByDayService = async (eventId: string): Promise<OrderOutput[]> => {
  const whereQuery: any = {
    AND: [
      {
        OR: [
          {
            status: 'settlement'
          },
          {
            status: 'capture'
          }
        ]
      }
    ]
  }

  if (eventId) {
    whereQuery.AND.push({
      eventId
    })
  }

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
      }
    },
    where: whereQuery,
    orderBy: {
      updatedAt: 'asc'
    }
  })

  const ordersMapped = orders.map((order) => {
    return {
      id: order.id,
      status: order.status,
      source: order.source,
      eventName: order.event.name,
      updatedAt: order.updatedAt
    }
  })

  return ordersMapped
}

export const getOrdersTotalAmountService = async (
  eventId: string = '',
  source: string = ''
): Promise<number> => {
  const whereQuery: any = {
    AND: [
      {
        OR: [
          {
            order: {
              status: 'settlement'
            }
          },
          {
            order: {
              status: 'capture'
            }
          }
        ]
      }
    ]
  }

  if (eventId) {
    whereQuery.AND.push({
      order: {
        eventId
      }
    })
  }

  if (source) {
    whereQuery.AND.push({
      order: {
        source
      }
    })
  }

  const transactions = await prisma.orderItems.findMany({
    select: {
      amount: true,
      quantity: true
    },
    where: whereQuery
  })

  const totalAmount = transactions.reduce((total, transaction) => {
    return total + transaction.amount * transaction.quantity
  }, 0)

  return totalAmount
}
