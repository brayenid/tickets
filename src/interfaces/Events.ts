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
