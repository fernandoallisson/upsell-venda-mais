import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../contexts/PermissionsContext'

const MODULE_DEFAULT_ROUTES: Array<{ category: string; path: string }> = [
  { category: 'analytics', path: '/dashboard' },
  { category: 'categories', path: '/catalogo/categorias' },
  { category: 'products', path: '/catalogo/produtos' },
  { category: 'customers', path: '/clientes' },
  { category: 'orders', path: '/pedidos' },
  { category: 'segments', path: '/segmentacao' },
  { category: 'upsell', path: '/upsell/campanhas' },
  { category: 'offers', path: '/upsell/ofertas' },
  { category: 'users', path: '/usuarios' },
  { category: 'settings', path: '/widget' },
]

type ProtectedRouteProps = {
  children: ReactNode
  requiredModule?: string
}

const ProtectedRoute = ({ children, requiredModule }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth()
  const { isLoading, error, hasModuleAccess, permissions, categories, slugs } =
    usePermissions()

  console.log('[ProtectedRoute]', {
    isAuthenticated,
    isLoading,
    error,
    requiredModule,
    permissions,
    categories,
    slugs,
    hasAccess: requiredModule ? hasModuleAccess(requiredModule) : true,
  })

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Carregando permissões...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-white px-6 py-4 text-sm text-red-600 shadow-sm">
          Erro ao carregar permissões: {error}
        </div>
      </div>
    )
  }

  if (requiredModule && !hasModuleAccess(requiredModule)) {
    const firstAvailable = MODULE_DEFAULT_ROUTES.find((module) =>
      hasModuleAccess(module.category),
    )

    console.warn('[ProtectedRoute] sem acesso ao módulo', {
      requiredModule,
      firstAvailable,
      categories,
      slugs,
      permissions,
    })

    return <Navigate to={firstAvailable?.path ?? '/sem-acesso'} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute