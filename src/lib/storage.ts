const TOKEN_KEY = 'tenant_api_key'
const TOKEN_CREATED_AT_KEY = 'tenant_api_key_created_at'

const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

const getCookie = (name: string) => {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
  if (!match) return null

  const value = match.slice(name.length + 1)
  return decodeURIComponent(value)
}

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
}

export const setAuthToken = (token: string) => {
  setCookie(TOKEN_KEY, token, 7)
  setCookie(TOKEN_CREATED_AT_KEY, String(Date.now()), 7)
}

export const getAuthToken = () => getCookie(TOKEN_KEY)

export const clearAuthToken = () => {
  deleteCookie(TOKEN_KEY)
  deleteCookie(TOKEN_CREATED_AT_KEY)
}

export const getAuthTokenCreatedAt = () => {
  const raw = getCookie(TOKEN_CREATED_AT_KEY)
  return raw ? Number(raw) : null
}
