import type { TicketOutput, TicketOutputSimple, TicketPayload } from '../../interfaces/Tickets'
import { prisma } from '../../utils/Db'
import { BadRequestError, NotFoundError } from '../../utils/Errors'

export const addTicketService = async (transactions: TicketPayload[]): Promise<void> => {
  await prisma.$transaction(async (prismaClient) => {
    for (const tickets of transactions) {
      await prismaClient.tickets.create({
        data: {
          id: tickets.id ?? '',
          transactionId: tickets.transactionId
        }
      })
    }
  })
}

export const getTicketsByUserIdService = async (
  userId: string,
  search: string = '',
  limit: number,
  pageNumber: number
): Promise<TicketOutput[]> => {
  const offset = (pageNumber - 1) * limit
  const tickets = await prisma.tickets.findMany({
    where: {
      AND: [
        {
          transaction: {
            order: {
              userId
            }
          }
        },
        search ? { transaction: { order: { event: { name: { contains: search } } } } } : {} // Search condition
      ]
    },
    take: limit,
    skip: offset,
    include: {
      transaction: {
        select: {
          category: true,
          order: {
            select: {
              event: {
                select: {
                  id: true,
                  name: true,
                  date: true,
                  thumbnail: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedTickets = tickets.map((ticket) => ({
    id: ticket.id ?? '',
    transactionId: ticket.transactionId,
    category: ticket.transaction.category,
    isActive: ticket.isActive,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    event: {
      id: ticket.transaction.order?.event.id ?? '',
      name: ticket.transaction.order?.event.name ?? '',
      date: ticket.transaction.order?.event.date ?? '',
      thumbnail: ticket.transaction.order?.event.thumbnail ?? ''
    }
  }))
  return formattedTickets
}

export const getTicketByIdService = async (ticketId: string): Promise<TicketOutput> => {
  try {
    const ticket = await prisma.tickets.findUniqueOrThrow({
      where: { id: ticketId },
      include: {
        transaction: {
          select: {
            category: true,
            order: {
              select: {
                id: true,
                userId: true,
                event: {
                  select: {
                    id: true,
                    name: true,
                    date: true,
                    thumbnail: true,
                    location: true
                  }
                }
              }
            }
          }
        }
      }
    })

    const formattedTickets: TicketOutput = {
      id: ticket?.id ?? '',
      transactionId: ticket?.transactionId,
      orderId: ticket.transaction.order?.id,
      category: ticket?.transaction.category,
      isActive: ticket?.isActive,
      userId: ticket?.transaction.order?.userId,
      createdAt: ticket?.createdAt,
      updatedAt: ticket?.updatedAt,
      event: {
        id: ticket?.transaction.order?.event.id ?? '',
        name: ticket?.transaction.order?.event.name ?? '',
        date: ticket?.transaction.order?.event.date ?? '',
        thumbnail: ticket.transaction.order?.event.thumbnail ?? '',
        location: ticket.transaction.order?.event.location ?? ''
      }
    }
    return formattedTickets
  } catch (error: any) {
    throw new NotFoundError('Invalid ticket')
  }
}

export const getTicketsByCategoryService = async (
  eventId: string
): Promise<TicketOutputSimple[]> => {
  const tickets = await prisma.tickets.findMany({
    select: {
      id: true,
      transaction: {
        select: {
          category: true
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

  const ticketsMapped = tickets.map((tix) => {
    return {
      id: tix.id,
      category: tix.transaction.category
    }
  })

  return ticketsMapped
}

export const getTicketsService = async (
  search: string = '',
  limit: number,
  pageNumber: number
): Promise<TicketOutput[]> => {
  const offset = (pageNumber - 1) * limit

  const tickets = await prisma.tickets.findMany({
    where: {
      OR: [
        {
          id: {
            contains: search
          }
        },
        {
          transaction: {
            order: {
              eventId: {
                contains: search
              }
            }
          }
        },
        {
          transaction: {
            orderId: {
              contains: search
            }
          }
        }
      ]
    },
    take: limit,
    skip: offset,
    include: {
      transaction: {
        select: {
          category: true,
          order: {
            select: {
              event: {
                select: {
                  id: true,
                  name: true,
                  date: true,
                  thumbnail: true
                }
              },
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedTickets = tickets.map((ticket) => ({
    id: ticket.id ?? '',
    transactionId: ticket.transactionId,
    category: ticket.transaction.category,
    isActive: ticket.isActive,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    user: ticket.transaction.order?.user.name,
    event: {
      id: ticket.transaction.order?.event.id ?? '',
      name: ticket.transaction.order?.event.name ?? '',
      date: ticket.transaction.order?.event.date ?? '',
      thumbnail: ticket.transaction.order?.event.thumbnail ?? ''
    }
  }))
  return formattedTickets
}

export const getTicketTotalService = async (search: string = ''): Promise<number> => {
  const total = await prisma.tickets.aggregate({
    _count: {
      id: true
    },
    where: {
      OR: [
        {
          id: {
            contains: search
          }
        },
        {
          transaction: {
            order: {
              eventId: {
                contains: search
              }
            }
          }
        },
        {
          transaction: {
            orderId: {
              contains: search
            }
          }
        }
      ]
    }
  })

  return total._count.id
}

export const ticketActivationService = async (
  ticketId: string,
  eventId: string
): Promise<string> => {
  const ticket = await prisma.tickets.findFirst({
    select: {
      id: true,
      isActive: true
    },
    where: {
      AND: [
        {
          id: ticketId
        },
        {
          transaction: {
            order: {
              eventId
            }
          }
        }
      ]
    }
  })

  if (!ticket) {
    throw new BadRequestError('Tiket tidak valid')
  }

  if (ticket.isActive) {
    throw new BadRequestError('Tiket sudah diaktivasi')
  }

  const validatedTicket = await prisma.tickets.update({
    select: {
      id: true,
      transaction: {
        select: {
          order: {
            select: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    },
    where: {
      id: ticketId,
      transaction: {
        order: {
          eventId
        }
      }
    },
    data: {
      isActive: true,
      updatedAt: new Date()
    }
  })

  return validatedTicket.transaction.order?.user.name ?? ''
}

export const getActiveTicketsService = async (
  eventId: string = '',
  limit: number = 10
): Promise<TicketOutput[]> => {
  const tickets = await prisma.tickets.findMany({
    include: {
      transaction: {
        select: {
          category: true,
          order: {
            select: {
              event: {
                select: {
                  id: true,
                  name: true,
                  date: true,
                  thumbnail: true
                }
              },
              user: {
                select: {
                  name: true
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
      },
      isActive: true
    },
    take: limit,
    orderBy: {
      updatedAt: 'desc'
    }
  })

  const formattedTickets = tickets.map((ticket) => ({
    id: ticket.id ?? '',
    transactionId: ticket.transactionId,
    category: ticket.transaction.category,
    isActive: ticket.isActive,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    user: ticket.transaction.order?.user.name,
    event: {
      id: ticket.transaction.order?.event.id ?? '',
      name: ticket.transaction.order?.event.name ?? '',
      date: ticket.transaction.order?.event.date ?? '',
      thumbnail: ticket.transaction.order?.event.thumbnail ?? ''
    }
  }))
  return formattedTickets
}

// VENDOR SIDE
export const getTicketsServiceVendor = async (
  search: string = '',
  limit: number,
  pageNumber: number,
  vendorId: string
): Promise<TicketOutput[]> => {
  const offset = (pageNumber - 1) * limit

  const tickets = await prisma.tickets.findMany({
    where: {
      OR: [
        {
          id: {
            contains: search
          }
        },
        {
          transaction: {
            order: {
              eventId: {
                contains: search
              }
            }
          }
        },
        {
          transaction: {
            orderId: {
              contains: search
            }
          }
        }
      ],
      transaction: {
        order: {
          event: {
            vendorId
          }
        }
      }
    },
    take: limit,
    skip: offset,
    include: {
      transaction: {
        select: {
          category: true,
          order: {
            select: {
              event: {
                select: {
                  id: true,
                  name: true,
                  date: true,
                  thumbnail: true
                }
              },
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedTickets = tickets.map((ticket) => ({
    id: ticket.id ?? '',
    transactionId: ticket.transactionId,
    category: ticket.transaction.category,
    isActive: ticket.isActive,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    user: ticket.transaction.order?.user.name,
    event: {
      id: ticket.transaction.order?.event.id ?? '',
      name: ticket.transaction.order?.event.name ?? '',
      date: ticket.transaction.order?.event.date ?? '',
      thumbnail: ticket.transaction.order?.event.thumbnail ?? ''
    }
  }))
  return formattedTickets
}

export const getTicketTotalServiceVendor = async (
  search: string = '',
  vendorId: string
): Promise<number> => {
  const total = await prisma.tickets.aggregate({
    _count: {
      id: true
    },
    where: {
      OR: [
        {
          id: {
            contains: search
          }
        },
        {
          transaction: {
            order: {
              eventId: {
                contains: search
              }
            }
          }
        },
        {
          transaction: {
            orderId: {
              contains: search
            }
          }
        }
      ],
      transaction: {
        order: {
          event: {
            vendorId
          }
        }
      }
    }
  })

  return total._count.id
}
