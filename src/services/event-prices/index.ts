import type { EventPricePayload } from '../../interfaces/EventPrice'
import { Prisma, prisma } from '../../utils/Db'
import { BadRequestError, PrismaError } from '../../utils/Errors'

export const addEventPriceService = async (payload: EventPricePayload): Promise<void> => {
  try {
    const { id, name, eventId, price } = payload

    await prisma.eventPrices.create({
      data: {
        id,
        name,
        price,
        eventId
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
      eventId: true
    },
    where: {
      id
    },
    take: 1
  })

  return eventPrices as EventPricePayload
}

export const getEventPriceByEventIdService = async (eventId: string): Promise<EventPricePayload[]> => {
  const eventPrices = await prisma.eventPrices.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      eventId: true
    },
    where: {
      eventId
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
