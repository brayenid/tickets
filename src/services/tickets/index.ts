import type { TicketOutput, TicketPayload } from '../../interfaces/Tickets'
import { prisma } from '../../utils/Db'

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
                  date: true
                }
              }
            }
          }
        }
      }
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
      date: ticket.transaction.order?.event.date ?? ''
    }
  }))
  return formattedTickets
}
