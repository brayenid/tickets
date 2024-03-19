import type { Request, Response } from 'express'
import type * as Midtrans from '../../interfaces/Midtrans'
import { config } from '../../utils/Config'
import { z } from 'zod'
import { BadRequestError, PrismaError } from '../../utils/Errors'
import { getEventPriceByIdService } from '../../services/event-prices'
import { addTransactionService } from '../../services/transaction'
import { generateId } from '../../utils/IDGenerator'

export const addTransaction = async (req: Request, res: Response): Promise<Response> => {
  const { event, items } = req.body
  const session = req.session.user

  try {
    const midtransSchema = z.object({
      event: z.object({
        id: z.string(),
        name: z.string()
      }),
      items: z.array(
        z.object({
          eventPriceId: z.string(),
          quantity: z.number()
        })
      )
    })

    midtransSchema.parse({
      event,
      items
    })

    const customer: Midtrans.Customer = {
      id: session?.id ?? '',
      name: session?.name ?? '',
      email: session?.email ?? '',
      billing_address: {
        address: 'Sendawar'
      }
    }

    const id = generateId('OID')
    const fee = config.transaction.fee

    /* THIS ARRAY WILL BE USED IN MIDTRANS API AND STORED TO DB */
    const itemsMapped = await Promise.all(
      items.map(async (item: Midtrans.ItemsByClient) => {
        if (!item.eventPriceId) {
          throw new Error('ID could not be empty')
        }
        const { name, price } = await getEventPriceByIdService(item.eventPriceId)

        return {
          id: generateId('TID'),
          orderId: id,
          name: event?.name,
          price,
          quantity: item.quantity,
          category: name
        }
      })
    )

    const payload: Midtrans.MidtransPayload = {
      id,
      fee,
      customer,
      event,
      items: itemsMapped
    }

    const transactionToken = await addTransactionService(payload)

    return res.status(201).json({
      status: 'success',
      message: 'Transaction created',
      data: transactionToken
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError || error instanceof BadRequestError) {
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
