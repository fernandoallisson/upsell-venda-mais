export type Offer = {
  id: number
  upsell_campaign_id: number
  product_id: number
  segment_id: number | null
  type: string
  discount_type: string
  discount_value: number
  headline: string
  description: string
  views_count: number
  clicks_count: number
  accepted_count: number
  revenue_generated: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type OfferResponse = Offer

export type OffersResponse = {
  current_page: number
  data: Offer[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: Array<{
    url: string | null
    label: string
    page: number | null
    active: boolean
  }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

export type CreateOfferPayload = {
  upsell_campaign_id: number
  product_id: number
  segment_id: number | null
  type: string
  discount_type: string
  discount_value: number
  headline: string
  description: string
}

export type UpdateOfferPayload = CreateOfferPayload
