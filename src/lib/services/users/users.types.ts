export type User = {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  tenant_id: string
}

export type UpdateUserPayload = {
  name: string
  email: string
  password?: string
  password_confirmation?: string
}
