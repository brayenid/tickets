import type { TicketPayload } from '../../interfaces/Tickets'
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
