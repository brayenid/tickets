import type { Request, Response } from 'express'
import { getTicketByIdService } from '../../services/tickets'
import { AuthError } from '../../utils/Errors'

export const tickets = (req: Request, res: Response): void => {
  const paths = [
    {
      label: 'Daftar Tiket',
      url: '/user/tickets'
    }
  ]

  res.render('tickets/tickets', {
    title: 'Tiketmu',
    paths
  })
}

export const ticketDetail = async (req: Request, res: Response): Promise<void> => {
  const session = req.session.user
  const { ticketId } = req.params
  const ticket = await getTicketByIdService(ticketId)
  const paths = [
    {
      label: 'Daftar Tiket',
      url: '/user/tickets'
    },
    {
      label: `Ticket ${ticket.event.name}`,
      url: `/user/tickets/${ticketId}`
    }
  ]

  try {
    if (session?.id !== ticket.userId) {
      throw new AuthError('Unauthorized')
    }

    res.render('tickets/ticket-detail', {
      title: `${ticket.event.name} Ticket`,
      paths,
      ticket
    })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).render('errors/not-auth')
    }
  }
}
