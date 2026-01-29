import { ApiError, apiFetch } from '../../api'
import type { Order, OrderCustomer, OrderItem, OrderPreferences, OrdersResponse, OrderUtm } from './orders.types'

type JsonValue = Record<string, unknown> | null

type JsonArray = unknown[]

const ORDERS_ENDPOINT = '/v1/orders'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const asNullableString = (value: unknown, field: string): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
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

const parsePreferences = (data: unknown): OrderPreferences => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: preferences')
  }

  return {
    sms: asBoolean(data.sms, 'preferences.sms'),
    newsletter: asBoolean(data.newsletter, 'preferences.newsletter'),
  }
}

const parseCustomer = (data: unknown): OrderCustomer => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: customer')
  }

  return {
    id: asNumber(data.id, 'customer.id'),
    tenant_id: asString(data.tenant_id, 'customer.tenant_id'),
    external_id: asString(data.external_id, 'customer.external_id'),
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
  }
}

const parseItem = (data: unknown): OrderItem => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: items')
  }

  const upsellOfferId =
    data.upsell_offer_id === null || typeof data.upsell_offer_id === 'number'
      ? data.upsell_offer_id
      : null

  return {
    id: asNumber(data.id, 'items.id'),
    order_id: asNumber(data.order_id, 'items.order_id'),
    product_id: asNumber(data.product_id, 'items.product_id'),
    is_upsell: asBoolean(data.is_upsell, 'items.is_upsell'),
    upsell_offer_id: upsellOfferId,
    product_name: asString(data.product_name, 'items.product_name'),
    quantity: asNumber(data.quantity, 'items.quantity'),
    price: asString(data.price, 'items.price'),
    total: asString(data.total, 'items.total'),
    attribution_meta: isRecord(data.attribution_meta) ? data.attribution_meta : null,
    created_at: asString(data.created_at, 'items.created_at'),
    updated_at: asString(data.updated_at, 'items.updated_at'),
  }
}

const parseUtm = (data: unknown): OrderUtm | null => {
  if (data === null || data === undefined) return null

  if (Array.isArray(data)) return null

  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: utm')
  }

  return {
    id: asNumber(data.id, 'utm.id'),
    order_id: asNumber(data.order_id, 'utm.order_id'),
    source: asString(data.source, 'utm.source'),
    medium: asString(data.medium, 'utm.medium'),
    campaign: asString(data.campaign, 'utm.campaign'),
    term: asNullableString(data.term, 'utm.term'),
    content: asNullableString(data.content, 'utm.content'),
    created_at: asString(data.created_at, 'utm.created_at'),
    updated_at: asString(data.updated_at, 'utm.updated_at'),
  }
}

const parseOrder = (data: unknown): Order => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: order')
  }

  const items = Array.isArray(data.items) ? data.items : ([] as JsonArray)

  return {
    id: asNumber(data.id, 'order.id'),
    tenant_id: asString(data.tenant_id, 'order.tenant_id'),
    customer_id: asNumber(data.customer_id, 'order.customer_id'),
    external_id: asString(data.external_id, 'order.external_id'),
    total_amount: asString(data.total_amount, 'order.total_amount'),
    subtotal_amount: asString(data.subtotal_amount, 'order.subtotal_amount'),
    currency: asString(data.currency, 'order.currency'),
    status: asString(data.status, 'order.status'),
    placed_at: asString(data.placed_at, 'order.placed_at'),
    created_at: asString(data.created_at, 'order.created_at'),
    updated_at: asString(data.updated_at, 'order.updated_at'),
    customer: parseCustomer(data.customer),
    items: items.map(parseItem),
    utm: parseUtm(data.utm),
  }
}

const parseOrdersResponse = (data: JsonValue): OrdersResponse => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor')
  }

  const items = Array.isArray(data.data) ? data.data : ([] as JsonArray)

  return {
    current_page: asNumber(data.current_page, 'current_page'),
    data: items.map(parseOrder),
  }
}

export const getOrders = async (page = 1): Promise<OrdersResponse> => {
  const data = await apiFetch<JsonValue>(`${ORDERS_ENDPOINT}?page=${page}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar pedidos',
    networkErrorMessage: 'Falha de rede ao carregar pedidos',
  })

  return parseOrdersResponse(data)
}

export const getOrderById = async (id: number): Promise<Order> => {
  const data = await apiFetch<JsonValue>(`${ORDERS_ENDPOINT}/${id}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar detalhes do pedido',
    networkErrorMessage: 'Falha de rede ao carregar pedido',
  })

  return parseOrder(data)
}
