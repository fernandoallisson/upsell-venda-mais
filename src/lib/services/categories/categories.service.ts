import { ApiError, apiFetch } from '../../api'
import type {
  CategoriesResponse,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from './categories.types'

type JsonValue = Record<string, unknown> | null

type JsonArray = unknown[]

const CATEGORIES_ENDPOINT = '/v1/categories'

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

const asNullableStringLike = (value: unknown, field: string): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
}

const asStringLike = (value: unknown, field: string): string => {
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

const parseCategory = (data: unknown): Category => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: category')
  }

  return {
    id: asNumber(data.id, 'category.id'),
    tenant_id: asStringLike(data.tenant_id, 'category.tenant_id'),
    external_id: asStringLike(data.external_id, 'category.external_id'),
    name: asString(data.name, 'category.name'),
    created_at: asString(data.created_at, 'category.created_at'),
    updated_at: asString(data.updated_at, 'category.updated_at'),
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

const parseCategoriesResponse = (data: JsonValue): CategoriesResponse => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor')
  }

  const items = Array.isArray(data.data) ? data.data : ([] as JsonArray)
  const links = Array.isArray(data.links) ? data.links : ([] as JsonArray)

  return {
    current_page: asNumber(data.current_page, 'current_page'),
    data: items.map(parseCategory),

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

export const getCategories = async (page = 1): Promise<CategoriesResponse> => {
  const data = await apiFetch<JsonValue>(`${CATEGORIES_ENDPOINT}?page=${page}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar categorias',
    networkErrorMessage: 'Falha de rede ao carregar categorias',
  })

  return parseCategoriesResponse(data)
}

export const getCategoryById = async (id: number): Promise<Category> => {
  const data = await apiFetch<JsonValue>(`${CATEGORIES_ENDPOINT}/${id}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar detalhes da categoria',
    networkErrorMessage: 'Falha de rede ao carregar categoria',
  })

  return parseCategory(data)
}

export const createCategory = async (
  payload: CreateCategoryPayload,
): Promise<Category> => {
  const data = await apiFetch<JsonValue>(CATEGORIES_ENDPOINT, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao criar categoria',
    networkErrorMessage: 'Falha de rede ao criar categoria',
  })

  return parseCategory(data)
}

export const updateCategory = async (
  id: number,
  payload: UpdateCategoryPayload,
): Promise<Category> => {
  const data = await apiFetch<JsonValue>(`${CATEGORIES_ENDPOINT}/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao atualizar categoria',
    networkErrorMessage: 'Falha de rede ao atualizar categoria',
  })

  return parseCategory(data)
}

export const deleteCategory = async (id: number): Promise<void> => {
  await apiFetch<JsonValue>(`${CATEGORIES_ENDPOINT}/${id}`, {
    method: 'DELETE',
    auth: true,
    errorMessage: 'Erro ao remover categoria',
    networkErrorMessage: 'Falha de rede ao remover categoria',
  })
}
