export interface EventBasic {
  name: string
  vendor: string
  location: string
  date: string
  description: string
  thumbnail?: string
}

export interface EventPayload extends EventBasic {
  id: string
  isOpen?: boolean
}

export interface EventAttenders {
  ticketId: string
  category?: string
  isActive?: boolean
  user: {
    id: string
    name: string
    age: number
    gender?: string
  }
}

export interface EventStatus {
  isSale: boolean
  isOpen: boolean
}
