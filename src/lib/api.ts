// lib/api.ts
import { getAuthToken } from './storage'

const API_BASE_URL = 'https://vitor-api.vendamais.top/api'

type JsonValue = Record<string, unknown> | null

export type LoginResponse = { token: string }

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
