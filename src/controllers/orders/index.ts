import type { Request, Response } from 'express'
import { AuthError, BadRequestError } from '../../utils/Errors'
import { logger } from '../../utils/Logger'
import { getOrderByIdService, getOrdersByUserIdService } from '../../services/orders'

export const getOrdersByUserId = async (req: Request, res: Response): Promise<Response> => {
  const session = req.session.user

  try {
    const orders = await getOrdersByUserIdService(String(session?.id))

    return res.status(200).json({
      status: 'success',
      data: orders
    })
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({
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

export const getOrderById = async (req: Request, res: Response): Promise<Response> => {
  const { orderId } = req.params

  const session = req.session.user
  try {
    const order = await getOrderByIdService(orderId)

    if (!order.id) {
      throw new BadRequestError('Invalid order ID')
    }
    const accessList = ['admin', 'sudo']

    if (session?.id !== order.userId && !accessList.includes(String(session?.role))) {
      throw new AuthError('You are not authorized to access this resource')
    }

    return res.status(200).json({
      status: 'success',
      data: order
    })
  } catch (error: any) {
    if (error instanceof BadRequestError) {
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
