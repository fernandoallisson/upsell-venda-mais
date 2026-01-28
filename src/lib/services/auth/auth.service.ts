import { apiFetch } from '../../api'
import type { LoginPayload, LoginResponse } from './auth.types'

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const payload: LoginPayload = { email, password }

  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    errorMessage: 'Erro ao autenticar',
    networkErrorMessage: 'Falha de rede ao tentar autenticar',
  })
}

export const logout = async (): Promise<void> => {
  await apiFetch<null>('/v1/logout', {
    method: 'POST',
    auth: true,
    errorMessage: 'Erro ao encerrar sessão',
    networkErrorMessage: 'Falha de rede ao encerrar sessão',
  })
}
