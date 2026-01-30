import { ApiError, apiFetch } from '../../api'
import type { UpdateUserPayload, User } from './users.types'

const USER_ENDPOINT = '/v1/user'
const AUTH_ME_ENDPOINT = '/v1/auth/me'

type JsonValue = Record<string, unknown> | null

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

const parseUser = (data: JsonValue): User => {
  if (!isRecord(data)) throw new ApiError('Resposta inválida do servidor: user')

  return {
    id: asNumber(data.id, 'user.id'),
    name: asString(data.name, 'user.name'),
    email: asString(data.email, 'user.email'),
    email_verified_at: asNullableString(
      data.email_verified_at,
      'user.email_verified_at',
    ),
    created_at: asString(data.created_at, 'user.created_at'),
    updated_at: asString(data.updated_at, 'user.updated_at'),
    // tenant_id no backend pode vir number/string (e às vezes null). Mantemos null se vier.
    tenant_id: asNullableStringLike(data.tenant_id, 'user.tenant_id'),
  }
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
