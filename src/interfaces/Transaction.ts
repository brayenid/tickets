export interface Transaction {
  id: string
  amount: number
  eventPriceId: string | null
  category: string
  quantity?: number
  createdAt: Date
  updatedAt: Date
}
