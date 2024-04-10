import type { EventPricePayload } from '../../interfaces/EventPrice'
import { Prisma, prisma } from '../../utils/Db'
import { BadRequestError, PrismaError } from '../../utils/Errors'

type Operation = 'min' | 'add'

export const addEventPriceService = async (payload: EventPricePayload): Promise<void> => {
  try {
    const { id, name, eventId, price, stock, grade } = payload

    await prisma.eventPrices.create({
      data: {
        id: String(id),
        name,
        price,
        eventId,
        stock,
        grade
      }
    })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        throw new PrismaError('Invalid Event ID')
      }
    } else {
      throw new PrismaError('Server error')
    }
  }
}

export const getEventPriceByIdService = async (id: string): Promise<EventPricePayload> => {
  const eventPrices = await prisma.eventPrices.findFirst({
    select: {
      id: true,
      name: true,
      price: true,
      eventId: true,
      stock: true,
      grade: true
    },
    where: {
      id
    },
    take: 1
  })

  if (!eventPrices) {
    throw new PrismaError('Invalid event price')
  }

  return eventPrices as EventPricePayload
}

export const getEventPriceByEventIdService = async (
  eventId: string
): Promise<EventPricePayload[]> => {
  const eventPrices = await prisma.eventPrices.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      eventId: true,
      stock: true,
      grade: true
    },
    where: {
      eventId
    },
    orderBy: {
      grade: 'desc'
    }
  })

  return eventPrices
}

export const deleteEventPriceService = async (id: string): Promise<void> => {
  const eventPrice = await prisma.eventPrices.findMany({
    select: {
      id: true
    },
    where: {
      id
    },
    take: 1
  })

  if (eventPrice.length < 1) {
    throw new BadRequestError('Failed to delete event price. Invalid ID')
  }

  await prisma.eventPrices.delete({
    where: {
      id
    }
  })
}

export const operateEventPriceStocKService = async (
  eventPriceId: string,
  operation: Operation
): Promise<void> => {
  if (operation === 'min') {
    await prisma.eventPrices.update({
      data: {
        stock: {
          decrement: 1
        }
      },
      where: {
        id: eventPriceId
      }
    })
  } else if (operation === 'add') {
    await prisma.eventPrices.update({
      data: {
        stock: {
          increment: 1
        }
      },
      where: {
        id: eventPriceId
      }
    })
  }
}

export const updateEventPriceService = async (
  eventPriceId: string,
  payload: EventPricePayload
): Promise<void> => {
  const { name, price, stock, grade } = payload

  await prisma.eventPrices.update({
    data: {
      name,
      price,
      grade,
      stock,
      updatedAt: new Date()
    },
    where: {
      id: eventPriceId
    }
  })
}
