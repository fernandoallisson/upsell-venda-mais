export type User = {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  tenant_id: string | null
}

export type UserListItem = {
  id: number
  name: string
  email: string
  created_at: string
}

export type PaginationLink = {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export type UsersResponse = {
  current_page: number
  data: UserListItem[]

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

export type CreateUserPayload = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export type UpdateUserPayload = {
  name: string
  email: string
  password?: string
  password_confirmation?: string
}
