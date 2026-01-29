export type OrderPreferences = {
  sms: boolean
  newsletter: boolean
}

export type OrderCustomer = {
  id: number
  tenant_id: string
  external_id: string
  email: string
  phone: string
  first_name: string
  last_name: string
  total_orders_count: number
  lifetime_value: string
  average_ticket: string
  last_purchase_at: string
  lifecycle_stage: string
  preferences: OrderPreferences
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: number
  order_id: number
  product_id: number
  is_upsell: boolean
  upsell_offer_id: number | null
  product_name: string
  quantity: number
  price: string
  total: string
  attribution_meta: unknown | null
  created_at: string
  updated_at: string
}

export type OrderUtm = {
  id: number
  order_id: number
  source: string
  medium: string
  campaign: string
  term: string | null
  content: string | null
  created_at: string
  updated_at: string
}

export type Order = {
  id: number
  tenant_id: string
  customer_id: number
  external_id: string
  total_amount: string
  subtotal_amount: string
  currency: string
  status: string
  placed_at: string
  created_at: string
  updated_at: string
  customer: OrderCustomer
  items: OrderItem[]
  utm: OrderUtm | null
}

export type OrdersResponse = {
  data: Order[]

  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null

  next_page_url: string | null
  prev_page_url: string | null
}
