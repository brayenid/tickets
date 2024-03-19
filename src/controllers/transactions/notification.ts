import type { Request, Response } from 'express'
import { createHash } from '../../utils/Hash'
import { config } from '../../utils/Config'
import { AuthError, BadRequestError } from '../../utils/Errors'
import { logger } from '../../utils/Logger'
import { getTransactionByOrderIdService, updateTransactionByOrderIdService } from '../../services/transaction'
import { addTicketService } from '../../services/tickets'
import type { TicketPayload } from '../../interfaces/Tickets'
import { generateId } from '../../utils/IDGenerator'

export const processTransactionNotif = async (req: Request, res: Response): Promise<Response> => {
  const {
    signature_key: signatureKey,
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    transaction_status: transactionStatus,
    payment_type: source
  } = req.body
  try {
    const localMidtransKey = orderId + statusCode + grossAmount + config.midtrans.options.serverKey
    const hashedLocalMidtransKey = createHash(localMidtransKey)

    if (!signatureKey) {
      throw new BadRequestError('Invalid request')
    }

    if (signatureKey !== hashedLocalMidtransKey) {
      throw new AuthError('Invalid key, midtrans webhook request failed')
    }

    const isSettled = ['settlement', 'capture'].includes(transactionStatus as string)
    const isFailed = ['deny', 'failure'].includes(transactionStatus as string)
    const isExpired = transactionStatus === 'expire'
    const isRefunded = transactionStatus === 'refund'

    if (isSettled) {
      await updateTransactionByOrderIdService(orderId as string, 'settlement', source as string)

      const transactions = await getTransactionByOrderIdService(orderId as string)

      const ticketsArr: TicketPayload[] = []

      // LOOP THROUGH EACH TRANSACTION OBJECT
      for (let i = 0; i < transactions.length; i++) {
        const { id, quantity } = transactions[i]

        // ANOTHER LOOP TO ADD A TICKET FOR 1 QTY
        for (let j = 0; j < (quantity ?? 0); j++) {
          const ticketId = generateId('TCK')

          ticketsArr.push({
            id: ticketId,
            transactionId: id
          })
        }
      }

      await addTicketService(ticketsArr)
    } else if (isFailed) {
      await updateTransactionByOrderIdService(orderId as string, 'failed', source as string)
    } else if (isExpired) {
      await updateTransactionByOrderIdService(orderId as string, 'expired', source as string)
    } else if (isRefunded) {
      await updateTransactionByOrderIdService(orderId as string, 'refunded', source as string)
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
