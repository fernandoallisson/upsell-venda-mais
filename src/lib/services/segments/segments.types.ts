export type SegmentRule = {
  value: number | string
  operator: string
}

export type SegmentRuleObject = {
  filter: string
  [key: string]: unknown
}

export type SegmentRules =
  | Record<string, SegmentRule>
  | string[]
  | SegmentRuleObject[]

export type Segment = {
  id: number
  tenant_id: string | null
  name: string
  rules: SegmentRules
  created_at: string
  updated_at: string
}

export type PaginationLink = {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export type SegmentsResponse = {
  current_page: number
  data: Segment[]

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

export type SegmentRulesPayload =
  | Array<Record<string, unknown>>
  | Record<string, unknown>

export type CreateSegmentPayload = {
  name: string
  rules: SegmentRulesPayload
}

export type UpdateSegmentPayload = {
  name: string
  rules: SegmentRulesPayload
}
