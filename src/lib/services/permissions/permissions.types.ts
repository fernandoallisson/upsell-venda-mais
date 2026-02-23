export type Permission = {
  id: number
  slug: string
  name: string
  category: string
  description?: string
}

export type PermissionsResponse = {
  permissions: Record<string, Permission[]>
  categories: string[]
}

export type UserPermissionsResponse = {
  user: {
    id: number
    name: string
    email: string
  }
  permissions: Permission[]
}

export type SyncPermissionsPayload = {
  permissions: string[]
}
