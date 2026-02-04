import { ApiError, apiFetch } from '../../api'
import type {
  Campaign,
  CampaignDetails,
  CampaignOffer,
  CampaignOfferProduct,
  CampaignProduct,
  CampaignProductPivot,
  CampaignsResponse,
  CampaignTimeframe,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from './campaigns.types'

type JsonValue = Record<string, unknown> | null
type JsonArray = unknown[]

const CAMPAIGNS_ENDPOINT = '/v1/campaigns'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

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

const asNumberLike = (value: unknown, field: string): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
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

const parseCampaign = (data: unknown): Campaign => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: campaign')
  }

  return {
    id: asNumber(data.id, 'campaign.id'),
    name: asString(data.name, 'campaign.name'),
    priority: asNumber(data.priority, 'campaign.priority'),
    is_active: asBoolean(data.is_active, 'campaign.is_active'),
    start_date: asString(data.start_date, 'campaign.start_date'),
    end_date: asString(data.end_date, 'campaign.end_date'),
    deleted_at: asNullableString(data.deleted_at, 'campaign.deleted_at'),
    created_at: asString(data.created_at, 'campaign.created_at'),
    updated_at: asString(data.updated_at, 'campaign.updated_at'),
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

const parseOfferProduct = (data: unknown): CampaignOfferProduct => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: offer.product')
  }

  return {
    id: asNumber(data.id, 'offer.product.id'),
    category_id: asNullableNumberLike(
      data.category_id,
      'offer.product.category_id',
    ),
    external_id: asNullableString(data.external_id, 'offer.product.external_id'),
    sku: asString(data.sku, 'offer.product.sku'),
    name: asString(data.name, 'offer.product.name'),
    image_url: asString(data.image_url, 'offer.product.image_url'),
    price: asString(data.price, 'offer.product.price'),
    compare_at_price: asString(
      data.compare_at_price,
      'offer.product.compare_at_price',
    ),
    cost_price: asString(data.cost_price, 'offer.product.cost_price'),
    is_active: asBoolean(data.is_active, 'offer.product.is_active'),
    deleted_at: asNullableString(data.deleted_at, 'offer.product.deleted_at'),
    created_at: asString(data.created_at, 'offer.product.created_at'),
    updated_at: asString(data.updated_at, 'offer.product.updated_at'),
  }
}

const parseCampaignProductCategory = (data: unknown) => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: product.category')
  }

  return {
    id: asNumber(data.id, 'product.category.id'),
    tenant_id: asNullableStringLike(data.tenant_id, 'product.category.tenant_id'),
    external_id: asNullableStringLike(
      data.external_id,
      'product.category.external_id',
    ),
    name: asString(data.name, 'product.category.name'),
    created_at: asString(data.created_at, 'product.category.created_at'),
    updated_at: asString(data.updated_at, 'product.category.updated_at'),
  }
}

const parseCampaignProductPivot = (data: unknown): CampaignProductPivot => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: product.pivot')
  }

  return {
    upsell_campaign_id: asNumber(
      data.upsell_campaign_id,
      'product.pivot.upsell_campaign_id',
    ),
    product_id: asNumber(data.product_id, 'product.pivot.product_id'),
    tenant_id: asNullableStringLike(
      data.tenant_id,
      'product.pivot.tenant_id',
    ),
    created_at: asString(data.created_at, 'product.pivot.created_at'),
    updated_at: asString(data.updated_at, 'product.pivot.updated_at'),
  }
}

const parseCampaignProduct = (data: unknown): CampaignProduct => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: product')
  }

  return {
    id: asNumber(data.id, 'product.id'),
    tenant_id: asNullableStringLike(data.tenant_id, 'product.tenant_id'),
    category_id: asNullableNumberLike(data.category_id, 'product.category_id'),
    external_id: asNullableStringLike(data.external_id, 'product.external_id'),
    sku: asString(data.sku, 'product.sku'),
    name: asString(data.name, 'product.name'),
    image_url: asString(data.image_url, 'product.image_url'),
    price: asString(data.price, 'product.price'),
    compare_at_price: asString(data.compare_at_price, 'product.compare_at_price'),
    cost_price: asString(data.cost_price, 'product.cost_price'),
    is_active: asBoolean(data.is_active, 'product.is_active'),
    deleted_at: asNullableString(data.deleted_at, 'product.deleted_at'),
    created_at: asString(data.created_at, 'product.created_at'),
    updated_at: asString(data.updated_at, 'product.updated_at'),
    category: data.category ? parseCampaignProductCategory(data.category) : null,
    pivot: parseCampaignProductPivot(data.pivot),
  }
}

const parseCampaignProductsResponse = (data: JsonValue): CampaignProduct[] => {
  if (!data) return []
  if (!Array.isArray(data)) {
    throw new ApiError('Resposta inválida do servidor: products')
  }

  return data.map(parseCampaignProduct)
}

const parseOffer = (data: unknown): CampaignOffer => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: offer')
  }

  return {
    id: asNumber(data.id, 'offer.id'),
    product: parseOfferProduct(data.product),
    type: asString(data.type, 'offer.type'),
    views: asNumberLike(data.views, 'offer.views'),
    clicks: asNumberLike(data.clicks, 'offer.clicks'),
    accepted: asNumberLike(data.accepted, 'offer.accepted'),
    rejected: asNumberLike(data.rejected, 'offer.rejected'),
    orders_count: asNumberLike(data.orders_count, 'offer.orders_count'),
    revenue: asNumberLike(data.revenue, 'offer.revenue'),
    conversion_rate: asNumberLike(data.conversion_rate, 'offer.conversion_rate'),
    click_to_accept_rate: asNumberLike(
      data.click_to_accept_rate,
      'offer.click_to_accept_rate',
    ),
    revenue_per_view: asNumberLike(
      data.revenue_per_view,
      'offer.revenue_per_view',
    ),
  }
}

