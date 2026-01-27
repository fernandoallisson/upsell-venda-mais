const TOKEN_KEY = 'auth_token'
const TOKEN_CREATED_AT_KEY = 'auth_token_created_at'

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

export const getAuthTokenCreatedAt = () => {
  return localStorage.getItem(TOKEN_CREATED_AT_KEY)
}

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_CREATED_AT_KEY, new Date().toISOString())
}

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_CREATED_AT_KEY)
}
