export type OfferAnalytics = {
  id: number
  product_id: number
  upsell_campaign_id: number
  views_count: number
  clicks_count: number
  accepted_count: number
  revenue_generated: string
  product: unknown | null
}

export type OffersAnalyticsResponse = {
  data: OfferAnalytics[]
}
