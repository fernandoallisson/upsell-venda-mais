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

const asNullableStringLike = (value: unknown, field: string): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
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

const parseRules = (data: unknown): SegmentRules => {
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
    parsed[key] = {
      value: asRuleValue(value.value, `rules.${key}.value`),
      operator: asString(value.operator, `rules.${key}.operator`),
    }
  })
  return parsed
}

const parsePreferences = (data: unknown): CustomerPreferences => {
  // não veio nada
  if (data === null || data === undefined) {
    return { sms: false, newsletter: false }
  }

  // formato: ["sms", "newsletter"]
  if (Array.isArray(data)) {
    const prefs = data.filter((v): v is string => typeof v === 'string')
    return {
      sms: prefs.includes('sms'),
      newsletter: prefs.includes('newsletter'),
    }
  }

  // formato: { sms: boolean, newsletter: boolean }
  if (isRecord(data)) {
    return {
      sms: typeof data.sms === 'boolean' ? data.sms : false,
      newsletter: typeof data.newsletter === 'boolean' ? data.newsletter : false,
    }
  }

  // qualquer outro formato inesperado
  return { sms: false, newsletter: false }
}



const parseSegment = (data: unknown): CustomerSegment => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: segment')
  }

  const pivot = isRecord(data.pivot) ? data.pivot : null

  return {
    id: asNumber(data.id, 'segment.id'),
    name: asString(data.name, 'segment.name'),
    rules: parseRules(data.rules),
    created_at: asString(data.created_at, 'segment.created_at'),
    updated_at: asString(data.updated_at, 'segment.updated_at'),
    pivot: pivot
      ? {
          customer_id: asNumber(pivot.customer_id, 'segment.pivot.customer_id'),
          segment_id: asNumber(pivot.segment_id, 'segment.pivot.segment_id'),
        }
      : undefined,
  }
}

const parseCustomer = (data: unknown): Customer => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: customer')
  }

  const segments = Array.isArray(data.segments) ? data.segments : ([] as JsonArray)

  return {
    id: asNumber(data.id, 'customer.id'),
    tenant_id: asNullableStringLike(data.tenant_id, 'customer.tenant_id'),
    external_id: asNullableStringLike(data.external_id, 'customer.external_id'),
    email: asString(data.email, 'customer.email'),
    phone: asString(data.phone, 'customer.phone'),
    first_name: asString(data.first_name, 'customer.first_name'),
    last_name: asString(data.last_name, 'customer.last_name'),
    total_orders_count: asNumber(data.total_orders_count, 'customer.total_orders_count'),
    lifetime_value: asString(data.lifetime_value, 'customer.lifetime_value'),
    average_ticket: asString(data.average_ticket, 'customer.average_ticket'),
    last_purchase_at: asString(data.last_purchase_at, 'customer.last_purchase_at'),
    lifecycle_stage: asString(data.lifecycle_stage, 'customer.lifecycle_stage'),
    preferences: parsePreferences(data.preferences),
    created_at: asString(data.created_at, 'customer.created_at'),
    updated_at: asString(data.updated_at, 'customer.updated_at'),
    segments: segments.map(parseSegment),
  }
}

const parsePaginationLink = (data: unknown): PaginationLink => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: links')
  }

  const page = data.page === null || typeof data.page === 'number' ? data.page : null

  return {
    url: asNullableString(data.url, 'links.url'),
    label: asString(data.label, 'links.label'),
    page,
    active: asBoolean(data.active, 'links.active'),
  }
}

const parseCustomersResponse = (data: JsonValue): CustomersResponse => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor')
  }

  const items = Array.isArray(data.data) ? data.data : ([] as JsonArray)
  const links = Array.isArray(data.links) ? data.links : ([] as JsonArray)

  return {
    current_page: asNumber(data.current_page, 'current_page'),
    data: items.map(parseCustomer),

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

  return parseCustomer(data)
}

export const createCustomer = async (payload: CustomerPayload): Promise<Customer> => {
  const data = await apiFetch<JsonValue>(CUSTOMERS_ENDPOINT, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao criar cliente',
    networkErrorMessage: 'Falha de rede ao criar cliente',
  })

  return parseCustomer(data)
}

export const updateCustomer = async (
  id: number,
  payload: CustomerPayload,
): Promise<Customer> => {
  const data = await apiFetch<JsonValue>(`${CUSTOMERS_ENDPOINT}/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao atualizar cliente',
    networkErrorMessage: 'Falha de rede ao atualizar cliente',
  })

  return parseCustomer(data)
}

export const deleteCustomer = async (id: number): Promise<void> => {
  await apiFetch(`${CUSTOMERS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    auth: true,
    errorMessage: 'Erro ao remover cliente',
    networkErrorMessage: 'Falha de rede ao remover cliente',
  })
}