const parseTimeframe = (data: unknown): CampaignTimeframe => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: timeframe')
  }

  return {
    start: asString(data.start, 'timeframe.start'),
    end: asString(data.end, 'timeframe.end'),
  }
}

const parseCampaignDetails = (data: JsonValue): CampaignDetails => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor')
  }

  const campaignData = isRecord(data.campaign) ? data.campaign : null
  if (!campaignData) {
    throw new ApiError('Resposta inválida do servidor: campaign')
  }

  const offersData = Array.isArray(data.offers) ? data.offers : []
  const dailyData = Array.isArray(data.daily) ? data.daily : []
  const totals = isRecord(data.totals) ? data.totals : {}

  return {
    campaign: {
      id: asNumber(campaignData.id, 'campaign.id'),
      name: asString(campaignData.name, 'campaign.name'),
      priority: asNumber(campaignData.priority, 'campaign.priority'),
      is_active: asBoolean(campaignData.is_active, 'campaign.is_active'),
      start_date: asString(campaignData.start_date, 'campaign.start_date'),
      end_date: asString(campaignData.end_date, 'campaign.end_date'),
    },
    offers: offersData.map(parseOffer),
    totals: {
      views: asNumberLike(totals.views, 'totals.views'),
      clicks: asNumberLike(totals.clicks, 'totals.clicks'),
      accepted: asNumberLike(totals.accepted, 'totals.accepted'),
      rejected: asNumberLike(totals.rejected, 'totals.rejected'),
      revenue: asNumberLike(totals.revenue, 'totals.revenue'),
      orders: asNumberLike(totals.orders, 'totals.orders'),
      conversion_rate: asNumberLike(
        totals.conversion_rate,
        'totals.conversion_rate',
      ),
      click_to_accept_rate: asNumberLike(
        totals.click_to_accept_rate,
        'totals.click_to_accept_rate',
      ),
      revenue_per_view: asNumberLike(
        totals.revenue_per_view,
        'totals.revenue_per_view',
      ),
    },
    timeframe: parseTimeframe(data.timeframe),
    daily: dailyData.map((entry) => {
      if (!isRecord(entry)) {
        throw new ApiError('Resposta inválida do servidor: daily')
      }

      return {
        date: asString(entry.date, 'daily.date'),
        views: asNumberLike(entry.views, 'daily.views'),
        clicks: asNumberLike(entry.clicks, 'daily.clicks'),
        accepted: asNumberLike(entry.accepted, 'daily.accepted'),
        revenue: asNumberLike(entry.revenue, 'daily.revenue'),
      }
    }),
  }
}

const parseCampaignsResponse = (data: JsonValue): CampaignsResponse => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor')
  }

  const items = Array.isArray(data.data) ? data.data : ([] as JsonArray)
  const links = Array.isArray(data.links) ? data.links : ([] as JsonArray)

  return {
    current_page: asNumber(data.current_page, 'current_page'),
    data: items.map(parseCampaign),
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

export const getCampaigns = async (page = 1): Promise<CampaignsResponse> => {
  const data = await apiFetch<JsonValue>(`${CAMPAIGNS_ENDPOINT}?page=${page}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar campanhas',
    networkErrorMessage: 'Falha de rede ao carregar campanhas',
  })

  return parseCampaignsResponse(data)
}

export const getCampaignById = async (id: number): Promise<CampaignDetails> => {
  const data = await apiFetch<JsonValue>(`${CAMPAIGNS_ENDPOINT}/${id}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar detalhes da campanha',
    networkErrorMessage: 'Falha de rede ao carregar campanha',
  })

  return parseCampaignDetails(data)
}

export const createCampaign = async (
  payload: CreateCampaignPayload,
): Promise<Campaign> => {
  const data = await apiFetch<JsonValue>(CAMPAIGNS_ENDPOINT, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao criar campanha',
    networkErrorMessage: 'Falha de rede ao criar campanha',
  })

  return parseCampaign(data)
}

export const updateCampaign = async (
  id: number,
  payload: UpdateCampaignPayload,
): Promise<Campaign> => {
  const data = await apiFetch<JsonValue>(`${CAMPAIGNS_ENDPOINT}/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao atualizar campanha',
    networkErrorMessage: 'Falha de rede ao atualizar campanha',
  })

  return parseCampaign(data)
}

export const deleteCampaign = async (id: number): Promise<void> => {
  await apiFetch<JsonValue>(`${CAMPAIGNS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    auth: true,
    errorMessage: 'Erro ao remover campanha',
    networkErrorMessage: 'Falha de rede ao remover campanha',
  })
}

export const getCampaignProducts = async (
  id: number,
): Promise<CampaignProduct[]> => {
  const data = await apiFetch<JsonValue>(
    `${CAMPAIGNS_ENDPOINT}/${id}/products`,
    {
      method: 'GET',
      auth: true,
      errorMessage: 'Erro ao carregar produtos da campanha',
      networkErrorMessage: 'Falha de rede ao carregar produtos da campanha',
    },
  )

  return parseCampaignProductsResponse(data)
}

export const updateCampaignProducts = async (
  id: number,
  products: number[],
): Promise<CampaignProduct[]> => {
  const data = await apiFetch<JsonValue>(
    `${CAMPAIGNS_ENDPOINT}/${id}/products`,
    {
      method: 'PUT',
      auth: true,
      body: JSON.stringify({ products }),
      errorMessage: 'Erro ao atualizar produtos da campanha',
      networkErrorMessage: 'Falha de rede ao atualizar produtos da campanha',
    },
  )

  return parseCampaignProductsResponse(data)
}
