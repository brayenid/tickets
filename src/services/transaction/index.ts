import { MidtransError } from 'midtrans-client'
import type { MidtransPayload, MidtransSnap, MidtransResponse } from '../../interfaces/Midtrans'
import { prisma } from '../../utils/Db'
import { midtrans } from '../../utils/Midtrans'
import type { Transaction } from '../../interfaces/Transaction'

export const addTransactionService = async (payload: MidtransPayload): Promise<MidtransResponse | undefined> => {
  const { id, fee, customer, event, items } = payload

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

  try {
    /* RE-MAP ARRAY OF ITEMS THAT FE SENT, AND WILL BE STORED TO DB */
    const itemsForDBMapped = items.map((item) => {
      return {
        id: item.id,
        orderId: item.orderId ?? '',
        amount: item.price,
        quantity: item.quantity,
        eventId: event.id,
        userId: customer.id,
        category: item.category,
        source: 'online'
      }
    })

    let transactionToken: MidtransResponse = {
      token: '',
      redirectUrl: ''
    }

    /* PRISMA TRANSACTION */
    await prisma.$transaction(async (prismaClient) => {
      for (const item of itemsForDBMapped) {
        await prismaClient.transactions.create({
          data: item
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
    console.log(error)

    if (error instanceof MidtransError) {
      throw new Error('Server error')
    }

    throw new Error('Server error')
  }
}

export const updateTransactionByOrderIdService = async (
  orderId: string,
  status: string,
  source: string
): Promise<void> => {
  const currentTime = new Date()
  await prisma.transactions.updateMany({
    data: {
      status,
      source,
      updatedAt: currentTime
    },
    where: {
      orderId
    }
  })
}

export const getTransactionByOrderIdService = async (orderId: string): Promise<Transaction[]> => {
  const transactions = await prisma.transactions.findMany({
    where: {
      orderId
    }
  })

  return transactions
}
