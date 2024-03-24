import type { Request, Response } from 'express'
import { createHash } from '../../utils/Hash'
import { config } from '../../utils/Config'
import { AuthError, BadRequestError } from '../../utils/Errors'
import { logger } from '../../utils/Logger'
import { getTransactionByOrderIdService } from '../../services/transaction'
import { addTicketService } from '../../services/tickets'
import type { TicketPayload } from '../../interfaces/Tickets'
import { generateId } from '../../utils/IDGenerator'
import { operateEventPriceStocKService } from '../../services/event-prices'
import type { Transaction } from '../../interfaces/Transaction'
import { updateOrderStatusService } from '../../services/orders'

/**
 *
 * This will undo event price stock value
 */
const operateStock = async (transactions: Transaction[]): Promise<void> => {
  // LOOP THROUGH EACH TRANSACTION OBJECT
  for (let i = 0; i < transactions.length; i++) {
    const { quantity, eventPriceId } = transactions[i]

    // ANOTHER LOOP TO DO AN OPERATION
    for (let j = 0; j < (quantity ?? 0); j++) {
      await operateEventPriceStocKService(eventPriceId ?? '', 'add')
    }
  }
}

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
      await updateOrderStatusService({
        id: orderId,
        source,
        status: 'settlement'
      })

      const transactions = await getTransactionByOrderIdService(orderId as string)

      const ticketsArr: TicketPayload[] = []

      // LOOP THROUGH EACH TRANSACTION/ORDER ITEM OBJECT
      for (let i = 0; i < transactions.length; i++) {
        const { id, quantity } = transactions[i]

        // ANOTHER LOOP TO ADD A TICKET FOR 1 QTY
        for (let j = 0; j < (quantity ?? 0); j++) {
          const ticketId = generateId('TX')

          ticketsArr.push({
            id: ticketId,
            transactionId: id
          })
        }
      }

      await addTicketService(ticketsArr)
    } else if (isFailed) {
      await updateOrderStatusService({
        id: orderId,
        source,
        status: 'failed'
      })

      const transactions = await getTransactionByOrderIdService(orderId as string)

      await operateStock(transactions)
    } else if (isExpired) {
      await updateOrderStatusService({
        id: orderId,
        source,
        status: 'expired'
      })

      const transactions = await getTransactionByOrderIdService(orderId as string)

      await operateStock(transactions)
    } else if (isRefunded) {
      await updateOrderStatusService({
        id: orderId,
        source,
        status: 'refunded'
      })
    }

    return res.status(200).json({
      status: 'success'
    })
  } catch (error: any) {
    logger.error(`Notification webhook : ${error.message}`)

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
