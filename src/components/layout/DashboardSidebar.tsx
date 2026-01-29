import { NavLink } from 'react-router-dom'
import {
  Boxes,
  Package,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Users,
  UsersRound,
} from 'lucide-react'

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

const DashboardSidebar = () => {
  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6">
      <div className="px-3">
        <p className="text-xs font-semibold uppercase text-slate-400">Venda Mais</p>
        <p className="text-lg font-semibold text-slate-900">Upsell Console</p>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 text-xs font-semibold uppercase text-slate-400">
            <Boxes className="h-4 w-4" />
            Catálogo
          </div>
          <NavLink to="/catalogo/categorias" className={childLinkStyles}>
            <Tag className="h-4 w-4" />
            Categorias
          </NavLink>
          <NavLink to="/catalogo/produtos" className={childLinkStyles}>
            <Package className="h-4 w-4" />
            Produtos
          </NavLink>
        </div>

        <div className="flex flex-col gap-2">
          <NavLink to="/clientes" className={linkStyles}>
            <Users className="h-4 w-4" />
            Clientes
          </NavLink>
          <NavLink to="/pedidos" className={linkStyles}>
            <ShoppingBag className="h-4 w-4" />
            Pedidos
          </NavLink>
          <NavLink to="/segmentacao" className={linkStyles}>
            <SlidersHorizontal className="h-4 w-4" />
            Segmentação
          </NavLink>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 text-xs font-semibold uppercase text-slate-400">
            <Sparkles className="h-4 w-4" />
            Upsell
          </div>
          <NavLink to="/upsell/campanhas" className={childLinkStyles}>
            <Sparkles className="h-4 w-4" />
            Campanhas
          </NavLink>
          <NavLink to="/upsell/ofertas" className={childLinkStyles}>
            <Tag className="h-4 w-4" />
            Ofertas
          </NavLink>
        </div>

        <div className="flex flex-col gap-2">
          <NavLink to="/usuarios" className={linkStyles}>
            <UsersRound className="h-4 w-4" />
            Usuários
          </NavLink>
        </div>
      </nav>
    </aside>
  )
}

export default DashboardSidebar
