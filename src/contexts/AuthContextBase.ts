import { createContext } from 'react'
import type { User } from '../lib/services/users/users.types'

export type AuthContextValue = {
  token: string | null
  user: User | null
  isUserLoading: boolean
  userError: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  refreshUser: (options?: { force?: boolean }) => Promise<User | null>
  setAuthenticatedUser: (user: User | null) => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
