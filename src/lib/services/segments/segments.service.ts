import { ApiError, apiFetch } from '../../api'
import type {
  CreateSegmentPayload,
  Segment,
  SegmentRule,
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
  if (!isRecord(data)) throw new ApiError(`Resposta inválida do servidor: ${field}`)

  return {
    value: asRuleValue(data.value, `${field}.value`),
    operator: asNullableStringLike(data.operator, `${field}.operator`) ?? '',
  }
}


/**
 * Aceita:
 * - rules como objeto: { lifetime_value: { value, operator }, ... }
 * - rules como array: ["lifetime_value", "total_orders"]
 */
/**
 * Aceita:
 * - rules como objeto: { lifetime_value: { value, operator }, ... }
 * - rules como array de objetos: [{ filter, category, operator?, value?, days?, ... }]
 * - rules como array de strings: ["lifetime_value", "total_orders"] (legado)
 */
const parseRules = (data: unknown): SegmentRules => {
  // ✅ NOVO: array de objetos (como seu fetch mostrou)
  if (Array.isArray(data)) {
    // se for array de records, devolve como está (validando o mínimo)
    const objectRules = data.filter(isRecord)

    if (objectRules.length > 0) {
      return objectRules.map((rule, idx) => {
        // valida o mínimo pra você não carregar lixo
        const filter = asNullableStringLike(rule.filter, `rules.${idx}.filter`)
        const category = asNullableStringLike(rule.category, `rules.${idx}.category`)

        if (!filter) throw new ApiError(`Resposta inválida do servidor: rules.${idx}.filter`)
        if (!category) throw new ApiError(`Resposta inválida do servidor: rules.${idx}.category`)

        return {
          ...rule,
          filter,
          category,
          // operator/value são comuns, mas podem faltar dependendo do tipo de filtro
          operator: asNullableStringLike(rule.operator, `rules.${idx}.operator`) ?? undefined,
          value:
            rule.value === undefined || rule.value === null
              ? undefined
              : asRuleValue(rule.value, `rules.${idx}.value`),
          days:
            rule.days === undefined || rule.days === null
              ? undefined
              : asNullableStringLike(rule.days, `rules.${idx}.days`) ?? String(rule.days),
        }
      }) as unknown as SegmentRules
    }

    // ✅ legado: array de strings
    return data
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean) as unknown as SegmentRules
  }

  // ✅ formato antigo: objeto chaveado
  if (!isRecord(data)) return {}

  const parsed: Record<string, SegmentRule> = {}
  Object.entries(data).forEach(([key, value]) => {
    parsed[key] = parseRule(value, `rules.${key}`)
  })
  return parsed
}


/**
 * Alguns endpoints retornam:
 * - Segment direto {id, name, ...}
 * - Ou embrulhado: { segment: { ... }, matched_customers_count: number }
 */
const unwrapSegment = (data: unknown): unknown => {
  if (!isRecord(data)) return data
  if (isRecord(data.segment)) return data.segment
  return data
}

const parseTenantId = (data: Record<string, unknown>): string | null => {
  // tenta tenant_id direto
  const tenantId = asNullableStringLike(data.tenant_id, 'segment.tenant_id')
  if (tenantId) return tenantId

  // tenta tenant.id (vem no POST)
  const tenant = data.tenant
  if (isRecord(tenant)) {
    return asNullableStringLike(tenant.id, 'segment.tenant.id')
  }

  return null
}

const parseSegment = (input: unknown): Segment => {
  const data = unwrapSegment(input)

  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor: segment')

  return {
    id: asNumber(data.id, 'segment.id'),
    tenant_id: parseTenantId(data),
    name: asString(data.name, 'segment.name'),
    rules: parseRules(data.rules),
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
  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor')

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

export const createSegment = async (payload: CreateSegmentPayload): Promise<Segment> => {
  const data = await apiFetch<JsonValue>(SEGMENTS_ENDPOINT, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao criar segmento',
    networkErrorMessage: 'Falha de rede ao criar segmento',
  })

  // ✅ agora funciona tanto se vier {segment:{...}} quanto direto
  return parseSegment(data)
}

export const updateSegment = async (
  id: number,
  payload: UpdateSegmentPayload,
): Promise<Segment> => {
  const data = await apiFetch<JsonValue>(`${SEGMENTS_ENDPOINT}/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao atualizar segmento',
    networkErrorMessage: 'Falha de rede ao atualizar segmento',
  })

  return parseSegment(data)
}
