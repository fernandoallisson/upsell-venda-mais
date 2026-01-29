import { ApiError, apiFetch } from '../../api'
import type {
  CreateSegmentPayload,
  Segment,
  SegmentRule,
  SegmentsResponse,
} from './segments.types'

type JsonValue = Record<string, unknown> | null

type JsonArray = unknown[]

const SEGMENTS_ENDPOINT = '/v1/segments'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

type PaginationLink = {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

const asNullableString = (value: unknown, field: string): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asNullableNumber = (value: unknown, field: string): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asString = (value: unknown, field: string): string => {
  if (typeof value === 'string') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asNumber = (value: unknown, field: string): number => {
  if (typeof value === 'number') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asBoolean = (value: unknown, field: string): boolean => {
  if (typeof value === 'boolean') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asRuleValue = (value: unknown, field: string): number | string => {
  if (typeof value === 'number' || typeof value === 'string') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const parseRule = (data: unknown, field: string): SegmentRule => {
  if (!isRecord(data)) {
    throw new ApiError(`Resposta inválida do servidor: ${field}`)
  }

  return {
    value: asRuleValue(data.value, `${field}.value`),
    operator: asString(data.operator, `${field}.operator`),
  }
}

const parseRules = (data: unknown): Record<string, SegmentRule> => {
  if (!isRecord(data)) {
    return {}
  }

  const parsed: Record<string, SegmentRule> = {}
  Object.entries(data).forEach(([key, value]) => {
    parsed[key] = parseRule(value, `rules.${key}`)
  })

  return parsed
}

const parseSegment = (data: unknown): Segment => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: segment')
  }

  return {
    id: asNumber(data.id, 'segment.id'),
    tenant_id: asString(data.tenant_id, 'segment.tenant_id'),
    name: asString(data.name, 'segment.name'),
    rules: parseRules(data.rules),
    created_at: asString(data.created_at, 'segment.created_at'),
    updated_at: asString(data.updated_at, 'segment.updated_at'),
  }
}

const parsePaginationLink = (data: unknown): PaginationLink => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: links')
  }

  const page =
    data.page === null || typeof data.page === 'number' ? data.page : null

  return {
    url: asNullableString(data.url, 'links.url'),
    label: asString(data.label, 'links.label'),
    page,
    active: asBoolean(data.active, 'links.active'),
  }
}

const parseSegmentsResponse = (data: JsonValue): SegmentsResponse => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor')
  }

  const items = Array.isArray(data.data) ? data.data : ([] as JsonArray)
  const links = Array.isArray(data.links) ? data.links : ([] as JsonArray)

  return {
    current_page: asNumber(data.current_page, 'current_page'),
    data: items.map(parseSegment),

    first_page_url: asString(data.first_page_url, 'first_page_url'),
    from: asNullableNumber(data.from, 'from'),
    last_page: asNumber(data.last_page, 'last_page'),
    last_page_url: asString(data.last_page_url, 'last_page_url'),
    links: links.map(parsePaginationLink),
    next_page_url: asNullableString(data.next_page_url, 'next_page_url'),
    path: asString(data.path, 'path'),
    per_page: asNumber(data.per_page, 'per_page'),
    prev_page_url: asNullableString(data.prev_page_url, 'prev_page_url'),
    to: asNullableNumber(data.to, 'to'),
    total: asNumber(data.total, 'total'),
  }
}

export const getSegments = async (page = 1): Promise<SegmentsResponse> => {
  const data = await apiFetch<JsonValue>(`${SEGMENTS_ENDPOINT}?page=${page}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar segmentos',
    networkErrorMessage: 'Falha de rede ao carregar segmentos',
  })

  return parseSegmentsResponse(data)
}

export const getSegmentById = async (id: number): Promise<Segment> => {
  const data = await apiFetch<JsonValue>(`${SEGMENTS_ENDPOINT}/${id}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar detalhes do segmento',
    networkErrorMessage: 'Falha de rede ao carregar segmento',
  })

  return parseSegment(data)
}

export const createSegment = async (
  payload: CreateSegmentPayload,
): Promise<Segment> => {
  const data = await apiFetch<JsonValue>(SEGMENTS_ENDPOINT, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao criar segmento',
    networkErrorMessage: 'Falha de rede ao criar segmento',
  })

  return parseSegment(data)
}
