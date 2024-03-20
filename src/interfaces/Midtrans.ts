export interface ItemDetails {
  id: string
  orderId?: string
  quantity: number
  category: string
  price: number
  name: string
  eventPriceId?: string
}

export interface ItemsByClient {
  quantity: number
  eventPriceId: string
}

export interface ItemList extends ItemDetails {
  amount: number
  eventId: string
  userId: string
  status?: string
}

export interface Event {
  id: string
  name: string
  category: string
}

export interface Customer {
  id: string
  name: string
  email: string
  billing_address: {
    address: string
    phone?: string
  }
}

export interface MidtransPayload {
  id?: string
  quantity?: number
  price?: number
  fee?: number
  customer: Customer
  items: ItemDetails[]
}

export interface MidtransSnap {
  transaction_details: {
    order_id: string
    gross_amount: number
  }
  item_details: ItemDetails[]
  customer_details: {
    first_name: string
    email: string
    billing_address: {
      address: string
      phone?: string
    }
  }
  enabled_payments?: string[]
  shopeepay?: {
    callback_url: string
  }
  gopay?: {
    enable_callback: boolean
    callback_url: string
  }
  credit_card?: {
    secure: boolean
  }
}

export interface MidtransGopay extends MidtransSnap {
  payment_type: string
}

export interface MidtransResponse {
  token: string
  redirectUrl: string
}
