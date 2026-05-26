import { ApiError, apiFetch, type ApiFetchOptions } from '../../api'
import { API_CACHE_TAGS } from '../cacheTags'
import type {
  UpdateWidgetFormPayload,
  WidgetFormPayload,
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
import { parseWidgetConfig, toCreateWidgetPayload, toUpdateWidgetPayload } from './widgetConfigCodec'

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

const asId = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

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

/**
 * Extrai o objeto widget do envelope `{ data: { ... } }` da API.
 * Caso a resposta já seja o objeto direto, retorna como está.
 */
const unwrapWidgetData = (response: JsonValue): unknown => {
  if (!isRecord(response)) return response
  if (isRecord(response.data)) return response.data
  return response
}

const parseWidget = (raw: unknown): Widget => {
  if (!isRecord(raw)) {
    throw new ApiError('Resposta inválida ao carregar widget')
  }

  return {
    id: asId(raw.id),
    title: asString(raw.title),
    slug: asString(raw.slug),
    config: parseWidgetConfig(raw.config),
    css: asString(raw.css),
    html: asString(raw.html),
    is_active: asBoolean(raw.is_active),
    created_at: asString(raw.created_at),
    updated_at: asString(raw.updated_at),
    deleted_at: asNullableString(raw.deleted_at),
  }
}

/**
 * Parseia a resposta paginada da listagem de widgets.
 * Formato esperado: `{ data: Widget[], meta: { current_page, per_page, total, last_page, from, to } }`
 */
const parseListResponse = (response: JsonValue): WidgetListResponse => {
  if (!isRecord(response)) {
    throw new ApiError('Resposta inválida ao listar widgets')
  }

  const items = Array.isArray(response.data) ? response.data.map(parseWidget) : []
  const meta = isRecord(response.meta) ? response.meta : {}

  return {
    data: items,
    meta: {
      current_page: asNumber(meta.current_page) || 1,
      per_page: asNumber(meta.per_page) || 15,
      total: asNumber(meta.total) || items.length,
      last_page: asNumber(meta.last_page) || 1,
    },
  }
}

/**
 * Trata erros 422 da API transformando em `WidgetValidationError`
 * com os erros de campo específicos (ex: `{ title: ["O campo title é obrigatório."] }`).
 */
const handleValidationError = (error: unknown, fallbackMessage: string): never => {
  if (error instanceof ApiError && error.status === 422 && isRecord(error.body) && isRecord(error.body.errors)) {
    const message = typeof error.body.message === 'string' ? error.body.message : fallbackMessage
    throw new WidgetValidationError(message, error.body.errors as WidgetApiValidationErrors)
  }
  throw error
}

/**
 * Requisição autenticada para endpoints de widget (CRUD do tenant).
 */
const widgetRequest = async <T>(
  endpoint: string,
  options: ApiFetchOptions,
  fallbackErrorMessage: string,
): Promise<T> => {
  try {
    return await apiFetch<T>(endpoint, {
      ...options,
      auth: true,
      errorMessage: fallbackErrorMessage,
      networkErrorMessage: 'Falha de rede ao comunicar com servidor de widgets',
    })
  } catch (error) {
    return handleValidationError(error, fallbackErrorMessage)
  }
}

/**
 * Requisição pública para endpoints de widget (offer, track, visitor).
 */
const widgetPublicRequest = async <T>(
  endpoint: string,
  apiKey: string,
  options: Omit<RequestInit, 'cache'>,
  fallbackErrorMessage: string,
): Promise<T> => {
  if (!apiKey.trim()) {
    throw new ApiError('Informe a TENANT_API_KEY para autenticar as chamadas.')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${apiKey.trim()}`)

  return apiFetch<T>(endpoint, {
    ...options,
    headers,
    errorMessage: fallbackErrorMessage,
    networkErrorMessage: 'Falha de rede ao comunicar com a API do Widget.',
  })
}

const buildQueryString = (params: Record<string, string>): string => {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value.trim()) query.set(key, value)
  }
  return query.toString()
}

// ---------------------------------------------------------------------------
// CRUD – Widgets Base
// ---------------------------------------------------------------------------

export const getWidgets = async (params: WidgetListParams): Promise<WidgetListResponse> => {
  const query = new URLSearchParams()

  if (params.page) query.set('page', String(params.page))
  if (params.per_page) query.set('per_page', String(params.per_page))
  if (params.search) query.set('search', params.search)
  if (typeof params.is_active === 'boolean') query.set('is_active', params.is_active ? '1' : '0')
  if (params.sort) query.set('sort', params.sort)
  if (params.order) query.set('order', params.order)

  const response = await widgetRequest<JsonValue>(
    `${WIDGETS_BASE_ENDPOINT}?${query.toString()}`,
    {
      method: 'GET',
      cache: true,
      cacheTags: [API_CACHE_TAGS.widgets],
    },
    'Erro ao carregar widgets',
  )

  return parseListResponse(response)
}

export const getWidgetById = async (id: string): Promise<Widget> => {
  const response = await widgetRequest<JsonValue>(
    `${WIDGETS_BASE_ENDPOINT}/${id}`,
    {
      method: 'GET',
      cache: true,
      cacheTags: [API_CACHE_TAGS.widgets],
    },
    'Erro ao carregar widget',
  )

  return parseWidget(unwrapWidgetData(response))
}

export const getWidgetBySlug = async (slug: string): Promise<Widget> => {
  const response = await widgetRequest<JsonValue>(
    `/v1/widgets/by-slug/${encodeURIComponent(slug)}`,
    {
      method: 'GET',
      cache: true,
      cacheTags: [API_CACHE_TAGS.widgets],
    },
    'Erro ao buscar widget por slug',
  )

  return parseWidget(unwrapWidgetData(response))
}

/**
 * Cria um novo widget.
 * POST /v1/widgets-base
 * Body: { title, config, css, html, is_active? }
 * Response: { data: Widget, message: string }
 */
export const createWidget = async (payload: WidgetFormPayload): Promise<Widget> => {
  const response = await widgetRequest<JsonValue>(
    WIDGETS_BASE_ENDPOINT,
    {
      method: 'POST',
      body: JSON.stringify(toCreateWidgetPayload(payload)),
      invalidateTags: [API_CACHE_TAGS.widgets, API_CACHE_TAGS.campaigns],
    },
    'Erro ao criar widget',
  )

  return parseWidget(unwrapWidgetData(response))
}

/**
 * Atualiza um widget existente.
 * PUT /v1/widgets-base/{id}
 * Body: { title?, config?, css?, html?, is_active? }
 * Response: { data: Widget, message: string }
 */
export const updateWidget = async (id: string, payload: UpdateWidgetFormPayload): Promise<Widget> => {
  const response = await widgetRequest<JsonValue>(
    `${WIDGETS_BASE_ENDPOINT}/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(toUpdateWidgetPayload(payload)),
      invalidateTags: [API_CACHE_TAGS.widgets, API_CACHE_TAGS.campaigns],
    },
    'Erro ao atualizar widget',
  )

  const widget = parseWidget(unwrapWidgetData(response))
  return { ...widget, id: widget.id || id }
}

