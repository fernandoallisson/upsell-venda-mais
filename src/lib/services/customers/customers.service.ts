import { ApiError, apiFetch } from '../../api'
import type {
  Customer,
  CustomerPayload,
  CustomerPreferences,
  CustomerSegment,
  CustomersResponse,
} from './customers.types'
import type { SegmentRules } from '../segments/segments.types'

type JsonValue = Record<string, unknown> | null
type JsonArray = unknown[]

const CUSTOMERS_ENDPOINT = '/v1/customers'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asString = (value: unknown, field: string): string => {
  if (typeof value === 'string') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asBoolean = (value: unknown, field: string): boolean => {
  if (typeof value === 'boolean') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asStringOrEmpty = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

const asNullableStringLike = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return null
}

const asNumberLoose = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return 0
    const cleaned = trimmed.replace(/[^\d.-]/g, '')
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }

  if (typeof value === 'boolean') return value ? 1 : 0
  return 0
}

const parseRules = (data: unknown): SegmentRules => {
  if (Array.isArray(data)) {
    const stringRules = data
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean)
    if (stringRules.length > 0) return stringRules

    const objectRules = data.filter(isRecord).map((rule) => ({
      filter: typeof rule.filter === 'string' ? rule.filter : '',
      category: typeof rule.category === 'string' ? rule.category : undefined,
      operator: typeof rule.operator === 'string' ? rule.operator : undefined,
      value:
        typeof rule.value === 'string' || typeof rule.value === 'number'
          ? rule.value
          : undefined,
      days: typeof rule.days === 'number' ? rule.days : undefined,
      product: typeof rule.product === 'string' ? rule.product : undefined,
      start_date:
        typeof rule.start_date === 'string' ? rule.start_date : undefined,
      end_date: typeof rule.end_date === 'string' ? rule.end_date : undefined,
      key: typeof rule.key === 'string' ? rule.key : undefined,
    }))

    return objectRules
  }

  if (!isRecord(data)) return {}

  const parsed: Record<string, { value: number | string; operator: string }> = {}
  for (const [key, value] of Object.entries(data)) {
    if (!isRecord(value)) continue
    const operator = value.operator
    const ruleValue = value.value
    if (typeof operator !== 'string') continue
    if (typeof ruleValue !== 'string' && typeof ruleValue !== 'number') continue
    parsed[key] = { operator, value: ruleValue }
  }
  return parsed
}

const parsePreferences = (data: unknown): CustomerPreferences => {
  if (data === null || data === undefined) return { sms: false, newsletter: false }

  if (Array.isArray(data)) {
    const prefs = data.filter((v): v is string => typeof v === 'string')
    return {
      sms: prefs.includes('sms'),
      newsletter: prefs.includes('newsletter'),
    }
  }

  if (isRecord(data)) {
    return {
      sms: typeof data.sms === 'boolean' ? data.sms : false,
      newsletter: typeof data.newsletter === 'boolean' ? data.newsletter : false,
    }
  }

  return { sms: false, newsletter: false }
}

const parseSegment = (data: unknown): CustomerSegment => {
  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor: segment')

  const pivot = isRecord(data.pivot) ? data.pivot : null

  return {
    id: asNumberLoose(data.id),
    name: asString(data.name, 'segment.name'),
    rules: parseRules(data.rules),
    created_at: asString(data.created_at, 'segment.created_at'),
    updated_at: asString(data.updated_at, 'segment.updated_at'),
    pivot: pivot
      ? {
          customer_id: asNumberLoose(pivot.customer_id),
          segment_id: asNumberLoose(pivot.segment_id),
        }
      : undefined,
  }
}

const unwrapCustomer = (data: JsonValue): unknown => {
  if (!isRecord(data)) return data
  if (isRecord(data.data)) return data.data
  if (isRecord(data.customer)) return data.customer
  return data
}

