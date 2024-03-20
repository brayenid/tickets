export interface OrderPayload {
  id: string
  paymentToken?: string
  redirectUrl?: string
  status?: string
  source?: string
  userId?: string
  eventId?: string
}
