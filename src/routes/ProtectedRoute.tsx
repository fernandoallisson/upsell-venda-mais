import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../contexts/PermissionsContext'

type ProtectedRouteProps = {
  children: ReactNode
  requiredModule?: string
}

const ProtectedRoute = ({ children, requiredModule }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth()
  const { isLoading, hasModuleAccess } = usePermissions()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">
          Carregando permissões...
        </div>
      </div>
    )
  }

  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return <Navigate to="/sem-acesso" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
