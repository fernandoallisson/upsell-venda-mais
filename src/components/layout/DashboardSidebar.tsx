import { NavLink } from 'react-router-dom'
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  LayoutDashboard,
  Package,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Webhook,
  Users,
  UsersRound,
} from 'lucide-react'
import { usePermissions } from '../../contexts/usePermissions'

type DashboardSidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

const linkBase =
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition'

const linkStyles = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

const childLinkStyles = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} pl-10 text-sm ${
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
  }`

const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const labelClassName = collapsed ? 'sr-only' : 'whitespace-nowrap'
  const { hasModuleAccess, isLoading } = usePermissions()

  if (isLoading) {
    return (
      <aside
        className={`sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white px-3 py-6 transition-all duration-200 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-8 w-full animate-pulse rounded bg-slate-100" />
      </aside>
    )
  }

  const canAccessCatalog =
    hasModuleAccess('categories') || hasModuleAccess('products')
  const canAccessUpsell = hasModuleAccess('upsell') || hasModuleAccess('offers')
  const canAccessSettings =
    hasModuleAccess('users') || hasModuleAccess('settings')

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white px-3 py-6 transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-start justify-between gap-2 px-2">
        <div className={collapsed ? 'hidden' : 'block'}>
          <p className="text-xs font-semibold uppercase text-slate-400">Incrível Boost</p>
          <p className="text-lg font-semibold text-slate-900">Console de Upsell</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-4">
        {hasModuleAccess('analytics') ? (
          <NavLink to="/dashboard" className={linkStyles}>
            <LayoutDashboard className="h-4 w-4" />
            <span className={labelClassName}>Dashboard</span>
          </NavLink>
        ) : null}

        {canAccessCatalog ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 text-xs font-semibold uppercase text-slate-400">
              <Boxes className="h-4 w-4" />
              <span className={labelClassName}>Catálogo</span>
            </div>
            {hasModuleAccess('categories') ? (
              <NavLink to="/catalogo/categorias" className={childLinkStyles}>
                <Tag className="h-4 w-4" />
                <span className={labelClassName}>Categorias</span>
              </NavLink>
            ) : null}
            {hasModuleAccess('products') ? (
              <NavLink to="/catalogo/produtos" className={childLinkStyles}>
                <Package className="h-4 w-4" />
                <span className={labelClassName}>Produtos</span>
              </NavLink>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {hasModuleAccess('customers') ? (
            <NavLink to="/clientes" className={linkStyles}>
              <Users className="h-4 w-4" />
              <span className={labelClassName}>Clientes</span>
            </NavLink>
          ) : null}
          {hasModuleAccess('orders') ? (
            <NavLink to="/pedidos" className={linkStyles}>
              <ShoppingBag className="h-4 w-4" />
              <span className={labelClassName}>Pedidos</span>
            </NavLink>
          ) : null}
          {hasModuleAccess('segments') ? (
            <NavLink to="/segmentacao" className={linkStyles}>
              <SlidersHorizontal className="h-4 w-4" />
              <span className={labelClassName}>Segmentação</span>
            </NavLink>
          ) : null}
        </div>

        {canAccessUpsell ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 text-xs font-semibold uppercase text-slate-400">
              <Sparkles className="h-4 w-4" />
              <span className={labelClassName}>Upsell</span>
            </div>
            {hasModuleAccess('upsell') ? (
              <NavLink to="/upsell/campanhas" className={childLinkStyles}>
                <Sparkles className="h-4 w-4" />
                <span className={labelClassName}>Campanhas</span>
              </NavLink>
            ) : null}
            {hasModuleAccess('offers') ? (
              <NavLink to="/upsell/ofertas" className={childLinkStyles}>
                <Tag className="h-4 w-4" />
                <span className={labelClassName}>Ofertas</span>
              </NavLink>
            ) : null}
          </div>
        ) : null}

        {canAccessSettings ? (
          <div className="flex flex-col gap-2">
            {hasModuleAccess('users') ? (
              <NavLink to="/usuarios" className={linkStyles}>
                <UsersRound className="h-4 w-4" />
                <span className={labelClassName}>Usuários</span>
              </NavLink>
            ) : null}
            {hasModuleAccess('settings') ? (
              <>
                <NavLink to="/widget" className={linkStyles}>
                  <Webhook className="h-4 w-4" />
                  <span className={labelClassName}>Widget</span>
                </NavLink>
                <NavLink to="/tokens" className={linkStyles}>
                  <KeyRound className="h-4 w-4" />
                  <span className={labelClassName}>Chaves de API</span>
                </NavLink>
              </>
            ) : null}
          </div>
        ) : null}
      </nav>
    </aside>
  )
}

export default DashboardSidebar
