import type { EventPayload } from '../../interfaces/Events'
import { Prisma, prisma } from '../../utils/Db'
import { PrismaError } from '../../utils/Errors'

export const addEventService = async (payload: EventPayload): Promise<void> => {
  const { id, date, description, location, name, thumbnail } = payload

  try {
    await prisma.events.create({
      data: {
        id,
        date,
        description,
        location,
        name,
        thumbnail
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
      isOped: true,
      name: true,
      location: true,
      date: true,
      description: true,
      thumbnail: true
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

// export const updateEventService = async (payload: EventBasic) => {
//   const { id, date, description, location, name, price } = payload
// }
