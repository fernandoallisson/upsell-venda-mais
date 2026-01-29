import { NavLink } from 'react-router-dom'
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Package,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Users,
  UsersRound,
} from 'lucide-react'

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

  return (
    <aside
      className={`flex h-screen flex-col border-r border-slate-200 bg-white px-3 py-6 transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-start justify-between gap-2 px-2">
        <div className={collapsed ? 'hidden' : 'block'}>
          <p className="text-xs font-semibold uppercase text-slate-400">Venda Mais</p>
          <p className="text-lg font-semibold text-slate-900">Upsell Console</p>
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
        <NavLink to="/dashboard" className={linkStyles}>
          <LayoutDashboard className="h-4 w-4" />
          <span className={labelClassName}>Dashboard</span>
        </NavLink>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 text-xs font-semibold uppercase text-slate-400">
            <Boxes className="h-4 w-4" />
            <span className={labelClassName}>Catálogo</span>
          </div>
          <NavLink to="/catalogo/categorias" className={childLinkStyles}>
            <Tag className="h-4 w-4" />
            <span className={labelClassName}>Categorias</span>
          </NavLink>
          <NavLink to="/catalogo/produtos" className={childLinkStyles}>
            <Package className="h-4 w-4" />
            <span className={labelClassName}>Produtos</span>
          </NavLink>
        </div>

        <div className="flex flex-col gap-2">
          <NavLink to="/clientes" className={linkStyles}>
            <Users className="h-4 w-4" />
            <span className={labelClassName}>Clientes</span>
          </NavLink>
          <NavLink to="/pedidos" className={linkStyles}>
            <ShoppingBag className="h-4 w-4" />
            <span className={labelClassName}>Pedidos</span>
          </NavLink>
          <NavLink to="/segmentacao" className={linkStyles}>
            <SlidersHorizontal className="h-4 w-4" />
            <span className={labelClassName}>Segmentação</span>
          </NavLink>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 text-xs font-semibold uppercase text-slate-400">
            <Sparkles className="h-4 w-4" />
            <span className={labelClassName}>Upsell</span>
          </div>
          <NavLink to="/upsell/campanhas" className={childLinkStyles}>
            <Sparkles className="h-4 w-4" />
            <span className={labelClassName}>Campanhas</span>
          </NavLink>
          <NavLink to="/upsell/ofertas" className={childLinkStyles}>
            <Tag className="h-4 w-4" />
            <span className={labelClassName}>Ofertas</span>
          </NavLink>
        </div>

        <div className="flex flex-col gap-2">
          <NavLink to="/usuarios" className={linkStyles}>
            <UsersRound className="h-4 w-4" />
            <span className={labelClassName}>Usuários</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  )
}

export default DashboardSidebar
