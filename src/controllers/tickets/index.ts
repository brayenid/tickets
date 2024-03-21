import type { Request, Response } from 'express'
import { getTicketsByUserIdService } from '../../services/tickets'
import { BadRequestError } from '../../utils/Errors'

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
