import { createContext } from 'react'
import type { Permission } from '../lib/services/permissions/permissions.types'

export type PermissionsContextValue = {
  permissions: Permission[]
  categories: string[]
  slugs: string[]
  isLoading: boolean
  hasLoaded: boolean
  error: string | null
  hasPermission: (slug: string) => boolean
  hasModuleAccess: (category: string) => boolean
  hasAnyModuleAccess: boolean
  refreshPermissions: (options?: { force?: boolean }) => Promise<void>
}

export const PermissionsContext = createContext<
  PermissionsContextValue | undefined
>(undefined)
