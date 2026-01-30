export type Category = {
  id: number
  tenant_id: string | null
  external_id: string | null
  name: string
  created_at: string
  updated_at: string
}

export type PaginationLink = {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export type CategoriesResponse = {
  current_page: number
  data: Category[]

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

export type CreateCategoryPayload = {
  name: string
  external_id: string
}

export type UpdateCategoryPayload = {
  name: string
  external_id: string
}
