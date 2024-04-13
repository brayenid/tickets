import type { Request, Response } from 'express'
import {
  getActiveTicketsService,
  getTicketByIdService,
  getTicketsByCategoryService,
  getTicketsByUserIdService,
  ticketActivationService
} from '../../services/tickets'
import { AuthError, BadRequestError, NotFoundError } from '../../utils/Errors'
import { logger } from '../../utils/Logger'
import { groupByTixCatFreq } from '../../utils/helpers/GroupByTicketCat'
import { generateTicketDirectRes } from '../../utils/TicketPDFGenerator'
import { z } from 'zod'
import { getEventByIdService } from '../../services/events'

export const getTicketsByUserId = async (req: Request, res: Response): Promise<Response> => {
  const session = req.session.user
  const { search, limit, page } = req?.query
  const pageNumber: number = page ? Number(page) : 1
  const pageLimit: number = limit ? Number(limit) : 12

  try {
    if (!session) {
      throw new BadRequestError('Invalid session')
    }
    const tickets = await getTicketsByUserIdService(
      String(session?.id),
      search as string,
      pageLimit,
      pageNumber
    )

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
      throw new AuthError('Kamu tidak memiliki akses melihat sumber daya ini')
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

export const getTicketsByCategory = async (req: Request, res: Response): Promise<Response> => {
  const { eventId } = req.params

  try {
    const ticketCats = await getTicketsByCategoryService(eventId)
    const ticketCatsMapped = groupByTixCatFreq(ticketCats)

    return res.status(200).json({
      status: 'success',
      data: ticketCatsMapped
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

export const ticketToPdfDirect = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  const { ticketId } = req.params
  const session = req.session.user
  try {
    const accessList = ['admin', 'sudo']
    const ticket = await getTicketByIdService(ticketId)
    const eventInfo = await getEventByIdService(ticket.event.id)
    const isEventOwner = req.session.user?.id === eventInfo.vendorId
    const isNotPermitted = !accessList.includes(String(session?.role))

    if (session?.id !== ticket.userId && isNotPermitted && !isEventOwner) {
      throw new AuthError('Kamu tidak memiliki akses melihat sumber daya ini')
    }

    const ticketBuffer = await generateTicketDirectRes(ticket)
    const fileName = `${ticketId}_${Date.now()}_DRCT.pdf`

    res
      .status(200)
      .type('pdf')
      .set('Content-Disposition', `attachment; filename="${fileName}"`)
      .send(ticketBuffer)
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({
        status: 'fail',
        message: error.message
      })
    }
    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    })
  }
}

export const ticketActivation = async (req: Request, res: Response): Promise<Response> => {
  const { eventId, ticketId } = req.body
  const session = req.session.user

  const payloadSchema = z.object({
    eventId: z.string(),
    ticketId: z.string()
  })

  try {
    payloadSchema.parse({
      eventId,
      ticketId
    })

    const eventDetail = await getEventByIdService(eventId as string)

    const accessList = ['admin', 'sudo']
    if (session?.id !== eventDetail.vendorId && !accessList.includes(String(session?.role))) {
      throw new AuthError('Kamu tidak memiliki akses melihat sumber daya ini')
    }

    await ticketActivationService(ticketId as string, eventId as string)

    return res.status(200).json({
      status: 'success',
      message: 'Tiket aktif'
    })
  } catch (error: any) {
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
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

export const getActiveTickets = async (req: Request, res: Response): Promise<Response> => {
  const { eventId } = req.query
  const session = req.session.user

  try {
    if (!eventId) {
      throw new BadRequestError('Sertakan event ID')
    }

    const eventDetail = await getEventByIdService(eventId as string)

    const accessList = ['admin', 'sudo']
    if (session?.id !== eventDetail.vendorId && !accessList.includes(String(session?.role))) {
      throw new AuthError('Kamu tidak memiliki akses melihat sumber daya ini')
    }

    const tickets = await getActiveTicketsService(eventId as string, 10)

    return res.status(200).json({
      status: 'success',
      data: tickets
    })
  } catch (error: any) {
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
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
