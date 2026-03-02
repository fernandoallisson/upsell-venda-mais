export type WidgetOfferParams = {
  customer_id: string
  email: string
  fingerprint: string
  product_id: string
  cart_value: string
  type: string
  location: string
}

export type WidgetTrackPayload = {
  offer_id: number
  customer_id: number
  visitor_id: string
  session_id: string
  action: string
  metadata: unknown[]
}

export type WidgetTrackBatchPayload = {
  events: string[]
}

export type WidgetVisitorSyncPayload = {
  fingerprint: string
  session_id: string
  cart_value?: number
  cart_items?: number[]
  current_page?: string
  product_id?: number
  category_id?: number
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referrer?: string
}

export type WidgetVisitorParams = {
  fingerprint: string
}
