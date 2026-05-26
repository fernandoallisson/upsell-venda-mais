import { ApiError, apiFetch } from '../../api'
import { API_CACHE_TAGS } from '../cacheTags'
import type {
  CreateProductPayload,
  Product,
  ProductCategory,
  ProductsResponse,
  UpdateProductPayload,
} from './products.types'

type JsonValue = Record<string, unknown> | null

type JsonArray = unknown[]

const PRODUCTS_ENDPOINT = '/v1/products'

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

const asNullableNumberLike = (value: unknown, field: string): number | null => {
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

const parseCategory = (data: unknown): ProductCategory => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: category')
  }

  return {
    id: asNumber(data.id, 'category.id'),
    tenant_id: asNullableStringLike(data.tenant_id, 'category.tenant_id'),
    external_id: asNullableStringLike(data.external_id, 'category.external_id'),
    name: asString(data.name, 'category.name'),
    created_at: asString(data.created_at, 'category.created_at'),
    updated_at: asString(data.updated_at, 'category.updated_at'),
  }
}

const parseProduct = (data: unknown): Product => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: product')
  }

  const category = data.category ? parseCategory(data.category) : null

  return {
    id: asNumber(data.id, 'product.id'),
    tenant_id: asNullableStringLike(data.tenant_id, 'product.tenant_id'),
    category_id: asNullableNumberLike(data.category_id, 'product.category_id'),
    external_id: asNullableStringLike(data.external_id, 'product.external_id'),
    sku: asString(data.sku, 'product.sku'),
    name: asString(data.name, 'product.name'),
    image_url: asNullableString(data.image_url, 'product.image_url'),
    price: asString(data.price, 'product.price'),
    compare_at_price: asString(data.compare_at_price, 'product.compare_at_price'),
    cost_price: asString(data.cost_price, 'product.cost_price'),
    is_active: asBoolean(data.is_active, 'product.is_active'),
    deleted_at: asNullableString(data.deleted_at, 'product.deleted_at'),
    created_at: asString(data.created_at, 'product.created_at'),
    updated_at: asString(data.updated_at, 'product.updated_at'),
    category,
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

const parseProductsResponse = (data: JsonValue): ProductsResponse => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor')
  }

  const items = Array.isArray(data.data) ? data.data : ([] as JsonArray)
  const links = Array.isArray(data.links) ? data.links : ([] as JsonArray)

  return {
    current_page: asNumber(data.current_page, 'current_page'),
    data: items.map(parseProduct),

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

type ProductsListOptions = { page?: number; perPage?: number }

export const getProducts = async (
  options: number | ProductsListOptions = 1,
): Promise<ProductsResponse> => {
  const page = typeof options === 'number' ? options : (options.page ?? 1)
  const perPage = typeof options === 'number' ? undefined : options.perPage
  const params = new URLSearchParams({ page: String(page) })
  if (perPage) params.set('per_page', String(perPage))
  const data = await apiFetch<JsonValue>(`${PRODUCTS_ENDPOINT}?${params.toString()}`, {
    method: 'GET',
    auth: true,
    cache: true,
    cacheTags: [API_CACHE_TAGS.products],
    errorMessage: 'Erro ao carregar produtos',
    networkErrorMessage: 'Falha de rede ao carregar produtos',
  })

  return parseProductsResponse(data)
}

export const getProductById = async (id: number): Promise<Product> => {
  const data = await apiFetch<JsonValue>(`${PRODUCTS_ENDPOINT}/${id}`, {
    method: 'GET',
    auth: true,
    cache: true,
    cacheTags: [API_CACHE_TAGS.products],
    errorMessage: 'Erro ao carregar detalhes do produto',
    networkErrorMessage: 'Falha de rede ao carregar produto',
  })

  return parseProduct(data)
}

export const createProduct = async (
  payload: CreateProductPayload,
): Promise<Product> => {
  const data = await apiFetch<JsonValue>(PRODUCTS_ENDPOINT, {
    method: 'POST',
    auth: true,
    invalidateTags: [
      API_CACHE_TAGS.products,
      API_CACHE_TAGS.campaigns,
      API_CACHE_TAGS.offers,
      API_CACHE_TAGS.analytics,
    ],
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao criar produto',
    networkErrorMessage: 'Falha de rede ao criar produto',
  })

  return parseProduct(data)
}

export const updateProduct = async (
  id: number,
  payload: UpdateProductPayload,
): Promise<Product> => {
  const data = await apiFetch<JsonValue>(`${PRODUCTS_ENDPOINT}/${id}`, {
    method: 'PUT',
    auth: true,
    invalidateTags: [
      API_CACHE_TAGS.products,
      API_CACHE_TAGS.campaigns,
      API_CACHE_TAGS.offers,
      API_CACHE_TAGS.analytics,
    ],
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao atualizar produto',
    networkErrorMessage: 'Falha de rede ao atualizar produto',
  })

  return parseProduct(data)
}

export const deleteProduct = async (id: number): Promise<void> => {
  await apiFetch<JsonValue>(`${PRODUCTS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    auth: true,
    invalidateTags: [
      API_CACHE_TAGS.products,
      API_CACHE_TAGS.campaigns,
      API_CACHE_TAGS.offers,
      API_CACHE_TAGS.analytics,
    ],
    errorMessage: 'Erro ao remover produto',
    networkErrorMessage: 'Falha de rede ao remover produto',
  })
}
