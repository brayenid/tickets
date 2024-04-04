import type { EventAttenders, EventPayload, EventStatus } from '../../interfaces/Events'
import { countAge } from '../../utils/helpers/CountAge'
import { Prisma, prisma } from '../../utils/Db'
import { BadRequestError, PrismaError } from '../../utils/Errors'
import { redis } from '../../utils/Redis'

export const addEventService = async (payload: EventPayload): Promise<void> => {
  const { id, date, description, location, name, thumbnail, vendorId } = payload

  try {
    await prisma.events.create({
      data: {
        id,
        date,
        description,
        location,
        name,
        thumbnail,
        vendorId: vendorId ?? ''
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
      Vendor: {
        select: {
          name: true
        }
      },
      EventPrices: {
        select: {
          price: true
        },
        orderBy: {
          grade: 'asc'
        },
        take: 1
      }
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
          Vendor: {
            name: {
              contains: search
            }
          }
        }
      ]
    },
    orderBy: [
      {
        createdAt: 'desc'
      }
    ],
    skip: offset,
    take: limit
  })

  const eventsMapped = events.map((event) => {
    return {
      id: event.id,
      isOpen: event.isOpen,
      name: event.name,
      location: event.location,
      date: event.date,
      description: event.description,
      thumbnail: event.thumbnail,
      vendor: event.Vendor.name,
      lowestPrice: event.EventPrices[0]?.price ?? 0
    }
  })

  return eventsMapped
}

export const getEventByIdService = async (id: string): Promise<EventPayload> => {
  const event = await prisma.events.findUnique({
    select: {
      id: true,
      isOpen: true,
      name: true,
      location: true,
      date: true,
      description: true,
      thumbnail: true,
      Vendor: {
        select: {
          name: true,
          id: true
        }
      }
    },
    where: {
      id
    }
  })
  const eventMapped = {
    id: event?.id ?? '',
    isOpen: event?.isOpen ?? true,
    name: event?.name ?? '',
    location: event?.location ?? '',
    date: event?.date ?? '',
    description: event?.description ?? '',
    thumbnail: event?.thumbnail ?? '',
    vendor: event?.Vendor.name ?? '',
    vendorId: event?.Vendor.id ?? ''
  }

  return eventMapped
}

export const updateEventService = async (payload: EventPayload): Promise<void> => {
  const { id, date, description, location, name, vendorId, thumbnail, isOpen } = payload
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
      vendorId,
      thumbnail,
      isOpen
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
  // Retrieve a list of attenders for a particular event from the database
  const attenders = await prisma.tickets.findMany({
    // Select specific fields from the database
    select: {
      id: true,
      isActive: true,
      // Select transaction details
      transaction: {
        select: {
          id: true,
          category: true,
          // Select order details
          order: {
            select: {
              id: true,
              source: true,
              // Select user details associated with the order
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
    // Filter the attenders based on the eventId
    where: {
      transaction: {
        order: {
          eventId // Assuming eventId is a variable containing the ID of the event
        }
      }
    }
  })

  const attendersMapped = attenders.map((attender) => {
    return {
      ticketId: attender.id,
      category: attender.transaction.category,
      isActive: attender.isActive,
      user: {
        id: attender.transaction.order?.user.id ?? '',
        name: attender.transaction.order?.user.name ?? '`',
        age: countAge(attender.transaction.order?.user.birth ?? ''),
        gender: attender.transaction.order?.user.gender ?? ''
      }
    }
  })

  return attendersMapped
}

export const getEventStatusService = async (eventId: string): Promise<EventStatus> => {
  const event = await prisma.events.findUniqueOrThrow({
    select: {
      isOpen: true
    },
    where: {
      id: eventId
    }
  })

  return event
}

export const getEventsTotalService = async (
  search: string = '',
  page: number = 0,
  limit: number = 0
): Promise<number> => {
  let eventsTotal: number = 0

  if (page || limit || search) {
    const eventTotalFromDb = await prisma.events.aggregate({
      _count: {
        id: true
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
            Vendor: {
              name: {
                contains: search
              }
            }
          }
        ]
      }
    })

    eventsTotal = eventTotalFromDb._count.id
  } else {
    const eventsFromCache = await redis.get('events:total')

    if (eventsFromCache) {
      eventsTotal = Number(eventsFromCache)
    } else {
      const eventTotalFromDb = await prisma.events.aggregate({
        _count: {
          id: true
        }
      })

      eventsTotal = eventTotalFromDb._count.id
      await redis.setex('events:total', 900, eventsTotal)
    }
  }

  return eventsTotal
}
