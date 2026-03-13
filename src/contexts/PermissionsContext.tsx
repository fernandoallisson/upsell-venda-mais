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
      console.log('[PermissionsContext] USER ID', user?.id)
      console.log('[PermissionsContext] USER', user)

      if (!user?.id) {
        throw new Error('Usuário autenticado sem ID válido.')
      }

      const response = await getUserPermissions(user.id)

      const normalizedPermissions = Array.isArray(response?.permissions)
        ? response.permissions
        : []

      console.log('[PermissionsContext] PERMISSIONS RESPONSE', response)
      console.log(
        '[PermissionsContext] PERMISSIONS JSON',
        JSON.stringify(normalizedPermissions, null, 2),
      )
      console.table(
        normalizedPermissions.map((permission: any) => ({
          id: permission?.id,
          category: permission?.category,
          slug: permission?.slug,
          name: permission?.name,
        })),
      )

      setPermissions(normalizedPermissions)
    } catch (err) {
      console.error('[PermissionsContext] LOAD PERMISSIONS ERROR', err)

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

  const categoriesSet = useMemo(() => {
    return new Set(
      permissions
        .map((permission) => permission?.category)
        .filter((value): value is string => Boolean(value)),
    )
  }, [permissions])

  const slugsSet = useMemo(() => {
    return new Set(
      permissions
        .map((permission) => permission?.slug)
        .filter((value): value is string => Boolean(value)),
    )
  }, [permissions])

  const categories = useMemo(() => Array.from(categoriesSet), [categoriesSet])
  const slugs = useMemo(() => Array.from(slugsSet), [slugsSet])

  useEffect(() => {
    console.log('[PermissionsContext] categories', categories)
    console.log('[PermissionsContext] slugs', slugs)
  }, [categories, slugs])

  const hasPermission = useCallback(
    (slug: string) => slugsSet.has(slug),
    [slugsSet],
  )

  const hasModuleAccess = useCallback(
    (category: string) => {
      if (!category) return false

      const normalizedCategory = category.trim().toLowerCase()

      const categoriesArray = Array.from(categoriesSet).map((item) =>
        String(item).trim().toLowerCase(),
      )

      const slugsArray = Array.from(slugsSet).map((item) =>
        String(item).trim().toLowerCase(),
      )

      if (categoriesArray.includes(normalizedCategory)) {
        return true
      }

      for (const slug of slugsArray) {
        if (
          slug === normalizedCategory ||
          slug.startsWith(`${normalizedCategory}.`) ||
          slug.startsWith(`${normalizedCategory}:`) ||
          slug.startsWith(`${normalizedCategory}_`) ||
          slug.includes(`.${normalizedCategory}.`) ||
          slug.includes(`:${normalizedCategory}:`) ||
          slug.includes(`_${normalizedCategory}_`) ||
          slug.endsWith(`.${normalizedCategory}`) ||
          slug.endsWith(`:${normalizedCategory}`) ||
          slug.endsWith(`_${normalizedCategory}`)
        ) {
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
      categories,
      slugs,
      isLoading,
      error,
      hasPermission,
      hasModuleAccess,
      hasAnyModuleAccess: categories.length > 0 || slugs.length > 0,
      refreshPermissions: loadPermissions,
    }),
    [
      permissions,
      categories,
      slugs,
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