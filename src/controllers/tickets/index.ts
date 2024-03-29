import type { Request, Response } from 'express'
import { getTicketByIdService, getTicketsByUserIdService } from '../../services/tickets'
import { AuthError, BadRequestError, NotFoundError } from '../../utils/Errors'
import { logger } from '../../utils/Logger'

export const getTicketsByUserId = async (req: Request, res: Response): Promise<Response> => {
  const session = req.session.user
  const { search, limit, page } = req?.query
  const pageNumber: number = page ? Number(page) : 1
  const pageLimit: number = limit ? Number(limit) : 12

  try {
    if (!session) {
      throw new BadRequestError('Invalid session')
    }
    const tickets = await getTicketsByUserIdService(session?.id, search as string, pageLimit, pageNumber)

    return res.status(200).json({
      status: 'success',
      data: tickets
    })
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    console.log(error)
    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    })
  }
}

export const getTicketsById = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params
  const session = req.session.user
  try {
    const ticket = await getTicketByIdService(ticketId)
    const accessList = ['admin', 'sudo']

    if (session?.id !== ticket.userId && !accessList.includes(String(session?.role))) {
      throw new AuthError('You are not authorized to access this resource')
    }

    return res.status(200).json({
      status: 'success',
      data: ticket
    })
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
    if (error instanceof AuthError) {
      return res.status(401).json({
        status: 'fail',
        message: error.message
      })
    }

    logger.error(error.message)
    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    })
  }
}
