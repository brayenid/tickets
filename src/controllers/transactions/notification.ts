import type { Request, Response } from 'express'
import { createHash } from '../../utils/Hash'
import { config } from '../../utils/Config'
import { AuthError } from '../../utils/Errors'
import { logger } from '../../utils/Logger'

export const processTransactionNotif = async (req: Request, res: Response): Promise<Response> => {
  const {
    signature_key: signatureKey,
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount
  } = req.body
  try {
    const localMidtransKey = orderId + statusCode + grossAmount + config.midtrans.options.serverKey
    const hashedLocalMidtransKey = createHash(localMidtransKey)

    if (signatureKey !== hashedLocalMidtransKey) {
      throw new AuthError('Invalid key, midtrans webhook request failed')
    }

    return res.status(200).json({
      status: 'success'
    })
  } catch (error: any) {
    logger.error(error.message)

    if (error instanceof AuthError) {
      return res.status(403).json({
        status: 'fail'
      })
    }

    return res.status(400).json({
      status: 'fail'
    })
  }
}
