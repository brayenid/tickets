export interface Transaction {
  id: string
  orderId: string
  amount: number
  category: string
  eventId: string
  source: string
  userId: string
  status: string
  quantity?: number
  createdAt: Date
  updatedAt: Date
}
