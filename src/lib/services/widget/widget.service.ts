import { ApiError } from '../../api'
import type {
  WidgetOfferParams,
  WidgetTrackBatchPayload,
  WidgetTrackPayload,
  WidgetVisitorParams,
  WidgetVisitorSyncPayload,
} from './widget.types'

type JsonValue = Record<string, unknown> | null

const parseJson = async (response: Response): Promise<JsonValue> => {
  try {
    return (await response.json()) as JsonValue
  } catch {
    return null
  }
}

const toQueryString = (params: Record<string, string>) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value.trim()) query.set(key, value)
  })

  return query.toString()
}

const widgetRequest = async <T>(
  baseUrl: string,
  apiKey: string,
  endpoint: string,
  init: RequestInit,
): Promise<T> => {
  const normalizedBase = baseUrl.trim().replace(/\/$/, '')

  if (!normalizedBase) {
    throw new ApiError('Informe a Base URL para testar os endpoints.')
  }

  if (!apiKey.trim()) {
    throw new ApiError('Informe a TENANT_API_KEY para autenticar as chamadas.')
  }

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${apiKey.trim()}`)
  headers.set('Accept', 'application/json')

  if (init.body) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${normalizedBase}${endpoint}`, { ...init, headers })
  } catch {
    throw new ApiError('Falha de rede ao comunicar com a API do Widget.')
  }

  const data = await parseJson(response)

  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : 'Erro ao consumir endpoint do Widget.'
    throw new ApiError(message, response.status)
  }

  return data as T
}

export const getWidgetOffer = async (
  baseUrl: string,
  apiKey: string,
  params: WidgetOfferParams,
) => {
  const query = toQueryString(params)
  return widgetRequest<Record<string, unknown>>(baseUrl, apiKey, `/api/v1/widget/offer?${query}`, { method: 'GET' })
}

export const trackWidgetEvent = async (
  baseUrl: string,
  apiKey: string,
  payload: WidgetTrackPayload,
) => {
  return widgetRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/v1/widget/track', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const trackWidgetBatch = async (
  baseUrl: string,
  apiKey: string,
  payload: WidgetTrackBatchPayload,
) => {
  return widgetRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/v1/widget/track/batch', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const syncWidgetVisitor = async (
  baseUrl: string,
  apiKey: string,
  payload: WidgetVisitorSyncPayload,
) => {
  return widgetRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/v1/widget/visitor/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const getWidgetVisitor = async (
  baseUrl: string,
  apiKey: string,
  params: WidgetVisitorParams,
) => {
  const query = toQueryString(params)
  return widgetRequest<Record<string, unknown>>(baseUrl, apiKey, `/api/v1/widget/visitor?${query}`, { method: 'GET' })
}
