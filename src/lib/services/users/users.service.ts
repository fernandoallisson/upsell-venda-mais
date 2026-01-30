import { ApiError, apiFetch } from '../../api'
import type { UpdateUserPayload, User } from './users.types'

const USER_ENDPOINT = '/v1/user'
const AUTH_ME_ENDPOINT = '/v1/auth/me'

type JsonValue = Record<string, unknown> | null

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseUser = (data: JsonValue): User => {
  if (!isRecord(data)) {
    throw new ApiError('Resposta inválida do servidor')
  }

  const emailVerifiedAt =
    data.email_verified_at === null || typeof data.email_verified_at === 'string'
      ? data.email_verified_at
      : null

  
  const tenantId = data.tenant_id === null || data.tenant_id === undefined
    ? null
    : typeof data.tenant_id === 'string' || typeof data.tenant_id === 'number'
      ? String(data.tenant_id)
      : null


  if (
    typeof data.id !== 'number' ||
    typeof data.name !== 'string' ||
    typeof data.email !== 'string' ||
    typeof data.created_at !== 'string' ||
    typeof data.updated_at !== 'string' ||
    tenant_id: tenantId,
  ) {
    throw new ApiError('Resposta inválida do servidor')
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    email_verified_at: emailVerifiedAt,
    created_at: data.created_at,
    updated_at: data.updated_at,
    tenant_id: String(data.tenant_id),
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