export const deleteWidget = async (id: string): Promise<void> => {
  await widgetRequest(
    `${WIDGETS_BASE_ENDPOINT}/${id}`,
    {
      method: 'DELETE',
      invalidateTags: [API_CACHE_TAGS.widgets, API_CACHE_TAGS.campaigns],
    },
    'Erro ao deletar widget',
  )
}

export const restoreWidget = async (id: string): Promise<Widget> => {
  const response = await widgetRequest<JsonValue>(
    `/v1/widgets/${id}/restore`,
    {
      method: 'POST',
      invalidateTags: [API_CACHE_TAGS.widgets, API_CACHE_TAGS.campaigns],
    },
    'Erro ao restaurar widget',
  )

  return parseWidget(unwrapWidgetData(response))
}

// ---------------------------------------------------------------------------
// Endpoints públicos (offer, tracking, visitor)
// ---------------------------------------------------------------------------

export const getWidgetOffer = async (
  apiKey: string,
  params: WidgetOfferParams,
) => {
  const query = buildQueryString(params)
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
  const query = buildQueryString(params)
  return widgetPublicRequest<Record<string, unknown>>(
    `/v1/widget/visitor?${query}`,
    apiKey,
    { method: 'GET' },
    'Erro ao consumir endpoint do Widget.',
  )
}
