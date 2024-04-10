import { MidtransError } from 'midtrans-client'
import type {
  MidtransPayload,
  MidtransSnap,
  MidtransResponse,
  ItemDetails
} from '../../interfaces/Midtrans'
import { prisma } from '../../utils/Db'
import { midtrans } from '../../utils/Midtrans'
import type { Transaction } from '../../interfaces/Transaction'
import { logger } from '../../utils/Logger'

export const addTransactionService = async (
  payload: MidtransPayload
): Promise<MidtransResponse | undefined> => {
  const { id, fee, customer, items } = payload

  /* SUM TOTAL PRICE OF ITEMS AND ADD FEE */
  const countTotalAmount = items.reduce((a, b) => {
    return a + b.price * b.quantity
  }, 0)

  /* RE-MAP ARRAY OF ITEMS THAT FE SENT AND WILL BE USED IN MIDTRANS API */
  const itemsMidtransMapped = items.map((item) => {
    return {
      id: item.id,
      name: `${item.name} - ${item.category}`,
      category: item.category,
      price: item.price,
      quantity: item.quantity
    }
  })

  /* THIS WILL PASS TO MIDTRANS API AS ARG. */
  const midtransPayload: MidtransSnap = {
    transaction_details: {
      order_id: String(id),
      gross_amount: countTotalAmount + Number(fee)
    },
    item_details: [
      ...itemsMidtransMapped,
      {
        id: `FEE-${id}`,
        name: 'Transaction Fee',
        category: 'Fee',
        price: Number(fee),
        quantity: 1
      }
    ],
    customer_details: {
      first_name: customer.name,
      email: customer.email,
      billing_address: {
        address: customer.billing_address.address
      }
    },
    credit_card: {
      secure: true
    }
  }

  /* RE-MAP ARRAY OF ITEMS THAT FE SENT, AND WILL BE STORED TO DB */
  const itemsForDBMapped = items.map((item) => {
    return {
      id: item.id,
      orderId: item.orderId ?? '',
      amount: item.price,
      quantity: item.quantity,
      category: item.category,
      eventPriceId: item.eventPriceId
    }
  })

  let transactionToken: MidtransResponse = {
    token: '',
    redirectUrl: ''
  }

  try {
    /* PRISMA TRANSACTION */
    await prisma.$transaction(async (prismaClient) => {
      for (const item of itemsForDBMapped) {
        await prismaClient.orderItems.create({
          data: {
            id: item.id,
            orderId: item.orderId,
            amount: item.amount,
            eventPriceId: item.eventPriceId,
            quantity: item.quantity,
            category: item.category
          }
        })
      }

      const { token, redirect_url: redirectUrl } = await midtrans.createTransaction(midtransPayload)

      if (!token || !redirectUrl) {
        throw new Error('Server error')
      }

      transactionToken = {
        token: token ?? '',
        redirectUrl: redirectUrl ?? ''
      }
    })

    return transactionToken
  } catch (error: any) {
    logger.error(`Add transaction : ${error.message}`)

    if (error instanceof MidtransError) {
      throw new Error('Server error')
    }

    throw new Error('Server error')
  }
}

export const addOfflineTransactionService = async (items: ItemDetails[]): Promise<void> => {
  /* RE-MAP ARRAY OF ITEMS THAT FE SENT, AND WILL BE STORED TO DB */
  const itemsForDBMapped = items.map((item) => {
    return {
      id: item.id,
      orderId: item.orderId ?? '',
      amount: item.price,
      quantity: item.quantity,
      category: item.category,
      eventPriceId: item.eventPriceId
    }
  })
  try {
    /* PRISMA TRANSACTION */
    await prisma.$transaction(async (prismaClient) => {
      for (const item of itemsForDBMapped) {
        await prismaClient.orderItems.create({
          data: {
            id: item.id,
            orderId: item.orderId,
            amount: item.amount,
            eventPriceId: item.eventPriceId,
            quantity: item.quantity,
            category: item.category
          }
        })

        await prismaClient.eventPrices.update({
          data: {
            stock: {
              decrement: item.quantity
            }
          },
          where: {
            id: item.eventPriceId
          }
        })
      }
    })
  } catch (error: any) {
    logger.error(`Add transaction : ${error.message}`)

    if (error instanceof MidtransError) {
      throw new Error('Server error')
    }

    throw new Error('Server error')
  }
}

export const getTransactionByOrderIdService = async (orderId: string): Promise<Transaction[]> => {
  const transactions = await prisma.orderItems.findMany({
    where: {
      orderId
    }
  })

  return transactions
}

export const getTransactionsAmountTotalService = async (eventId: string): Promise<number> => {
  const total = await prisma.orderItems.aggregate({
    _sum: {
      amount: true
    },
    where: {
      order: {
        AND: [
          {
            OR: [
              {
                status: 'settlement'
              },
              {
                status: 'capture'
              }
            ]
          },
          {
            event: {
              id: eventId
            }
          }
        ]
      }
    }
  })

  return total._sum.amount ?? 0
}
