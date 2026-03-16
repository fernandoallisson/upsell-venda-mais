import { ApiError, apiFetch } from '../../api'
import type {
  CreateWidgetPayload,
  UpdateWidgetPayload,
  Widget,
  WidgetApiValidationErrors,
  WidgetListParams,
  WidgetListResponse,
  WidgetOfferParams,
  WidgetTrackBatchPayload,
  WidgetTrackPayload,
  WidgetVisitorParams,
  WidgetVisitorSyncPayload,
} from './widgets.types'

const WIDGETS_BASE_ENDPOINT = '/v1/widgets-base'

type JsonValue = Record<string, unknown> | null

export class WidgetValidationError extends ApiError {
  errors: WidgetApiValidationErrors

  constructor(message: string, errors: WidgetApiValidationErrors) {
    super(message, 422)
    this.name = 'WidgetValidationError'
    this.errors = errors
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)


const asString = (value: unknown): string =>
  typeof value === 'string' ? value : ''

const asNumber = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return 0
}

const asBoolean = (value: unknown): boolean =>
  value === true || value === 1 || value === '1' || value === 'true'

const asNullableString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null


const parseWidget = (value: unknown): Widget => {
  if (!isRecord(value)) {
    throw new ApiError('Resposta inválida ao carregar widget')
  }

  return {
    id: asNumber(value.id),
    title: asString(value.title),
    slug: asString(value.slug),
    config: isRecord(value.config) ? value.config : {},
    css: asString(value.css),
    html: asString(value.html),
    is_active: asBoolean(value.is_active),
    created_at: asString(value.created_at),
    updated_at: asString(value.updated_at),
    deleted_at: asNullableString(value.deleted_at),
  }
}

const parseListResponse = (value: JsonValue): WidgetListResponse => {
  if (!isRecord(value)) {
    throw new ApiError('Resposta inválida ao listar widgets')
  }

  const items = Array.isArray(value.data) ? value.data.map(parseWidget) : []
  const meta = isRecord(value.meta) ? value.meta : {}

  return {
    data: items,
    meta: {
      current_page: asNumber(meta.current_page) || 1,
      per_page: asNumber(meta.per_page) || items.length || 10,
      total: asNumber(meta.total) || items.length,
      last_page: asNumber(meta.last_page) || 1,
    },
  }
}

const widgetRequest = async <T>(
  endpoint: string,
  options: RequestInit,
  fallbackErrorMessage: string,
): Promise<T> => {
  const data = await apiFetch<JsonValue>(endpoint, {
    ...options,
    auth: true,
    errorMessage: fallbackErrorMessage,
    networkErrorMessage: 'Falha de rede ao comunicar com servidor de widgets',
  })

  return data as T
}

