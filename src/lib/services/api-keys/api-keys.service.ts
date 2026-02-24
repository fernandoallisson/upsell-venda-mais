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

const asString = (v: unknown, field: string): string => {
  if (typeof v === 'string') return v
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

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

const asBoolean = (v: unknown, field: string): boolean => {
  if (typeof v === 'boolean') return v
  if (v === 1 || v === '1') return true
  if (v === 0 || v === '0') return false
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asStringArray = (v: unknown): string[] => {
  if (!Array.isArray(v)) return []
  return v.filter((x) => typeof x === 'string')
}

const parseApiKey = (data: unknown): ApiKey => {
  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor: api_key')

  const raw = isRecord(data.data) ? data.data : data

  return {
    id: asNumber(raw.id, 'api_key.id'),
    name: asString(raw.name, 'api_key.name'),
    public_key: asString(raw.public_key, 'api_key.public_key'),
    type: asString(raw.type, 'api_key.type') as ApiKeyType,
    allowed_origins: asStringArray(raw.allowed_origins),
    rate_limit: asNumber(raw.rate_limit, 'api_key.rate_limit'),
    is_active: asBoolean(raw.is_active, 'api_key.is_active'),
    last_used_at: asNullableString(raw.last_used_at),
    created_at: asString(raw.created_at, 'api_key.created_at'),
    updated_at: asString(raw.updated_at, 'api_key.updated_at'),
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
    body: JSON.stringify(payload),
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
    body: JSON.stringify(payload),
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
