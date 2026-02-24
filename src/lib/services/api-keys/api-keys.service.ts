import { ApiError, apiFetch } from '../../api'
import type {
  ApiKey,
  ApiKeyWithSecret,
  ApiKeysResponse,
  ApiKeyType,
  CreateApiKeyPayload,
  UpdateApiKeyPayload,
} from './api-keys.types'

type JsonValue = Record<string, unknown> | null

const ENDPOINT = '/v1/api-keys'

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)


const asNullableString = (v: unknown): string | null => {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return v
  return null
}

const asNumber = (v: unknown, field: string): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number(v)
    if (!Number.isNaN(n)) return n
  }
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asNullableNumber = (v: unknown): number | null => {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number(v)
    if (!Number.isNaN(n)) return n
  }
  return null
}


const asStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string')
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v)
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string')
    } catch {
      // not valid JSON
    }
  }
  return []
}

const API_TYPE_MAP: Record<string, ApiKeyType> = {
  pre_checkout: 'pre_checkout',
  'pre-checkout': 'pre_checkout',
  post_purchase: 'post_purchase',
  'post-purchase': 'post_purchase',
  cart_drawer: 'cart_drawer',
  'cart-drawer': 'cart_drawer',
  widget: 'widget',
  webhook: 'webhook',
  integration: 'integration',
}

const SEND_TYPE_MAP: Record<ApiKeyType, string> = {
  pre_checkout: 'pre-checkout',
  post_purchase: 'post-purchase',
  cart_drawer: 'cart-drawer',
  widget: 'widget',
  webhook: 'webhook',
  integration: 'integration',
}

const parseApiKey = (data: unknown): ApiKey => {
  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor: api_key')

  const raw = isRecord(data.data) ? data.data : data

  const rawType = typeof raw.type === 'string' ? raw.type : ''
  const type: ApiKeyType = API_TYPE_MAP[rawType] ?? 'pre_checkout'

  return {
    id: asNumber(raw.id, 'api_key.id'),
    name: typeof raw.name === 'string' ? raw.name : '',
    public_key: typeof raw.public_key === 'string' ? raw.public_key : '',
    type,
    allowed_origins: asStringArray(raw.allowed_origins),
    rate_limit: asNullableNumber(raw.rate_limit),
    is_active: typeof raw.is_active === 'boolean'
      ? raw.is_active
      : raw.is_active === 1 || raw.is_active === '1' || raw.is_active === 'true',
    last_used_at: asNullableString(raw.last_used_at),
    created_at: asNullableString(raw.created_at) ?? '',
    updated_at: asNullableString(raw.updated_at),
  }
}

const parseApiKeyWithSecret = (data: unknown): ApiKeyWithSecret => {
  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor: api_key')

  const raw = isRecord(data.data) ? data.data : data
  const base = parseApiKey(raw)

  return {
    ...base,
    secret_key: typeof raw.secret_key === 'string' ? raw.secret_key : undefined,
  }
}

const parseApiKeysResponse = (data: JsonValue): ApiKeysResponse => {
  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor')

  const items = Array.isArray(data.data) ? data.data : []

  return {
    data: items.map(parseApiKey),
    current_page: typeof data.current_page === 'number' ? data.current_page : 1,
    last_page: typeof data.last_page === 'number' ? data.last_page : 1,
    total: typeof data.total === 'number' ? data.total : items.length,
    per_page: typeof data.per_page === 'number' ? data.per_page : items.length,
  }
}

export const getApiKeys = async (params?: {
  type?: ApiKeyType
  is_active?: boolean
}): Promise<ApiKeysResponse> => {
  const query = new URLSearchParams()
  if (params?.type) query.set('type', params.type)
  if (params?.is_active !== undefined) query.set('is_active', params.is_active ? '1' : '0')

  const qs = query.toString()
  const data = await apiFetch<JsonValue>(`${ENDPOINT}${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar chaves de API',
    networkErrorMessage: 'Falha de rede ao carregar chaves de API',
  })

  return parseApiKeysResponse(data)
}

export const getApiKeyById = async (id: number): Promise<ApiKey> => {
  const data = await apiFetch<JsonValue>(`${ENDPOINT}/${id}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar chave de API',
    networkErrorMessage: 'Falha de rede ao carregar chave de API',
  })

  return parseApiKey(data)
}

export const createApiKey = async (
  payload: CreateApiKeyPayload,
): Promise<ApiKeyWithSecret> => {
  const data = await apiFetch<JsonValue>(ENDPOINT, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ ...payload, type: SEND_TYPE_MAP[payload.type] }),
    errorMessage: 'Erro ao criar chave de API',
    networkErrorMessage: 'Falha de rede ao criar chave de API',
  })

  return parseApiKeyWithSecret(data)
}

export const updateApiKey = async (
  id: number,
  payload: UpdateApiKeyPayload,
): Promise<ApiKey> => {
  const data = await apiFetch<JsonValue>(`${ENDPOINT}/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify({ ...payload, type: SEND_TYPE_MAP[payload.type] }),
    errorMessage: 'Erro ao atualizar chave de API',
    networkErrorMessage: 'Falha de rede ao atualizar chave de API',
  })

  return parseApiKey(data)
}

export const deleteApiKey = async (id: number): Promise<void> => {
  await apiFetch<void>(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
    auth: true,
    errorMessage: 'Erro ao remover chave de API',
    networkErrorMessage: 'Falha de rede ao remover chave de API',
  })
}

export const regeneratePublicKey = async (id: number): Promise<ApiKey> => {
  const data = await apiFetch<JsonValue>(`${ENDPOINT}/${id}/regenerate-public-key`, {
    method: 'POST',
    auth: true,
    errorMessage: 'Erro ao regenerar chave pública',
    networkErrorMessage: 'Falha de rede ao regenerar chave pública',
  })

  return parseApiKey(data)
}

export const regenerateSecretKey = async (id: number): Promise<ApiKeyWithSecret> => {
  const data = await apiFetch<JsonValue>(`${ENDPOINT}/${id}/regenerate-secret-key`, {
    method: 'POST',
    auth: true,
    errorMessage: 'Erro ao regenerar chave secreta',
    networkErrorMessage: 'Falha de rede ao regenerar chave secreta',
  })

  return parseApiKeyWithSecret(data)
}

export const toggleApiKeyActive = async (id: number): Promise<ApiKey> => {
  const data = await apiFetch<JsonValue>(`${ENDPOINT}/${id}/toggle-active`, {
    method: 'POST',
    auth: true,
    errorMessage: 'Erro ao alterar status da chave',
    networkErrorMessage: 'Falha de rede ao alterar status',
  })

  return parseApiKey(data)
}
