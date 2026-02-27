import { ApiError, apiFetch } from '../../api'
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserListItem,
  UsersResponse,
} from './users.types'

const USER_ENDPOINT = '/v1/user'
const AUTH_ME_ENDPOINT = '/v1/auth/me'
const USERS_ENDPOINT = '/v1/users'

type JsonValue = Record<string, unknown> | null

type JsonArray = unknown[]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// Aceita string/number e converte para string. Opcional: pode retornar null.
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

const parseUser = (data: JsonValue): User => {
  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor: user')

  const createdAt = asNullableString(data.created_at, 'user.created_at')
  const updatedAt = asNullableString(data.updated_at, 'user.updated_at')

  return {
    id: asNumber(data.id, 'user.id'),
    name: asString(data.name, 'user.name'),
    email: asString(data.email, 'user.email'),
    email_verified_at: asNullableString(
      data.email_verified_at,
      'user.email_verified_at',
    ),
    created_at: createdAt ?? updatedAt ?? '',
    updated_at: updatedAt ?? createdAt ?? '',
    // tenant_id no backend pode vir number/string (e às vezes null). Mantemos null se vier.
    tenant_id: asNullableStringLike(data.tenant_id, 'user.tenant_id'),
  }
}

const parseUserListItem = (data: unknown): UserListItem => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor: user')
  }

  return {
    id: asNumber(data.id, 'user.id'),
    name: asString(data.name, 'user.name'),
    email: asString(data.email, 'user.email'),
    created_at: asString(data.created_at, 'user.created_at'),
  }
}

type PaginationLink = {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

const asBoolean = (value: unknown, field: string): boolean => {
  if (typeof value === 'boolean') return value
  throw new ApiError(`Resposta inválida do servidor: ${field}`)
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

const parseUsersResponse = (data: JsonValue): UsersResponse => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor')
  }

  const items = Array.isArray(data.data) ? data.data : ([] as JsonArray)
  const links = Array.isArray(data.links) ? data.links : ([] as JsonArray)

  return {
    current_page: asNumber(data.current_page, 'current_page'),
    data: items.map(parseUserListItem),

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

export const getUsers = async (page = 1): Promise<UsersResponse> => {
  const data = await apiFetch<JsonValue>(`${USERS_ENDPOINT}?page=${page}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar usuários',
    networkErrorMessage: 'Falha de rede ao carregar usuários',
  })

  return parseUsersResponse(data)
}

export const getUserById = async (id: number): Promise<User> => {
  const data = await apiFetch<JsonValue>(`${USERS_ENDPOINT}/${id}`, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar detalhes do usuário',
    networkErrorMessage: 'Falha de rede ao carregar usuário',
  })

  return parseUser(data)
}

export const createUser = async (
  payload: CreateUserPayload,
): Promise<User> => {
  const data = await apiFetch<JsonValue>(USERS_ENDPOINT, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao criar usuário',
    networkErrorMessage: 'Falha de rede ao criar usuário',
  })

  return parseUser(data)
}

export const updateUserById = async (
  id: number,
  payload: UpdateUserPayload,
): Promise<User> => {
  const data = await apiFetch<JsonValue>(`${USERS_ENDPOINT}/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao atualizar usuário',
    networkErrorMessage: 'Falha de rede ao atualizar usuário',
  })

  return parseUser(data)
}

export const deleteUserById = async (id: number): Promise<void> => {
  await apiFetch<JsonValue>(`${USERS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    auth: true,
    errorMessage: 'Erro ao remover usuário',
    networkErrorMessage: 'Falha de rede ao remover usuário',
  })
}

export const getUser = async (): Promise<User> => {
  const data = await apiFetch<JsonValue>(USER_ENDPOINT, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao buscar usuário',
    networkErrorMessage: 'Falha de rede ao buscar usuário',
  })

  return parseUser(data)
}

export const updateUser = async (
  method: 'PUT' | 'PATCH',
  payload: UpdateUserPayload,
): Promise<User> => {
  const data = await apiFetch<JsonValue>(USER_ENDPOINT, {
    method,
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao atualizar usuário',
    networkErrorMessage: 'Falha de rede ao atualizar usuário',
  })

  return parseUser(data)
}

export const updateAuthenticatedUser = async (
  payload: UpdateUserPayload,
): Promise<User> => {
  const data = await apiFetch<JsonValue>(AUTH_ME_ENDPOINT, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao atualizar perfil',
    networkErrorMessage: 'Falha de rede ao atualizar perfil',
  })

  return parseUser(data)
}
