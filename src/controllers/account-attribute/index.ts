import type { Request, Response } from 'express'
import { logger } from '../../utils/Logger'
import { BadRequestError, NotFoundError } from '../../utils/Errors'
import {
  getOfflineSaleCapabilityService,
  setOfflineSaleCapabilityService
} from '../../services/account-atribute'
import { getUserByIdService } from '../../services/users'

export const setOfflineSaleCapability = async (req: Request, res: Response): Promise<Response> => {
  const { vendorId } = req.query

  try {
    await getUserByIdService(String(vendorId))

    if (!vendorId) {
      throw new BadRequestError('Invalid request')
    }

    const status = await setOfflineSaleCapabilityService(String(vendorId))

    return res.status(200).json({
      status: 'success',
      message: `Status kapabilitas penjualan offline menjadi ${status}`
    })
  } catch (error: any) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
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

export const getOfflineSaleCapability = async (req: Request, res: Response): Promise<Response> => {
  const { vendorId } = req.query

  try {
    await getUserByIdService(String(vendorId))

    if (!vendorId) {
      throw new BadRequestError('Invalid request')
    }

    const status = await getOfflineSaleCapabilityService(String(vendorId))

    return res.status(200).json({
      status: 'success',
      data: status
    })
  } catch (error: any) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
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
