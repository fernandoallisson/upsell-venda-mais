export type OfferAnalytics = {
  id: number
  product_id: number
  upsell_campaign_id: number
  views_count: number
  clicks_count: number
  accepted_count: number
  revenue_generated: string
  product: unknown | null
  product_name?: string
  campaign_name?: string
}

export type OffersAnalyticsResponse = {
  data: OfferAnalytics[]
}

export type AnalyticsOverviewResponse = {
  orders_count: number
  revenue: string
  avg_ticket: string
}
