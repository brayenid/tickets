import type { EventPayload } from '../../interfaces/Events'
import { Prisma, prisma } from '../../utils/Db'
import { BadRequestError, PrismaError } from '../../utils/Errors'

export const addEventService = async (payload: EventPayload): Promise<void> => {
  const { id, date, description, location, name, thumbnail, vendor } = payload

  try {
    await prisma.events.create({
      data: {
        id,
        date,
        description,
        location,
        name,
        thumbnail,
        vendor
      }
    })
  } catch (error: any) {
    console.log(error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new PrismaError(error.message)
    } else {
      throw new PrismaError('Server error')
    }
  }
}

export const getEventsService = async (
  search: string = '',
  limit: number,
  pageNumber: number
): Promise<EventPayload[]> => {
  const offset = (pageNumber - 1) * limit

  const events = await prisma.events.findMany({
    select: {
      id: true,
      isOpen: true,
      name: true,
      location: true,
      date: true,
      description: true,
      thumbnail: true,
      vendor: true
    },
    where: {
      OR: [
        {
          name: {
            contains: search
          }
        },
        {
          location: {
            contains: search
          }
        },
        {
          vendor: {
            contains: search
          }
        }
      ]
    },
    orderBy: [
      {
        updatedAt: 'desc'
      }
    ],
    skip: offset,
    take: limit
  })

  return events
}

export const getEventByIdService = async (id: string): Promise<EventPayload[]> => {
  const event = await prisma.events.findMany({
    where: {
      id
    }
  })

  return event
}

export const updateEventService = async (payload: EventPayload): Promise<void> => {
  const { id, date, description, location, name, vendor } = payload
  const currentTime = new Date()

  const getEventInfo = await prisma.events.findMany({
    select: {
      id: true
    },
    where: {
      id
    },
    take: 1
  })

  if (getEventInfo.length < 1) {
    throw new BadRequestError('Failed to update event, invalid ID')
  }
  await prisma.events.update({
    data: {
      date,
      description,
      location,
      name,
      updatedAt: currentTime,
      vendor
    },
    where: {
      id
    }
  })
}

export const deleteEventService = async (id: string): Promise<string> => {
  const getEventInfo = await prisma.events.findMany({
    select: {
      id: true,
      thumbnail: true
    },
    where: {
      id
    }
  })

  if (getEventInfo.length < 1) {
    throw new BadRequestError('Failed to delete event, invalid ID')
  }
  const event = await prisma.events.delete({
    select: {
      thumbnail: true
    },
    where: {
      id
    }
  })

  return event.thumbnail
}
