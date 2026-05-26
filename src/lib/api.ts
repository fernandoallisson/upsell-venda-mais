import { getAuthToken } from './storage'

const API_BASE_URL = 'https://vitor-api.vendamais.top/api'

type JsonValue = Record<string, unknown> | null

export class ApiError extends Error {
  status?: number
  body?: unknown

  constructor(message: string, status?: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export type ApiFetchOptions = Omit<RequestInit, 'cache'> & {
  auth?: boolean
  errorMessage?: string
  networkErrorMessage?: string
  cache?: boolean
  cacheTags?: string[]
  forceRefresh?: boolean
  invalidateTags?: string[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

type CachedResponse = {
  data: unknown
  tags: string[]
}

const responseCache = new Map<string, CachedResponse>()
const pendingRequests = new Map<string, Promise<unknown>>()
const cacheTagVersions = new Map<string, number>()

const bumpTagVersion = (tag: string) => {
  cacheTagVersions.set(tag, (cacheTagVersions.get(tag) ?? 0) + 1)
}

export const invalidateApiCache = (tags?: string[]) => {
  if (!tags || tags.length === 0) {
    responseCache.clear()
    pendingRequests.clear()
    cacheTagVersions.clear()
    return
  }

  tags.forEach(bumpTagVersion)

  responseCache.forEach((entry, key) => {
    if (entry.tags.some((tag) => tags.includes(tag))) {
      responseCache.delete(key)
    }
  })
}

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
    cache = false,
    cacheTags = [],
    errorMessage,
    forceRefresh = false,
    invalidateTags = [],
    networkErrorMessage,
    ...init
  } = options

  const method = String(init.method ?? 'GET').toUpperCase()
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

  const url = buildUrl(endpoint)
  const cacheKey =
    cache && method === 'GET'
      ? `${auth ? getAuthToken() ?? 'no-token' : 'public'}::${url}`
      : null

  if (cacheKey && forceRefresh) {
    invalidateApiCache(cacheTags)
  }

  if (cacheKey && !forceRefresh) {
    const cached = responseCache.get(cacheKey)
    if (cached) return cached.data as T

    const pending = pendingRequests.get(cacheKey)
    if (pending) return pending as Promise<T>
  }

  const tagVersionsAtRequest = new Map(
    cacheTags.map((tag) => [tag, cacheTagVersions.get(tag) ?? 0]),
  )

  const request = async () => {
    let response: Response
    try {
      response = await fetch(url, { ...init, headers })
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
      throw new ApiError(message, response.status, data)
    }

    if (cacheKey) {
      const tagsAreCurrent = cacheTags.every(
        (tag) =>
          (cacheTagVersions.get(tag) ?? 0) === tagVersionsAtRequest.get(tag),
      )
      if (tagsAreCurrent) responseCache.set(cacheKey, { data, tags: cacheTags })
    }

    if (invalidateTags.length > 0) {
      invalidateApiCache(invalidateTags)
    }

    return data as T
  }

  if (!cacheKey) return request()

  const pending = request()
  pendingRequests.set(cacheKey, pending)
  try {
    return await pending
  } finally {
    if (pendingRequests.get(cacheKey) === pending) {
      pendingRequests.delete(cacheKey)
    }
  }
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
        data,
      )
    }
    const message =
      isRecord(data) && typeof data.message === 'string'
        ? data.message
        : 'Erro ao enviar arquivo'
    throw new ApiError(message, response.status, data)
  }

  return data as T
}
