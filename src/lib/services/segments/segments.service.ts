import { ApiError, apiFetch } from '../../api'
import { API_CACHE_TAGS } from '../cacheTags'
import type {
  CreateSegmentPayload,
  ExportColumn,
  ExportStartResponse,
  ExportStatusResponse,
  PreviewSegmentResponse,
  Segment,
  SegmentCustomer,
  SegmentProgressResponse,
  SegmentRule,
  SegmentRulesPayload,
  SegmentsResponse,
  UpdateSegmentPayload,
  SegmentRules,
} from './segments.types'

type JsonValue = Record<string, unknown> | null
type JsonArray = unknown[]

const SEGMENTS_ENDPOINT = '/v1/segments'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

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

const asNullableStringLike = (value: unknown, field: string): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
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

const asNumberLoose = (value: unknown, field: string): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asBoolean = (value: unknown, field: string): boolean => {
  if (typeof value === 'boolean') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asRuleValue = (value: unknown, field: string): number | string | boolean => {
  if (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const parseRule = (data: unknown, field: string): SegmentRule => {
  if (!isRecord(data)) throw new ApiError(`Resposta inválida do servidor: ${field}`)

  return {
    value:
      data.value === null || data.value === undefined
        ? ''
        : asRuleValue(data.value, `${field}.value`),
    operator: asNullableStringLike(data.operator, `${field}.operator`) ?? '',
  }
}


const parseRules = (data: unknown): SegmentRules => {
  if (Array.isArray(data)) {
    const objectRules = data.filter(isRecord)

    if (objectRules.length > 0) {
      return objectRules.map((rule, idx) => {
        const filter = asString(rule.filter, `rules.${idx}.filter`)

        const category =
          asNullableStringLike(rule.category, `rules.${idx}.category`) ?? undefined

        const operator =
          asNullableStringLike(rule.operator, `rules.${idx}.operator`) ?? undefined

        const value =
          rule.value === undefined || rule.value === null
            ? undefined
            : asRuleValue(rule.value, `rules.${idx}.value`)

        const days =
          rule.days === undefined || rule.days === null
            ? undefined
            : Number(
                asNullableStringLike(rule.days, `rules.${idx}.days`) ?? rule.days,
              )

        return {
          filter,
          category,
          operator,
          value,
          days,
          product:
            asNullableStringLike(rule.product, `rules.${idx}.product`) ?? undefined,
          start_date:
            asNullableStringLike(rule.start_date, `rules.${idx}.start_date`) ??
            undefined,
          end_date:
            asNullableStringLike(rule.end_date, `rules.${idx}.end_date`) ??
            undefined,
          key: asNullableStringLike(rule.key, `rules.${idx}.key`) ?? undefined,
        }
      })
    }

    return data
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean)
  }

  if (!isRecord(data)) return {}

  const parsed: Record<string, SegmentRule> = {}
  Object.entries(data).forEach(([key, value]) => {
    parsed[key] = parseRule(value, `rules.${key}`)
  })
  return parsed
}



const unwrapSegment = (data: unknown): unknown => {
  if (!isRecord(data)) return data
  if (isRecord(data.segment)) return data.segment
  const payload = data.data
  if (isRecord(payload)) {
    if (isRecord(payload.segment)) return payload.segment
    return payload
  }
  return data
}

const parseTenantId = (data: Record<string, unknown>): string | null => {
  const tenantId = asNullableStringLike(data.tenant_id, 'segment.tenant_id')
  if (tenantId) return tenantId

  const tenant = data.tenant
  if (isRecord(tenant)) {
    return asNullableStringLike(tenant.id, 'segment.tenant.id')
  }

  return null
}

const extractMatchedCount = (input: unknown): number | null => {
  if (!isRecord(input)) return null
  if (typeof input.matched_customers_count === 'number') return input.matched_customers_count
  if (isRecord(input.data) && typeof input.data.matched_customers_count === 'number')
    return input.data.matched_customers_count
  return null
}

const parseSegmentCustomers = (data: unknown): SegmentCustomer[] => {
  if (!Array.isArray(data)) return []
  return data.filter(isRecord).map((item) => ({
    id: typeof item.id === 'number' ? item.id : Number(item.id ?? 0),
    external_id: asNullableStringLike(item.external_id, 'customer.external_id'),
    email: asNullableStringLike(item.email, 'customer.email'),
    phone: asNullableStringLike(item.phone, 'customer.phone'),
    first_name: asNullableStringLike(item.first_name, 'customer.first_name'),
    last_name: asNullableStringLike(item.last_name, 'customer.last_name'),
  }))
}

const parseSegment = (input: unknown): Segment => {
  const matchedCount = extractMatchedCount(input)
  const data = unwrapSegment(input)

  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor: segment')

  const customersCount =
    typeof data.customers_count === 'number'
      ? data.customers_count
      : asNullableNumber(data.customers_count, 'segment.customers_count')

  const processedCount =
    typeof data.processed_count === 'number'
      ? data.processed_count
      : asNullableNumber(data.processed_count, 'segment.processed_count')

  return {
    id: asNumberLoose(data.id, 'segment.id'),
    tenant_id: parseTenantId(data),
    name: asString(data.name, 'segment.name'),
    rules: parseRules(data.rules),
    status:
      typeof data.status === 'string'
        ? (data.status as Segment['status'])
        : undefined,
    customers_count: customersCount,
    processed_count: processedCount,
    matched_customers_count:
      matchedCount ??
      customersCount ??
      (typeof data.matched_customers_count === 'number'
        ? data.matched_customers_count
        : null),
    processing_started_at: asNullableStringLike(
      data.processing_started_at,
      'segment.processing_started_at',
    ),
    processing_completed_at: asNullableStringLike(
      data.processing_completed_at,
      'segment.processing_completed_at',
    ),
    customers: parseSegmentCustomers(data.customers),
    created_at: asString(data.created_at, 'segment.created_at'),
    updated_at: asString(data.updated_at, 'segment.updated_at'),
  }
}

const parsePaginationLink = (data: unknown): PaginationLink => {
  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor: links')

  const page = data.page === null || typeof data.page === 'number' ? data.page : null

  return {
    url: asNullableString(data.url, 'links.url'),
    label: asString(data.label, 'links.label'),
    page,
    active: asBoolean(data.active, 'links.active'),
  }
}

const parseSegmentsResponse = (data: JsonValue): SegmentsResponse => {
  if (Array.isArray(data)) {
    return buildFallbackSegmentsResponse(data.map(parseSegment))
  }

  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor')

  const items = Array.isArray(data.data) ? data.data : null
  if (!items) {
    return buildFallbackSegmentsResponse([parseSegment(data)])
  }

  const links = Array.isArray(data.links) ? data.links : ([] as JsonArray)
  const hasPaginationFields =
    data.current_page !== undefined &&
    data.last_page !== undefined &&
    data.per_page !== undefined &&
    data.total !== undefined

  if (!hasPaginationFields) {
    return buildFallbackSegmentsResponse(items.map(parseSegment))
  }

  return {
    current_page: asNumberLoose(data.current_page, 'current_page'),
    data: items.map(parseSegment),

    first_page_url: asString(data.first_page_url, 'first_page_url'),
    from: asNullableNumber(data.from, 'from'),
    last_page: asNumberLoose(data.last_page, 'last_page'),
    last_page_url: asString(data.last_page_url, 'last_page_url'),
    links: links.map(parsePaginationLink),
    next_page_url: asNullableString(data.next_page_url, 'next_page_url'),
    path: asString(data.path, 'path'),
    per_page: asNumberLoose(data.per_page, 'per_page'),
    prev_page_url: asNullableString(data.prev_page_url, 'prev_page_url'),
    to: asNullableNumber(data.to, 'to'),
    total: asNumberLoose(data.total, 'total'),
  }
}

const buildFallbackSegmentsResponse = (items: Segment[]): SegmentsResponse => {
  const total = items.length
  return {
    current_page: 1,
    data: items,
    first_page_url: '',
    from: total > 0 ? 1 : null,
    last_page: 1,
    last_page_url: '',
    links: [],
    next_page_url: null,
    path: '',
    per_page: total,
    prev_page_url: null,
    to: total > 0 ? total : null,
    total,
  }
}

type SegmentsListOptions = { page?: number; perPage?: number }

export const getSegments = async (
  options: number | SegmentsListOptions = 1,
): Promise<SegmentsResponse> => {
  const page = typeof options === 'number' ? options : (options.page ?? 1)
  const perPage = typeof options === 'number' ? undefined : options.perPage
  const params = new URLSearchParams({ page: String(page) })
  if (perPage) params.set('per_page', String(perPage))
  const data = await apiFetch<JsonValue>(`${SEGMENTS_ENDPOINT}?${params.toString()}`, {
    method: 'GET',
    auth: true,
    cache: true,
    cacheTags: [API_CACHE_TAGS.segments],
    errorMessage: 'Erro ao carregar segmentos',
    networkErrorMessage: 'Falha de rede ao carregar segmentos',
  })

  return parseSegmentsResponse(data)
}

export const getSegmentById = async (id: number): Promise<Segment> => {
  const data = await apiFetch<JsonValue>(`${SEGMENTS_ENDPOINT}/${id}`, {
    method: 'GET',
    auth: true,
    cache: true,
    cacheTags: [API_CACHE_TAGS.segments],
    errorMessage: 'Erro ao carregar detalhes do segmento',
    networkErrorMessage: 'Falha de rede ao carregar segmento',
  })

  return parseSegment(data)
}

export const createSegment = async (payload: CreateSegmentPayload): Promise<Segment> => {
  const data = await apiFetch<JsonValue>(SEGMENTS_ENDPOINT, {
    method: 'POST',
    auth: true,
    invalidateTags: [
      API_CACHE_TAGS.segments,
      API_CACHE_TAGS.campaigns,
      API_CACHE_TAGS.customers,
    ],
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao criar segmento',
    networkErrorMessage: 'Falha de rede ao criar segmento',
  })

  return parseSegment(data)
}

export const updateSegment = async (
  id: number,
  payload: UpdateSegmentPayload,
): Promise<Segment> => {
  const data = await apiFetch<JsonValue>(`${SEGMENTS_ENDPOINT}/${id}`, {
    method: 'PUT',
    auth: true,
    invalidateTags: [
      API_CACHE_TAGS.segments,
      API_CACHE_TAGS.campaigns,
      API_CACHE_TAGS.customers,
    ],
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao atualizar segmento',
    networkErrorMessage: 'Falha de rede ao atualizar segmento',
  })

  return parseSegment(data)
}

export const deleteSegment = async (id: number): Promise<void> => {
  await apiFetch<void>(`${SEGMENTS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    auth: true,
    invalidateTags: [
      API_CACHE_TAGS.segments,
      API_CACHE_TAGS.campaigns,
      API_CACHE_TAGS.customers,
    ],
    errorMessage: 'Erro ao remover segmento',
    networkErrorMessage: 'Falha de rede ao remover segmento',
  })
}

export const previewSegmentRules = async (
  rules: SegmentRulesPayload,
): Promise<PreviewSegmentResponse> => {
  const data = await apiFetch<JsonValue>(`${SEGMENTS_ENDPOINT}/preview`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ rules }),
    errorMessage: 'Erro ao calcular preview do segmento',
    networkErrorMessage: 'Falha de rede ao calcular preview',
  })

  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor')

  const nested = isRecord(data.data) ? data.data : data

  return {
    estimated_customers_count:
      typeof nested.estimated_customers_count === 'number'
        ? nested.estimated_customers_count
        : typeof nested.matched_customers_count === 'number'
          ? nested.matched_customers_count
          : typeof nested.count === 'number'
            ? nested.count
            : typeof nested.total === 'number'
              ? nested.total
              : 0,
  }
}

export const getExportColumns = async (): Promise<ExportColumn[]> => {
  const data = await apiFetch<JsonValue>(`${SEGMENTS_ENDPOINT}/export/columns`, {
    method: 'GET',
    auth: true,
    cache: true,
    cacheTags: [API_CACHE_TAGS.segments],
    errorMessage: 'Erro ao carregar colunas de exportação',
    networkErrorMessage: 'Falha de rede ao carregar colunas',
  })

  const mapColumn = (item: unknown): ExportColumn | null => {
    if (typeof item === 'string' && item.trim() !== '') {
      return { key: item, label: item }
    }
    if (!isRecord(item)) return null
    const key = String(item.key ?? item.column ?? item.field ?? item.name ?? '')
    if (!key) return null
    const label = String(item.label ?? item.display_name ?? item.title ?? item.name ?? key)
    return { key, label }
  }

  const filterValid = (items: unknown[]): ExportColumn[] =>
    items.map(mapColumn).filter((c): c is ExportColumn => c !== null && c.key !== '')

  if (Array.isArray(data)) {
    return filterValid(data)
  }

  if (isRecord(data)) {
    for (const key of ['columns', 'available_columns', 'data', 'fields', 'items']) {
      if (Array.isArray(data[key])) {
        return filterValid(data[key] as unknown[])
      }
    }

    const entries = Object.entries(data)
    if (entries.length > 0 && entries.every(([, v]) => typeof v === 'string')) {
      return entries.map(([k, v]) => ({ key: k, label: String(v) }))
    }
  }

  return []
}

export const startAsyncExport = async (
  segmentId: number,
): Promise<ExportStartResponse> => {
  const data = await apiFetch<JsonValue>(`${SEGMENTS_ENDPOINT}/${segmentId}/export`, {
    method: 'POST',
    auth: true,
    errorMessage: 'Erro ao iniciar exportação',
    networkErrorMessage: 'Falha de rede ao iniciar exportação',
  })

  if (!isRecord(data))
    throw new ApiError('Resposta inválida ao iniciar exportação')

  const nested = isRecord(data.data) ? data.data : data

  return {
    export_id: String(nested.export_id ?? nested.id ?? ''),
    message: typeof nested.message === 'string' ? nested.message : undefined,
  }
}

export const getExportStatus = async (
  segmentId: number,
  exportId: string,
): Promise<ExportStatusResponse> => {
  const data = await apiFetch<JsonValue>(
    `${SEGMENTS_ENDPOINT}/${segmentId}/export/status/${exportId}`,
    {
      method: 'GET',
      auth: true,
      errorMessage: 'Erro ao verificar status da exportação',
      networkErrorMessage: 'Falha de rede ao verificar status',
    },
  )

  if (!isRecord(data))
    throw new ApiError('Resposta inválida do status de exportação')

  const nested = isRecord(data.data) ? data.data : data

  return {
    export_id: String(nested.export_id ?? nested.id ?? exportId),
    status: String(nested.status ?? 'pending') as ExportStatusResponse['status'],
    progress: typeof nested.progress === 'number' ? nested.progress : undefined,
    message: typeof nested.message === 'string' ? nested.message : undefined,
    download_url:
      typeof nested.download_url === 'string' ? nested.download_url : undefined,
  }
}

export const getAsyncExportDownloadUrl = (
  segmentId: number,
  exportId: string,
): string =>
  `${SEGMENTS_ENDPOINT}/${segmentId}/export/download/${exportId}`

export const getSyncExportStreamUrl = (segmentId: number): string =>
  `${SEGMENTS_ENDPOINT}/${segmentId}/export/stream`

export const getSegmentProgress = async (
  segmentId: number,
): Promise<SegmentProgressResponse> => {
  const data = await apiFetch<JsonValue>(
    `${SEGMENTS_ENDPOINT}/${segmentId}/progress`,
    {
      method: 'GET',
      auth: true,
      errorMessage: 'Erro ao verificar progresso do segmento',
      networkErrorMessage: 'Falha de rede ao verificar progresso',
    },
  )

  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor')

  const nested = isRecord(data.data) ? data.data : data

  const toNullableNumber = (v: unknown): number | null =>
    typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) || null : null

  return {
    segment_id:
      typeof nested.segment_id === 'number'
        ? nested.segment_id
        : segmentId,
    status: String(nested.status ?? 'pending') as SegmentProgressResponse['status'],
    customers_count: toNullableNumber(nested.customers_count),
    processed_count: toNullableNumber(nested.processed_count),
    progress_percentage: toNullableNumber(nested.progress_percentage),
    processing_started_at:
      typeof nested.processing_started_at === 'string'
        ? nested.processing_started_at
        : null,
    processing_completed_at:
      typeof nested.processing_completed_at === 'string'
        ? nested.processing_completed_at
        : null,
    estimated_time_remaining: toNullableNumber(nested.estimated_time_remaining),
    error_message:
      typeof nested.error_message === 'string' ? nested.error_message : null,
    job_id: typeof nested.job_id === 'string' ? nested.job_id : null,
  }
}
