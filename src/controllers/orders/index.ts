import type { Request, Response } from 'express'
import { AuthError, BadRequestError, PrismaError } from '../../utils/Errors'
import { logger } from '../../utils/Logger'
import {
  getOrderByIdService,
  getOrdersByDayService,
  getOrdersByEventIdService,
  getOrdersByUserIdService
} from '../../services/orders'
import { groupByOrdersSource } from '../../utils/helpers/GroupOrdersSource'
import { groupByDay } from '../../utils/helpers/GroupByTime'
import { getTransactionsAmountTotalService } from '../../services/transaction'

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

export const getOrdersByEventIdSource = async (req: Request, res: Response): Promise<Response> => {
  const { eventId } = req.params

  try {
    const orders = await getOrdersByEventIdService(eventId)

    const ordersBySourceMapped = orders.map((order) => {
      return {
        source: order.source ?? ''
      }
    })

    const ordersBySource = groupByOrdersSource(ordersBySourceMapped)

    return res.status(200).json({
      status: 'success',
      data: ordersBySource
    })
  } catch (error: any) {
    if (error instanceof BadRequestError || error instanceof PrismaError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}

export const getOrdersByDay = async (req: Request, res: Response): Promise<Response> => {
  const { eventId } = req.params

  try {
    const orders = await getOrdersByDayService(eventId)
    const transactionsAmount = await getTransactionsAmountTotalService(eventId)
    const ordersByDayMapped = groupByDay(orders)

    const orderTotal = ordersByDayMapped.reduce((a, b) => {
      return a + b.freq
    }, 0)

    return res.status(200).json({
      status: 'success',
      data: ordersByDayMapped,
      meta: {
        total: orderTotal,
        amount: transactionsAmount
      }
    })
  } catch (error: any) {
    if (error instanceof BadRequestError || error instanceof PrismaError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}
