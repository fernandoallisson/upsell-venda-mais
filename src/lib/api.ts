// lib/api.ts
import { getAuthToken } from './storage'

const API_BASE_URL = 'https://vitor-api.vendamais.top/api'
const USER_ENDPOINT = `${API_BASE_URL}/v1/user`
const LOGOUT_ENDPOINT = `${API_BASE_URL}/v1/logout`

type JsonValue = Record<string, unknown> | null

export type LoginResponse = { token: string }
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

export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseJson = async (response: Response): Promise<JsonValue> => {
  try {
    return (await response.json()) as JsonValue
  } catch {
    return null
  }
}

const parseUser = (data: JsonValue): User => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor')
  }

  const emailVerifiedAt =
    data.email_verified_at === null || typeof data.email_verified_at === 'string'
      ? data.email_verified_at
      : null

  if (
    typeof data.id !== 'number' ||
    typeof data.name !== 'string' ||
    typeof data.email !== 'string' ||
    typeof data.created_at !== 'string' ||
    typeof data.updated_at !== 'string' ||
    typeof data.tenant_id !== 'string'
  ) {
    throw new ApiError('Resposta inválida do servidor')
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    email_verified_at: emailVerifiedAt,
    created_at: data.created_at,
    updated_at: data.updated_at,
    tenant_id: data.tenant_id,
  }
}

// ✅ Para endpoints públicos (login, etc)
export const publicFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
) => {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, { ...init, headers })
}

// ✅ Para endpoints protegidos (precisa do token salvo)
export const authFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
) => {
  const token = getAuthToken()
  if (!token) {
    throw new ApiError('Não autenticado', 401)
  }

  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, { ...init, headers })
}

// ✅ Login agora NÃO usa authFetch
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  let response: Response

  try {
    response = await publicFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  } catch {
    throw new ApiError('Falha de rede ao tentar autenticar')
  }

  const data = await parseJson(response)

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.message === 'string'
        ? data.message
        : 'Erro ao autenticar'
    throw new ApiError(message, response.status)
  }

  if (!isRecord(data) || typeof data.token !== 'string') {
    throw new ApiError('Resposta inválida do servidor')
  }

  return { token: data.token }
}

export const getUser = async (): Promise<User> => {
  let response: Response

  try {
    response = await authFetch(USER_ENDPOINT, { method: 'GET' })
  } catch {
    throw new ApiError('Falha de rede ao buscar usuário')
  }

  const data = await parseJson(response)

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.message === 'string'
        ? data.message
        : 'Erro ao buscar usuário'
    throw new ApiError(message, response.status)
  }

  return parseUser(data)
}

export const updateUser = async (
  method: 'PUT' | 'PATCH',
  payload: UpdateUserPayload,
): Promise<User> => {
  let response: Response

  try {
    response = await authFetch(USER_ENDPOINT, {
      method,
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ApiError('Falha de rede ao atualizar usuário')
  }

  const data = await parseJson(response)

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.message === 'string'
        ? data.message
        : 'Erro ao atualizar usuário'
    throw new ApiError(message, response.status)
  }

  return parseUser(data)
}

export const logout = async (): Promise<void> => {
  let response: Response

  try {
    response = await authFetch(LOGOUT_ENDPOINT, { method: 'POST' })
  } catch {
    throw new ApiError('Falha de rede ao encerrar sessão')
  }

  if (!response.ok) {
    const data = await parseJson(response)
    const message =
      isRecord(data) && typeof data.message === 'string'
        ? data.message
        : 'Erro ao encerrar sessão'
    throw new ApiError(message, response.status)
  }
}
