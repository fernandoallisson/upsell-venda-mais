export type ApiKeyType = 'pre_checkout' | 'post_purchase' | 'cart_drawer' | 'widget' | 'webhook' | 'integration'

export type ApiKey = {
  id: number
  name: string
  public_key: string
  type: ApiKeyType
  allowed_origins: string[]
  rate_limit: number
  is_active: boolean
  last_used_at: string | null
  created_at: string
  updated_at: string | null
}

export type ApiKeyWithSecret = ApiKey & {
  secret_key?: string
}

export type CreateApiKeyPayload = {
  name: string
  type: ApiKeyType
  allowed_origins: string[]
  rate_limit: number
  generate_secret: boolean
}

export type UpdateApiKeyPayload = {
  name: string
  type: ApiKeyType
  allowed_origins: string[]
  rate_limit: number
  is_active: boolean
}

export type ApiKeysResponse = {
  data: ApiKey[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}
