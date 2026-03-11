import { getAuthToken } from './storage'

const API_BASE_URL = 'https://vitor-api.vendamais.top/api'

type JsonValue = Record<string, unknown> | null

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export type ApiFetchOptions = RequestInit & {
  auth?: boolean
  errorMessage?: string
  networkErrorMessage?: string
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

const buildUrl = (endpoint: string) =>
  endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

export const apiFetch = async <T>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> => {
  const {
    auth = false,
    errorMessage,
    networkErrorMessage,
    ...init
  } = options

  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getAuthToken()
    if (!token) {
      throw new ApiError('Não autenticado', 401)
    }
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(buildUrl(endpoint), { ...init, headers })
  } catch {
    throw new ApiError(
      networkErrorMessage ?? 'Falha de rede ao comunicar com servidor',
    )
  }

  const data = await parseJson(response)

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.message === 'string'
        ? data.message
        : errorMessage ?? 'Erro ao processar solicitação'
    throw new ApiError(message, response.status)
  }

  return data as T
}

export const apiUpload = async <T>(
  endpoint: string,
  formData: FormData,
): Promise<T> => {
  const token = getAuthToken()
  if (!token) {
    throw new ApiError('Não autenticado', 401)
  }

  let response: Response
  try {
    response = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: formData,
    })
  } catch {
    throw new ApiError('Falha de rede ao enviar arquivo')
  }

  const data = await parseJson(response)

  if (!response.ok) {
    if (response.status === 422 && isRecord(data) && isRecord(data.errors)) {
      const errors = data.errors as Record<string, string[]>
      const firstKey = Object.keys(errors)[0]
      const firstMsg = firstKey ? errors[firstKey]?.[0] : undefined
      throw new ApiError(
        firstMsg ?? (typeof data.message === 'string' ? data.message : 'Erro de validação'),
        422,
      )
    }
    const message =
      isRecord(data) && typeof data.message === 'string'
        ? data.message
        : 'Erro ao enviar arquivo'
    throw new ApiError(message, response.status)
  }

  return data as T
}
