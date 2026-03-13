import { Search } from 'lucide-react'
import type { WidgetListParams } from '../../../types/widget'

type WidgetFiltersProps = {
  search: string
  status: 'all' | 'active' | 'inactive'
  sort: NonNullable<WidgetListParams['sort']>
  order: NonNullable<WidgetListParams['order']>
  perPage: number
  onSearchChange: (value: string) => void
  onStatusChange: (value: 'all' | 'active' | 'inactive') => void
  onSortChange: (value: NonNullable<WidgetListParams['sort']>) => void
  onOrderChange: (value: NonNullable<WidgetListParams['order']>) => void
  onPerPageChange: (value: number) => void
}

const WidgetFilters = ({
  search,
  status,
  sort,
  order,
  perPage,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onOrderChange,
  onPerPageChange,
}: WidgetFiltersProps) => (
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
    <label className="relative md:col-span-2 xl:col-span-2">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por título ou slug"
        className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400"
      />
    </label>

    <select
      value={status}
      onChange={(event) => onStatusChange(event.target.value as 'all' | 'active' | 'inactive')}
      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
    >
      <option value="all">Todos os status</option>
      <option value="active">Ativos</option>
      <option value="inactive">Inativos</option>
    </select>

    <select
      value={sort}
      onChange={(event) => onSortChange(event.target.value as NonNullable<WidgetListParams['sort']>)}
      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
    >
      <option value="created_at">Ordenar por data</option>
      <option value="title">Ordenar por título</option>
      <option value="slug">Ordenar por slug</option>
    </select>

    <div className="flex gap-2">
      <select
        value={order}
        onChange={(event) => onOrderChange(event.target.value as NonNullable<WidgetListParams['order']>)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
      >
        <option value="desc">Decrescente</option>
        <option value="asc">Crescente</option>
      </select>
      <select
        value={perPage}
        onChange={(event) => onPerPageChange(Number(event.target.value))}
        className="rounded-xl border border-slate-200 px-2 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  </div>
)

export default WidgetFilters
