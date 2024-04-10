import type { Request, Response } from 'express'
import type * as Midtrans from '../../interfaces/Midtrans'
import type { TicketPayload } from '../../interfaces/Tickets'
import { config } from '../../utils/Config'
import { z } from 'zod'
import { BadRequestError, NotFoundError, PrismaError } from '../../utils/Errors'
import { getEventPriceByIdService } from '../../services/event-prices'
import { addOfflineTransactionService, addTransactionService } from '../../services/transaction'
import { generateId } from '../../utils/IDGenerator'
import {
  addOrderService,
  deleteOrderService,
  getOrderByIdService,
  updateOrderService
} from '../../services/orders'
import { getEventByIdService } from '../../services/events'
import { addTicketService } from '../../services/tickets'
import { getUserByIdService } from '../../services/users'

export const addTransaction = async (req: Request, res: Response): Promise<Response> => {
  const { eventId, items } = req.body
  const session = req.session.user

  const id = generateId('OID')
  const fee = config.transaction.fee

  try {
    const eventInfo = await getEventByIdService(eventId as string)
    if (!eventInfo.isOpen) {
      throw new BadRequestError('Event tidak dibuka untuk dijual')
    }
    const currentDate = new Date()
    const eventDate = new Date(eventInfo.date)

    if (currentDate >= eventDate) {
      throw new BadRequestError('Masa penyelenggaraan event sudah lewat')
    }

    const orderSchema = z.object({
      eventId: z.string(),
      items: z.array(
        z.object({
          eventPriceId: z.string(),
          quantity: z.number()
        })
      )
    })

    orderSchema.parse({
      eventId,
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

    /* CREATE AN ORDER ID RECORD */
    await addOrderService({
      id,
      eventId,
      userId: customer.id,
      source: 'online'
    })

    /* THIS ARRAY WILL BE USED IN MIDTRANS API AND STORED TO DB */
    const itemsMapped = await Promise.all(
      items.map(async (item: Midtrans.ItemsByClient) => {
        if (!item.eventPriceId) {
          throw new Error('ID could not be empty')
        }
        const { name, price, stock } = await getEventPriceByIdService(item.eventPriceId)
        const { name: eventName } = await getEventByIdService(eventId as string)

        if (stock < 1) {
          throw new BadRequestError(`Tiket ${name} habis, ulangi pembelian`)
        }

        if (item.quantity > stock) {
          throw new BadRequestError(`Pembelian tiket ${name} melebihi stok (${stock})`)
        }

        return {
          id: generateId('TID'),
          orderId: id,
          name: eventName,
          price,
          quantity: item.quantity,
          category: name,
          eventPriceId: item.eventPriceId
        }
      })
    )

    const payload: Midtrans.MidtransPayload = {
      id,
      fee,
      customer,
      items: itemsMapped
    }

    const transactionToken = await addTransactionService(payload)
    /* UPDATE ORDER ID THAT CREATED BEFORE WITH PAYMENT TOKEN AND REDIRECT URL */
    await updateOrderService({
      id,
      paymentToken: transactionToken?.token,
      redirectUrl: transactionToken?.redirectUrl
    })

    return res.status(201).json({
      status: 'success',
      message: 'Order berhasil dibuat',
      data: {
        id,
        ...transactionToken
      }
    })
  } catch (error: any) {
    /*
    ERROR POSSIBILITY :
    - Invalid Event ID
    - Invalid Price ID
    */
    const getOrderToDelete = await getOrderByIdService(id)

    if (getOrderToDelete.id) {
      await deleteOrderService(id)
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    if (error instanceof BadRequestError) {
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

export const addOfflineTransaction = async (req: Request, res: Response): Promise<Response> => {
  const { eventId, items, userId } = req.body
  const id = generateId('OID')

  try {
    const eventInfo = await getEventByIdService(eventId as string)
    if (!eventInfo.isOpen) {
      throw new BadRequestError('Event tidak dibuka untuk dijual')
    }
    const currentDate = new Date()
    const eventDate = new Date(eventInfo.date)

    if (currentDate >= eventDate) {
      throw new BadRequestError('Masa penyelenggaraan event sudah lewat')
    }

    const orderSchema = z.object({
      userId: z.string(),
      eventId: z.string(),
      items: z.array(
        z.object({
          eventPriceId: z.string(),
          quantity: z.number()
        })
      )
    })

    orderSchema.parse({
      eventId,
      items,
      userId
    })

    const { role, name } = await getUserByIdService(userId as string)

    if (role !== 'customer') {
      throw new BadRequestError('Hanya untuk customer')
    }

    /* CREATE AN ORDER ID RECORD */
    await addOrderService({
      id,
      eventId,
      userId,
      source: 'offline',
      status: 'settlement'
    })

    /* THIS ARRAY WILL BE STORED TO DB */
    const itemsMapped: Midtrans.ItemDetails[] = await Promise.all(
      items.map(async (item: Midtrans.ItemsByClient) => {
        if (!item.eventPriceId) {
          throw new Error('ID could not be empty')
        }
        const { name, price, stock } = await getEventPriceByIdService(item.eventPriceId)
        const { name: eventName } = await getEventByIdService(eventId as string)

        if (stock < 1) {
          throw new BadRequestError(`Tiket ${name} habis`)
        }

        if (item.quantity > stock) {
          throw new BadRequestError(`Kuantitas ${name} melebihi stok (${stock})`)
        }

        return {
          id: generateId('TID'),
          orderId: id,
          name: eventName,
          price,
          quantity: item.quantity,
          category: name,
          eventPriceId: item.eventPriceId
        }
      })
    )

    await addOfflineTransactionService(itemsMapped)

    /* GENERATING TICKET(S) BASED ON TRANSACTION */
    const ticketsArr: TicketPayload[] = []

    /* LOOP THROUGH EACH TRANSACTION/ORDER ITEM OBJECT */
    for (let i = 0; i < itemsMapped.length; i++) {
      const { id, quantity } = itemsMapped[i]

      /* ANOTHER LOOP TO ADD A TICKET FOR 1 QTY */
      for (let j = 0; j < (quantity ?? 0); j++) {
        const ticketId = generateId('TX')

        ticketsArr.push({
          id: ticketId,
          transactionId: id
        })
      }
    }

    await addTicketService(ticketsArr)

    return res.status(201).json({
      status: 'success',
      message: `Pembelian untuk ${name} berhasil dibuat, silahkan cek tiket`
    })
  } catch (error: any) {
    /*
    ERROR POSSIBILITY :
    - Invalid Event ID
    - Invalid Price ID
    */
    const getOrderToDelete = await getOrderByIdService(id)

    if (getOrderToDelete.id) {
      await deleteOrderService(id)
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    if (error instanceof BadRequestError || error instanceof NotFoundError) {
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
