import { ApiError, apiFetch } from '../../api'
import type {
  CreateOfferPayload,
  Offer,
  OfferResponse,
  OffersResponse,
  UpdateOfferPayload,
} from './offers.types'

type JsonValue = Record<string, unknown> | null

type JsonArray = unknown[]

const OFFERS_ENDPOINT = '/v1/offers'

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

const asNumberLike = (value: unknown, field: string): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asNullableNumber = (value: unknown, field: string): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asNullableNumberLike = (
  value: unknown,
  field: string,
): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const normalized = value.trim()
    if (!normalized) return null
    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? null : parsed
  }
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asBoolean = (value: unknown, field: string): boolean => {
  if (typeof value === 'boolean') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const parseOffer = (data: unknown): Offer => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: offer')
  }

  return {
    id: asNumber(data.id, 'offer.id'),
    upsell_campaign_id: asNumber(
      data.upsell_campaign_id,
      'offer.upsell_campaign_id',
    ),
    product_id: asNumber(data.product_id, 'offer.product_id'),
    segment_id: asNullableNumberLike(data.segment_id, 'offer.segment_id'),
    type: asString(data.type, 'offer.type'),
    discount_type: asString(data.discount_type, 'offer.discount_type'),
    discount_value: asNumberLike(data.discount_value, 'offer.discount_value'),
    headline: asString(data.headline, 'offer.headline'),
    description: asString(data.description, 'offer.description'),
    views_count: asNumberLike(data.views_count, 'offer.views_count'),
    clicks_count: asNumberLike(data.clicks_count, 'offer.clicks_count'),
    accepted_count: asNumberLike(data.accepted_count, 'offer.accepted_count'),
    revenue_generated: asNumberLike(
      data.revenue_generated,
      'offer.revenue_generated',
    ),
    deleted_at: asNullableString(data.deleted_at, 'offer.deleted_at'),
    created_at: asString(data.created_at, 'offer.created_at'),
    updated_at: asString(data.updated_at, 'offer.updated_at'),
  }
}

const parsePaginationLink = (data: unknown) => {
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

const parseOffersResponse = (data: JsonValue): OffersResponse => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor')
  }

  const items = Array.isArray(data.data) ? data.data : []
  const links: JsonArray = Array.isArray(data.links) ? data.links : []

  return {
    current_page: asNumber(data.current_page, 'current_page'),
    data: items.map(parseOffer),
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

export const getOffers = async (page = 1): Promise<OffersResponse> => {
  const data = await apiFetch<JsonValue>(`${OFFERS_ENDPOINT}?page=${page}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar ofertas',
    networkErrorMessage: 'Falha de rede ao carregar ofertas',
  })

  return parseOffersResponse(data)
}

export const getOfferById = async (id: number): Promise<OfferResponse> => {
  const data = await apiFetch<JsonValue>(`${OFFERS_ENDPOINT}/${id}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar detalhes da oferta',
    networkErrorMessage: 'Falha de rede ao carregar detalhes da oferta',
  })

  return parseOffer(data)
}

export const createOffer = async (
  payload: CreateOfferPayload,
): Promise<Offer> => {
  const data = await apiFetch<JsonValue>(OFFERS_ENDPOINT, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao criar oferta',
    networkErrorMessage: 'Falha de rede ao criar oferta',
  })

  return parseOffer(data)
}

export const updateOffer = async (
  id: number,
  payload: UpdateOfferPayload,
): Promise<Offer> => {
  const data = await apiFetch<JsonValue>(`${OFFERS_ENDPOINT}/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao atualizar oferta',
    networkErrorMessage: 'Falha de rede ao atualizar oferta',
  })

  return parseOffer(data)
}

export const deleteOffer = async (id: number): Promise<void> => {
  await apiFetch<JsonValue>(`${OFFERS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    auth: true,
    errorMessage: 'Erro ao remover oferta',
    networkErrorMessage: 'Falha de rede ao remover oferta',
  })
}
