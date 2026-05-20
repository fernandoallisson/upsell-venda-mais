import { useContext } from 'react'
import { PermissionsContext } from './PermissionsContextBase'

export const usePermissions = () => {
  const context = useContext(PermissionsContext)

  if (!context) {
    throw new Error('usePermissions deve ser usado dentro de PermissionsProvider')
  }

  return context
}