const parseCustomer = (raw: unknown): Customer => {
  if (!isRecord(raw)) throw new ApiError('Resposta inválida do servidor: customer')

  const segmentsRaw = Array.isArray(raw.segments) ? raw.segments : ([] as JsonArray)

  const lastPurchase =
    raw.last_purchase_at === null || raw.last_purchase_at === undefined
      ? null
      : typeof raw.last_purchase_at === 'string'
        ? raw.last_purchase_at
        : typeof raw.last_purchase_at === 'number'
          ? String(raw.last_purchase_at)
          : null

  return {
    id: asNumberLoose(raw.id),

    tenant_id: asNullableStringLike(raw.tenant_id),
    external_id: asNullableStringLike(raw.external_id),

    email: asStringOrEmpty(raw.email),
    birth_date: asNullableStringLike(raw.birth_date),
    phone: asStringOrEmpty(raw.phone),

    first_name: asStringOrEmpty(raw.first_name),
    last_name: asStringOrEmpty(raw.last_name),

    total_orders_count: asNumberLoose(raw.total_orders_count),

    lifetime_value: asStringOrEmpty(raw.lifetime_value),
    average_ticket: asStringOrEmpty(raw.average_ticket),

    last_purchase_at: lastPurchase,

    lifecycle_stage: asStringOrEmpty(raw.lifecycle_stage),
    preferences: parsePreferences(raw.preferences),

    created_at: asStringOrEmpty(raw.created_at),
    updated_at: asStringOrEmpty(raw.updated_at),

    segments: segmentsRaw.map(parseSegment),
  }
}

const parsePaginationLink = (data: unknown) => {
  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor: links')

  const page =
    data.page === null || typeof data.page === 'number'
      ? data.page
      : typeof data.page === 'string'
        ? Number(data.page)
        : null

  return {
    url: data.url === null ? null : typeof data.url === 'string' ? data.url : null,
    label: asString(data.label, 'links.label'),
    page: Number.isFinite(page as number) ? (page as number) : null,
    active: asBoolean(data.active, 'links.active'),
  }
}

const parseCustomersResponse = (data: JsonValue): CustomersResponse => {
  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor')

  const items = Array.isArray(data.data) ? data.data : ([] as JsonArray)
  const links = Array.isArray(data.links) ? data.links : ([] as JsonArray)

  return {
    current_page: asNumberLoose(data.current_page),
    data: items.map(parseCustomer),

    first_page_url: asString(data.first_page_url, 'first_page_url'),
    from: data.from === null || data.from === undefined ? null : asNumberLoose(data.from),
    last_page: asNumberLoose(data.last_page),
    last_page_url: asString(data.last_page_url, 'last_page_url'),
    links: links.map(parsePaginationLink),
    next_page_url:
      data.next_page_url === null || data.next_page_url === undefined
        ? null
        : typeof data.next_page_url === 'string'
          ? data.next_page_url
          : null,
    path: asString(data.path, 'path'),
    per_page: asNumberLoose(data.per_page),
    prev_page_url:
      data.prev_page_url === null || data.prev_page_url === undefined
        ? null
        : typeof data.prev_page_url === 'string'
          ? data.prev_page_url
          : null,
    to: data.to === null || data.to === undefined ? null : asNumberLoose(data.to),
    total: asNumberLoose(data.total),
  }
}

type CustomersListOptions = { page?: number; perPage?: number }

export const getCustomers = async (
  options: number | CustomersListOptions = 1,
): Promise<CustomersResponse> => {
  const page = typeof options === 'number' ? options : (options.page ?? 1)
  const perPage = typeof options === 'number' ? undefined : options.perPage
  const params = new URLSearchParams({ page: String(page) })
  if (perPage) params.set('per_page', String(perPage))
  const data = await apiFetch<JsonValue>(`${CUSTOMERS_ENDPOINT}?${params.toString()}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar clientes',
    networkErrorMessage: 'Falha de rede ao carregar clientes',
  })

  return parseCustomersResponse(data)
}

export const getCustomerById = async (id: number): Promise<Customer> => {
  const data = await apiFetch<JsonValue>(`${CUSTOMERS_ENDPOINT}/${id}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar detalhes do cliente',
    networkErrorMessage: 'Falha de rede ao carregar cliente',
  })

  return parseCustomer(unwrapCustomer(data))
}

export const createCustomer = async (payload: CustomerPayload): Promise<Customer> => {
  const data = await apiFetch<JsonValue>(CUSTOMERS_ENDPOINT, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao criar cliente',
    networkErrorMessage: 'Falha de rede ao criar cliente',
  })

  return parseCustomer(unwrapCustomer(data))
}

export const updateCustomer = async (id: number, payload: CustomerPayload): Promise<Customer> => {
  const data = await apiFetch<JsonValue>(`${CUSTOMERS_ENDPOINT}/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao atualizar cliente',
    networkErrorMessage: 'Falha de rede ao atualizar cliente',
  })

  return parseCustomer(unwrapCustomer(data))
}

export const deleteCustomer = async (id: number): Promise<void> => {
  await apiFetch(`${CUSTOMERS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    auth: true,
    errorMessage: 'Erro ao remover cliente',
    networkErrorMessage: 'Falha de rede ao remover cliente',
  })
}
