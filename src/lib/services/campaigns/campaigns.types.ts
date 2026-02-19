import type { Product, ProductCategory } from '../products/products.types'

export type Campaign = {
  id: number
  name: string
  priority: number
  is_active: boolean
  start_date: string
  end_date: string
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type PaginationLink = {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export type CampaignsResponse = {
  current_page: number
  data: Campaign[]

  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

export type CreateCampaignPayload = {
  name: string
  is_active?: boolean
  priority?: number
  display_locations?: string[]
  headline?: string
  description?: string
  image_url?: string
  video_url?: string
  cta_text?: string
  cta_link?: string
  cta_new_tab?: boolean
  start_date?: string
  start_time?: string
  end_date?: string
  end_time?: string
  active_days?: string[]
  active_hours?: string[]
  cooldown_minutes?: number
  max_per_session?: number
  max_per_day?: number
  max_total?: number
  block_after_conversion_days?: number
  widget_css?: string
  widget_html?: string
  segment_ids?: number[]
}

export type UpdateCampaignPayload = CreateCampaignPayload

export type DisplayLocationsResponse = Record<string, string>

export type CampaignOfferProduct = {
  id: number
  category_id: number | null
  external_id: string | null
  sku: string
  name: string
  image_url: string
  price: string
  compare_at_price: string
  cost_price: string
  is_active: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type CampaignOffer = {
  id: number
  product: CampaignOfferProduct
  type: string
  views: number
  clicks: number
  accepted: number
  rejected: number
  orders_count: number
  revenue: number
  conversion_rate: number
  click_to_accept_rate: number
  revenue_per_view: number
}

export type CampaignTotals = {
  views: number
  clicks: number
  accepted: number
  rejected: number
  revenue: number
  orders: number
  conversion_rate: number
  click_to_accept_rate: number
  revenue_per_view: number
}

export type CampaignTimeframe = {
  start: string
  end: string
}

export type CampaignDaily = {
  date: string
  views: number
  clicks: number
  accepted: number
  revenue: number
}

export type CampaignDetails = {
  campaign: Pick<
    Campaign,
    'id' | 'name' | 'priority' | 'is_active' | 'start_date' | 'end_date'
  >
  offers: CampaignOffer[]
  totals: CampaignTotals
  timeframe: CampaignTimeframe
  daily: CampaignDaily[]
}

export type CampaignProductPivot = {
  upsell_campaign_id: number
  product_id: number
  tenant_id: string | null
  created_at: string
  updated_at: string
}

export type CampaignProduct = Product & {
  category: ProductCategory | null
  pivot: CampaignProductPivot
}
