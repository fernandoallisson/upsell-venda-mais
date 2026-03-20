export type WidgetConfigAttributes = Record<string, unknown>

export type WidgetConfig = {
  name: string
  slug: string
  attributes: WidgetConfigAttributes
}

export type Widget = {
  id: string
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

export type WidgetFormPayload = {
  title: string
  config: WidgetConfig
  css: string
  html: string
  is_active?: boolean
}

export type CreateWidgetPayload = WidgetFormPayload

export type UpdateWidgetFormPayload = Partial<WidgetFormPayload>

export type UpdateWidgetPayload = Partial<CreateWidgetPayload>

export type WidgetListParams = {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
  sort?: 'created_at' | 'title' | 'slug'
  order?: 'asc' | 'desc'
}

export type WidgetApiValidationErrors = Record<string, string[]>
