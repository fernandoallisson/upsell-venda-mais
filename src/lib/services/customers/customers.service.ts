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

const asNullableDateLike = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value) // timestamp, etc.
  return null // não quebra se vier objeto/array/etc
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

const asNullableString = (value: unknown, field: string): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asBoolean = (value: unknown, field: string): boolean => {
  if (typeof value === 'boolean') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

// super tolerante: não quebra por causa de POST/PUT inconsistentes
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
  // backend às vezes manda rules como array de strings
  if (Array.isArray(data)) {
    return data
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean)
  }

  if (!isRecord(data)) return {}

  const parsed: Record<string, { value: number | string; operator: string }> = {}
  Object.entries(data).forEach(([key, value]) => {
    if (!isRecord(value)) return
    if (!('value' in value) || !('operator' in value)) return

    const ruleValue = (value as any).value
    const operator = (value as any).operator

    if (typeof operator !== 'string') return
    if (typeof ruleValue !== 'string' && typeof ruleValue !== 'number') return

    parsed[key] = { value: ruleValue, operator }
  })

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

// aceita diferentes envelopes: {data:{...}}, {customer:{...}} ou objeto direto
const unwrapCustomer = (data: JsonValue): unknown => {
  if (!isRecord(data)) return data
  if (isRecord((data as any).data)) return (data as any).data
  if (isRecord((data as any).customer)) return (data as any).customer
  return data
}

const parseCustomer = (raw: unknown): Customer => {
  const data = isRecord(raw) ? raw : null
  if (!data) throw new ApiError('Resposta inválida do servidor: customer')

  const segmentsRaw = Array.isArray(data.segments) ? data.segments : ([] as JsonArray)

  // campos “essenciais” do seu UI
  const firstName = asStringOrEmpty(data.first_name)
  const lastName = asStringOrEmpty(data.last_name)

  return {
    id: asNumberLoose(data.id),
    tenant_id: asNullableStringLike(data.tenant_id),
    external_id: asNullableStringLike(data.external_id),

    email: asStringOrEmpty(data.email),
    phone: asStringOrEmpty(data.phone),

    // não quebra se o POST vier “incompleto”
    first_name: firstName,
    last_name: lastName,

    total_orders_count: asNumberLoose(data.total_orders_count),

    lifetime_value: asStringOrEmpty(data.lifetime_value),
    average_ticket: asStringOrEmpty(data.average_ticket),

    last_purchase_at: asNullableString(data.last_purchase_at, 'customer.last_purchase_at') ?? null,

    lifecycle_stage: asStringOrEmpty(data.lifecycle_stage),
    preferences: parsePreferences(data.preferences),

    created_at: asStringOrEmpty(data.created_at),
    updated_at: asStringOrEmpty(data.updated_at),

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
    data: items.map((item) => parseCustomer(item)),

    first_page_url: asString(data.first_page_url, 'first_page_url'),
    from: data.from === null ? null : asNumberLoose(data.from),
    last_page: asNumberLoose(data.last_page),
    last_page_url: asString(data.last_page_url, 'last_page_url'),
    links: links.map(parsePaginationLink),
    next_page_url: data.next_page_url === null ? null : asNullableString(data.next_page_url, 'next_page_url'),
    path: asString(data.path, 'path'),
    per_page: asNumberLoose(data.per_page),
    prev_page_url: data.prev_page_url === null ? null : asNullableString(data.prev_page_url, 'prev_page_url'),
    to: data.to === null ? null : asNumberLoose(data.to),
    total: asNumberLoose(data.total),
  }
}

export const getCustomers = async (page = 1): Promise<CustomersResponse> => {
  const data = await apiFetch<JsonValue>(`${CUSTOMERS_ENDPOINT}?page=${page}`, {
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
