import { getAuthToken } from './storage'

const API_BASE_URL = 'https://central.vendamais.top/api'
const TENANT_API_KEY = import.meta.env.VITE_TENANT_API_KEY

type JsonValue = Record<string, unknown> | null

export type LoginResponse = {
  token: string
}

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const parseJson = async (response: Response): Promise<JsonValue> => {
  try {
    return (await response.json()) as JsonValue
  } catch (error) {
    return null
  }
}

export const authFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
) => {
  if (!TENANT_API_KEY) {
    throw new ApiError('TENANT_API_KEY ausente no ambiente')
  }

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${TENANT_API_KEY}`)
  headers.set('Accept', 'application/json')

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const authToken = getAuthToken()
  if (authToken) {
    headers.set('Authorization-User', `Bearer ${authToken}`)
  }

  return fetch(input, {
    ...init,
    headers,
  })
}

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  let response: Response

  try {
    response = await authFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

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
