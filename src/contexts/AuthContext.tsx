import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/services/auth/auth.service'
import { clearAuthToken, getAuthToken, setAuthToken } from '../lib/storage'
import { getUser } from '../lib/services/users/users.service'
import type { User } from '../lib/services/users/users.types'
import { AuthContext } from './AuthContextBase'

let cachedUserToken: string | null = null
let cachedUser: User | null = null
let pendingUserRequest: Promise<User> | null = null

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(getAuthToken())
  const [user, setUser] = useState<User | null>(() =>
    token && cachedUserToken === token ? cachedUser : null,
  )
  const [isUserLoading, setIsUserLoading] = useState(Boolean(token && !user))
  const [userError, setUserError] = useState<string | null>(null)

  const clearUserCache = useCallback(() => {
    cachedUserToken = null
    cachedUser = null
    pendingUserRequest = null
    setUser(null)
    setUserError(null)
    setIsUserLoading(false)
  }, [])

  const setAuthenticatedUser = useCallback(
    (nextUser: User | null) => {
      cachedUserToken = token
      cachedUser = nextUser
      setUser(nextUser)
      setUserError(null)
    },
    [token],
  )

  const refreshUser = useCallback(async (options?: { force?: boolean }) => {
    if (!token) {
      clearUserCache()
      return null
    }

    if (!options?.force && cachedUserToken === token && cachedUser) {
      setUser(cachedUser)
      setUserError(null)
      setIsUserLoading(false)
      return cachedUser
    }

    setIsUserLoading(true)
    setUserError(null)

    try {
      pendingUserRequest ??= getUser()
      const nextUser = await pendingUserRequest
      cachedUserToken = token
      cachedUser = nextUser
      setUser(nextUser)
      return nextUser
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível carregar usuário.'
      cachedUserToken = null
      cachedUser = null
      setUser(null)
      setUserError(message)
      return null
    } finally {
      pendingUserRequest = null
      setIsUserLoading(false)
    }
  }, [clearUserCache, token])

  useEffect(() => {
    if (!token) {
      clearUserCache()
      return
    }

    void refreshUser()
  }, [clearUserCache, refreshUser, token])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await login(email, password)
      setAuthToken(response.token)
      setToken(response.token)
      cachedUserToken = null
      cachedUser = null
      pendingUserRequest = null
      setUser(null)
      setUserError(null)
      setIsUserLoading(true)
      navigate('/dashboard', { replace: true })
    },
    [navigate],
  )

  const signOut = useCallback(() => {
    clearAuthToken()
    setToken(null)
    clearUserCache()
    navigate('/login', { replace: true })
  }, [clearUserCache, navigate])

  const value = useMemo(
    () => ({
      token,
      user,
      isUserLoading,
      userError,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
      refreshUser,
      setAuthenticatedUser,
    }),
    [
      token,
      user,
      isUserLoading,
      userError,
      signIn,
      signOut,
      refreshUser,
      setAuthenticatedUser,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
