import type { Request, Response } from 'express'
import { getOrderByIdService } from '../../services/orders'

export const orders = (req: Request, res: Response): void => {
  const paths = [
    {
      label: 'Daftar Order',
      url: '/user/orders'
    }
  ]
  res.render('orders/orders', {
    title: 'Ordermu',
    paths
  })
}

export const orderDetail = async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params
  const order = await getOrderByIdService(orderId)

  const session = req.session.user

  if (order.userId !== session?.id) {
    res.status(401).render('errors/not-auth', {
      title: '401',
      layout: 'plain'
    })

    return
  }

  const paths = [
    {
      label: 'Daftar Order',
      url: '/user/orders'
    },
    {
      label: 'Detail Order',
      url: `/user/orders/${orderId}`
    }
  ]

  const settlementIssues = ['settlement', 'capture', 'expired', 'cancel', 'deny']
  const isOrderSettled = !!settlementIssues.includes(order.status)
  const isOrderPending = order.status === 'pending'

  res.render('orders/order-detail', {
    title: 'Order Detail',
    order,
    paths,
    isOrderSettled,
    isOrderPending
  })
}
