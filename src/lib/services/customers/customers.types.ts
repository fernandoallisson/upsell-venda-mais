import type { SegmentRules } from '../segments/segments.types'

export type CustomerPreferences = {
  sms: boolean
  newsletter: boolean
}

export type CustomerSegment = {
  id: number
  name: string
  rules: SegmentRules
  created_at: string
  updated_at: string
  pivot?: {
    customer_id: number
    segment_id: number
  }
}

export type Customer = {
  id: number
  tenant_id: string | null
  external_id: string | null
  email: string
  birth_date: string | null
  phone: string
  first_name: string
  last_name: string
  total_orders_count: number
  lifetime_value: string
  average_ticket: string
  last_purchase_at: string | null
  lifecycle_stage: string
  preferences: CustomerPreferences
  created_at: string
  updated_at: string
  segments: CustomerSegment[]
}

export type PaginationLink = {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export type CustomersResponse = {
  current_page: number
  data: Customer[]
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

export type CustomerPayload = {
  external_id: string | null
  email: string
  birth_date: string | null
  phone: string
  first_name: string
  last_name: string
  preferences: CustomerPreferences
  segments: number[] // <- envia como número, que é o mais seguro pro backend
}
