import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from './AuthContext'
import type { Permission } from '../lib/services/permissions/permissions.types'
import { getUserPermissions } from '../lib/services/permissions/permissions.service'
import { getUser } from '../lib/services/users/users.service'

type PermissionsContextValue = {
  permissions: Permission[]
  categories: string[]
  slugs: string[]
  isLoading: boolean
  error: string | null
  hasPermission: (slug: string) => boolean
  hasModuleAccess: (category: string) => boolean
  hasAnyModuleAccess: boolean
  refreshPermissions: () => Promise<void>
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(
  undefined,
)

export const PermissionsProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPermissions = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissions([])
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const user = await getUser()
      const response = await getUserPermissions(user.id)
      setPermissions(response.permissions)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar permissões do usuário.'
      setPermissions([])
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void loadPermissions()
  }, [loadPermissions])

  const categoriesSet = useMemo(
    () => new Set(permissions.map((permission) => permission.category)),
    [permissions],
  )

  const slugsSet = useMemo(
    () => new Set(permissions.map((permission) => permission.slug)),
    [permissions],
  )

  const hasPermission = useCallback(
    (slug: string) => slugsSet.has(slug),
    [slugsSet],
  )

  const hasModuleAccess = useCallback(
    (category: string) => {
      if (categoriesSet.has(category)) {
        return true
      }

      for (const slug of slugsSet) {
        if (slug.startsWith(`${category}.`)) {
          return true
        }
      }

      return false
    },
    [categoriesSet, slugsSet],
  )

  const value = useMemo(
    () => ({
      permissions,
      categories: Array.from(categoriesSet),
      slugs: Array.from(slugsSet),
      isLoading,
      error,
      hasPermission,
      hasModuleAccess,
      hasAnyModuleAccess: categoriesSet.size > 0,
      refreshPermissions: loadPermissions,
    }),
    [
      permissions,
      categoriesSet,
      slugsSet,
      isLoading,
      error,
      hasPermission,
      hasModuleAccess,
      loadPermissions,
    ],
  )

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

export const usePermissions = () => {
  const context = useContext(PermissionsContext)

  if (!context) {
    throw new Error('usePermissions deve ser usado dentro de PermissionsProvider')
  }

  return context
}
