import type { EventAttenders, EventPayload } from '../../interfaces/Events'
import { countAge } from '../../utils/CountAge'
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

export const getEventByIdService = async (id: string): Promise<EventPayload> => {
  const event = (await prisma.events.findUnique({
    where: {
      id
    }
  })) as EventPayload

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

export const getEventAttendersService = async (eventId: string): Promise<EventAttenders[]> => {
  const attenders = await prisma.tickets.findMany({
    select: {
      id: true,
      transaction: {
        select: {
          id: true,
          category: true,
          order: {
            select: {
              id: true,
              source: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  birth: true,
                  email: true,
                  gender: true
                }
              }
            }
          }
        }
      }
    },
    where: {
      transaction: {
        order: {
          eventId
        }
      }
    }
  })

  const attendersMapped = attenders.map((attender) => {
    return {
      ticketId: attender.id,
      user: {
        id: attender.transaction.order?.user.id ?? '',
        name: attender.transaction.order?.user.name ?? '`',
        age: countAge(attender.transaction.order?.user.birth ?? '')
      }
    }
  })

  return attendersMapped
}
