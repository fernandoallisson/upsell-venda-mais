import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from './useAuth'
import type { Permission } from '../lib/services/permissions/permissions.types'
import { getUserPermissions } from '../lib/services/permissions/permissions.service'
import { PermissionsContext } from './PermissionsContextBase'

const PERMISSIONS_CACHE_PREFIX = 'upsell_venda_mais_permissions'

const hashCacheKeyPart = (value: string) => {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash.toString(36)
}

const getPermissionsCacheKey = (userId: number, token: string) =>
  `${PERMISSIONS_CACHE_PREFIX}:${userId}:${hashCacheKeyPart(token)}`

const isPermission = (value: unknown): value is Permission => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const permission = value as Record<string, unknown>

  return (
    typeof permission.id === 'number' &&
    typeof permission.slug === 'string' &&
    typeof permission.name === 'string' &&
    typeof permission.category === 'string' &&
    (
      permission.description === undefined ||
      typeof permission.description === 'string'
    )
  )
}

const readCachedPermissions = (
  userId: number,
  token: string,
): Permission[] | null => {
  try {
    const raw = sessionStorage.getItem(getPermissionsCacheKey(userId, token))
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || !parsed.every(isPermission)) return null

    return parsed
  } catch {
    return null
  }
}

const writeCachedPermissions = (
  userId: number,
  token: string,
  nextPermissions: Permission[],
) => {
  try {
    sessionStorage.setItem(
      getPermissionsCacheKey(userId, token),
      JSON.stringify(nextPermissions),
    )
  } catch {
    // Cache is an optimization; permission state still works without it.
  }
}

export const PermissionsProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, token, user, isUserLoading, userError } = useAuth()

  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPermissions = useCallback(async (options?: { force?: boolean }) => {
    if (!isAuthenticated) {
      setPermissions([])
      setError(null)
      setIsLoading(false)
      setHasLoaded(true)
      return
    }

    if (isUserLoading) {
      setIsLoading(true)
      setHasLoaded(false)
      return
    }

    if (userError) {
      setPermissions([])
      setError(userError)
      setIsLoading(false)
      setHasLoaded(true)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (!user?.id) {
        throw new Error('Usuário autenticado sem ID válido.')
      }

      if (!options?.force) {
        const cachedPermissions = token
          ? readCachedPermissions(user.id, token)
          : null

        if (cachedPermissions) {
          setPermissions(cachedPermissions)
          return
        }
      }

      const response = await getUserPermissions(user.id)

      const normalizedPermissions = Array.isArray(response?.permissions)
        ? response.permissions
        : []

      setPermissions(normalizedPermissions)
      if (token) {
        writeCachedPermissions(user.id, token, normalizedPermissions)
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar permissões do usuário.'

      setPermissions([])
      setError(message)
    } finally {
      setIsLoading(false)
      setHasLoaded(true)
    }
  }, [isAuthenticated, isUserLoading, token, user, userError])

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

  const hasPermission = useCallback(
    (slug: string) => slugsSet.has(slug),
    [slugsSet],
  )

  const hasModuleAccess = useCallback(
    (category: string) => {
      if (!category) return false

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
      categories,
      slugs,
      isLoading,
      hasLoaded,
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
      hasLoaded,
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
