export type WidgetConfig = Record<string, unknown>

export type Widget = {
  id: number
  title: string
  slug: string
  config: WidgetConfig
  css: string
  html: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type PaginationMeta = {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export type WidgetListResponse = {
  data: Widget[]
  meta: PaginationMeta
}

export type WidgetDetailsResponse = {
  data: Widget
}

export type CreateWidgetPayload = {
  title: string
  config: WidgetConfig
  css: string
  html: string
  is_active?: boolean
}

export type UpdateWidgetPayload = Partial<CreateWidgetPayload>

export type WidgetListParams = {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
  sort?: 'created_at' | 'title' | 'slug'
  order?: 'asc' | 'desc'
  with_trashed?: boolean
}

export type WidgetApiValidationErrors = Record<string, string[]>
