import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/api'
import { clearAuthToken, getAuthToken, setAuthToken } from '../lib/storage'

type AuthContextValue = {
  token: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(getAuthToken())

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await login(email, password)
      setAuthToken(response.token)
      setToken(response.token)
      navigate('/dashboard', { replace: true })
    },
    [navigate],
  )

  const signOut = useCallback(() => {
    clearAuthToken()
    setToken(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
    }),
    [token, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return context
}
