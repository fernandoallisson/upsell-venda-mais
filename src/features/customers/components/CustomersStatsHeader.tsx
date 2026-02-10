import { RefreshCcw } from 'lucide-react'
import type { PaginationMeta } from '../types/customers.types'

type CustomersStatsHeaderProps = {
  pagination: PaginationMeta | null
  totals: { count: number; orders: number }
  page: number
  onRefresh: () => void
}

const CustomersStatsHeader = ({
  pagination,
  totals,
  page,
  onRefresh,
}: CustomersStatsHeaderProps) => {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-500">Clientes</p>

        <div className="mt-1 flex flex-wrap items-baseline gap-3">
          <p className="text-2xl font-semibold text-slate-900">
            {pagination?.total ?? totals.count}
          </p>
          <span className="text-sm text-slate-400">{totals.orders} pedidos</span>
          <span className="text-sm text-slate-400">
            {pagination
              ? `(pág. ${pagination.current_page} de ${pagination.last_page})`
              : ''}
          </span>
        </div>

        {pagination ? (
          <p className="mt-1 text-xs text-slate-400">
            Mostrando {pagination.from ?? 0}–{pagination.to ?? 0} de {pagination.total}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
      >
        <RefreshCcw className="h-4 w-4" />
        Atualizar (página {page})
      </button>
    </section>
  )
}

export default CustomersStatsHeader
