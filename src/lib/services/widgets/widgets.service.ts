import { ApiError } from '../../api'
import { getAuthToken } from '../../storage'
import type {
  CreateWidgetPayload,
  UpdateWidgetPayload,
  Widget,
  WidgetApiValidationErrors,
  WidgetListParams,
  WidgetListResponse,
} from './widgets.types'

const API_BASE_URL = 'https://vitor-api.vendamais.top/api'
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

const parseJson = async (response: Response): Promise<JsonValue> => {
  try {
    return (await response.json()) as JsonValue
  } catch {
    return null
  }
}

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

const asValidationErrors = (value: unknown): WidgetApiValidationErrors => {
  if (!isRecord(value)) return {}

  return Object.entries(value).reduce<WidgetApiValidationErrors>((acc, [key, fieldValue]) => {
    if (Array.isArray(fieldValue)) {
      acc[key] = fieldValue.filter((item): item is string => typeof item === 'string')
    }
    return acc
  }, {})
}

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

const buildUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`

const widgetRequest = async <T>(
  endpoint: string,
  options: RequestInit,
  fallbackErrorMessage: string,
): Promise<T> => {
  const token = getAuthToken()
  if (!token) {
    throw new ApiError('Não autenticado', 401)
  }

  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(buildUrl(endpoint), {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError('Falha de rede ao comunicar com servidor de widgets')
  }

  const data = await parseJson(response)

  if (!response.ok) {
    const message = isRecord(data) && typeof data.message === 'string'
      ? data.message
      : fallbackErrorMessage

    if (response.status === 422) {
      throw new WidgetValidationError(message, asValidationErrors(isRecord(data) ? data.errors : null))
    }

    throw new ApiError(message, response.status)
  }

  return data as T
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
