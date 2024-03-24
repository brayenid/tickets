export interface OrderPayload {
  id: string
  paymentToken?: string
  redirectUrl?: string
  status?: string
  source?: string
  userId?: string
  eventId?: string
}

interface OrderOutputItems {
  id: string
  amount: number
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderOutput {
  id: string
  source: string
  status: string
  eventName: string
  userId?: string
  paymentToken?: string
  redirectUrl?: string
  items: OrderOutputItems[]
}
