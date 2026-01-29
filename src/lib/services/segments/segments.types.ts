export type SegmentRule = {
  value: number | string
  operator: string
}

export type Segment = {
  id: number
  tenant_id: string
  name: string
  rules: Record<string, SegmentRule>
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
