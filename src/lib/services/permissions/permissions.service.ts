import { apiFetch } from '../../api'
import type {
  PermissionsResponse,
  SyncPermissionsPayload,
  UserPermissionsResponse,
} from './permissions.types'

const PERMISSIONS_ENDPOINT = '/v1/permissions'
const USERS_ENDPOINT = '/v1/users'

export const getAllPermissions = async (): Promise<PermissionsResponse> => {
  return apiFetch<PermissionsResponse>(PERMISSIONS_ENDPOINT, {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar permissões',
    networkErrorMessage: 'Falha de rede ao carregar permissões',
  })
}

export const getUserPermissions = async (
  userId: number,
): Promise<UserPermissionsResponse> => {
  return apiFetch<UserPermissionsResponse>(
    `${USERS_ENDPOINT}/${userId}/permissions`,
    {
      method: 'GET',
      auth: true,
      errorMessage: 'Erro ao carregar permissões do usuário',
      networkErrorMessage: 'Falha de rede ao carregar permissões do usuário',
    },
  )
}

export const syncUserPermissionsBySlugs = async (
  userId: number,
  payload: SyncPermissionsPayload,
): Promise<UserPermissionsResponse> => {
  return apiFetch<UserPermissionsResponse>(
    `${USERS_ENDPOINT}/${userId}/permissions/sync-by-slugs`,
    {
      method: 'PUT',
      auth: true,
      body: JSON.stringify(payload),
      errorMessage: 'Erro ao sincronizar permissões do usuário',
      networkErrorMessage: 'Falha de rede ao sincronizar permissões do usuário',
    },
  )
}