const widgetPublicRequest = async <T>(
  endpoint: string,
  apiKey: string,
  options: RequestInit,
  fallbackErrorMessage: string,
): Promise<T> => {
  if (!apiKey.trim()) {
    throw new ApiError('Informe a TENANT_API_KEY para autenticar as chamadas.')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${apiKey.trim()}`)

  const data = await apiFetch<JsonValue>(endpoint, {
    ...options,
    headers,
    errorMessage: fallbackErrorMessage,
    networkErrorMessage: 'Falha de rede ao comunicar com a API do Widget.',
  })

  return data as T
}

const toQueryString = (params: Record<string, string>) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value.trim()) query.set(key, value)
  })

  return query.toString()
}

export const getWidgets = async (params: WidgetListParams): Promise<WidgetListResponse> => {
  const query = new URLSearchParams()

  if (params.page) query.set('page', String(params.page))
  if (params.per_page) query.set('per_page', String(params.per_page))
  if (params.search) query.set('search', params.search)
  if (typeof params.is_active === 'boolean') query.set('is_active', params.is_active ? '1' : '0')
  if (params.sort) query.set('sort', params.sort)
  if (params.order) query.set('order', params.order)
  if (params.with_trashed) query.set('with_trashed', '1')

  const response = await widgetRequest<JsonValue>(
    `${WIDGETS_BASE_ENDPOINT}?${query.toString()}`,
    { method: 'GET' },
    'Erro ao carregar widgets',
  )

  return parseListResponse(response)
}

export const getWidgetById = async (id: number): Promise<Widget> => {
  const response = await widgetRequest<JsonValue>(
    `${WIDGETS_BASE_ENDPOINT}/${id}`,
    { method: 'GET' },
    'Erro ao carregar widget',
  )

  const raw = isRecord(response) && isRecord(response.data) ? response.data : response
  return parseWidget(raw)
}

export const getWidgetBySlug = async (slug: string): Promise<Widget> => {
  const response = await widgetRequest<JsonValue>(
    `/v1/widgets/by-slug/${encodeURIComponent(slug)}`,
    { method: 'GET' },
    'Erro ao buscar widget por slug',
  )

  const raw = isRecord(response) && isRecord(response.data) ? response.data : response
  return parseWidget(raw)
}

export const createWidget = async (payload: CreateWidgetPayload): Promise<Widget> => {
  const response = await widgetRequest<JsonValue>(
    WIDGETS_BASE_ENDPOINT,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'Erro ao criar widget',
  )

  const raw = isRecord(response) && isRecord(response.data) ? response.data : response
  return parseWidget(raw)
}

export const updateWidget = async (id: number, payload: UpdateWidgetPayload): Promise<Widget> => {
  const response = await widgetRequest<JsonValue>(
    `${WIDGETS_BASE_ENDPOINT}/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    'Erro ao atualizar widget',
  )

  const raw = isRecord(response) && isRecord(response.data) ? response.data : response
  return parseWidget(raw)
}

export const deleteWidget = async (id: number): Promise<void> => {
  await widgetRequest(
    `${WIDGETS_BASE_ENDPOINT}/${id}`,
    { method: 'DELETE' },
    'Erro ao deletar widget',
  )
}

export const restoreWidget = async (id: number): Promise<Widget> => {
  const response = await widgetRequest<JsonValue>(
    `/v1/widgets/${id}/restore`,
    { method: 'POST' },
    'Erro ao restaurar widget',
  )

  const raw = isRecord(response) && isRecord(response.data) ? response.data : response
  return parseWidget(raw)
}


export const getWidgetOffer = async (
  apiKey: string,
  params: WidgetOfferParams,
) => {
  const query = toQueryString(params)
  return widgetPublicRequest<Record<string, unknown>>(
    `/v1/widget/offer?${query}`,
    apiKey,
    { method: 'GET' },
    'Erro ao consumir endpoint do Widget.',
  )
}

export const trackWidgetEvent = async (
  apiKey: string,
  payload: WidgetTrackPayload,
) => {
  return widgetPublicRequest<Record<string, unknown>>(
    '/v1/widget/track',
    apiKey,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'Erro ao consumir endpoint do Widget.',
  )
}

export const trackWidgetBatch = async (
  apiKey: string,
  payload: WidgetTrackBatchPayload,
) => {
  return widgetPublicRequest<Record<string, unknown>>(
    '/v1/widget/track/batch',
    apiKey,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'Erro ao consumir endpoint do Widget.',
  )
}

export const syncWidgetVisitor = async (
  apiKey: string,
  payload: WidgetVisitorSyncPayload,
) => {
  return widgetPublicRequest<Record<string, unknown>>(
    '/v1/widget/visitor/sync',
    apiKey,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'Erro ao consumir endpoint do Widget.',
  )
}

export const getWidgetVisitor = async (
  apiKey: string,
  params: WidgetVisitorParams,
) => {
  const query = toQueryString(params)
  return widgetPublicRequest<Record<string, unknown>>(
    `/v1/widget/visitor?${query}`,
    apiKey,
    { method: 'GET' },
    'Erro ao consumir endpoint do Widget.',
  )
}
