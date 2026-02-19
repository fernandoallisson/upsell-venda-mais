export type ProductCategory = {
  id: number
  tenant_id: string | null
  external_id: string | null
  name: string
  created_at: string
  updated_at: string
}

export type Product = {
  id: number
  tenant_id: string | null
  category_id: number | null
  external_id: string | null
  sku: string
  name: string
  image_url: string | null
  price: string
  compare_at_price: string
  cost_price: string
  is_active: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
  category: ProductCategory | null
}

export type PaginationLink = {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export type ProductsResponse = {
  current_page: number
  data: Product[]

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

export type CreateProductPayload = {
  category_id: number
  external_id: string
  sku: string
  name: string
  image_url: string
  price: number
  compare_at_price: number
  cost_price: number
  is_active: boolean
}

export type UpdateProductPayload = Omit<CreateProductPayload, 'image_url'> & {
  image_url?: string
}
