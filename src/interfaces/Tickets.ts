interface TicketEvent {
  name: string | undefined
  date: string | undefined
}

export interface TicketPayload {
  id?: string
  transactionId: string
  isActive?: boolean
  event?: TicketEvent
}

export interface TicketOutput {
  id: string
  transactionId: string
  orderId?: string
  category: string
  userId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  event: {
    id: string
    name: string
    date: string
    thumbnail: string
    location?: string
  }
}

export interface TicketOutputSimple {
  id: string
  category: string
}
