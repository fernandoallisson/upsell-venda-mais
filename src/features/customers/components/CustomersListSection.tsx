import { ChevronLeft, ChevronRight, User } from 'lucide-react'
import type { Customer } from '../../../lib/services/customers/customers.types'
import type { PaginationMeta } from '../types/customers.types'
import { formatCurrency } from '../utils/formatters'

type CustomersListSectionProps = {
  customerSearch: string
  onSearchChange: (value: string) => void
  filteredCustomers: Customer[]
  customersCount: number
  selectedCustomerId?: number
  onSelectCustomer: (customer: Customer) => void
  pagination: PaginationMeta | null
  pageItems: Array<number | '...'>
  onGoToPage: (page: number) => void
}

const CustomersListSection = ({
  customerSearch,
  onSearchChange,
  filteredCustomers,
  customersCount,
  selectedCustomerId,
  onSelectCustomer,
  pagination,
  pageItems,
  onGoToPage,
}: CustomersListSectionProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 px-2 pb-3 text-sm font-semibold text-slate-700">
        <User className="h-4 w-4 text-indigo-500" />
        Lista de clientes
      </div>

      <div className="px-2 pb-4">
        <label className="space-y-2 text-sm text-slate-600">
          <span>Buscar por nome</span>
          <input
            value={customerSearch}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
            placeholder="Digite o nome do cliente"
          />
        </label>
        <p className="mt-2 text-xs text-slate-500">
          Exibindo {filteredCustomers.length} de {customersCount} clientes na página atual.
        </p>
      </div>

      <div className="space-y-3">
        {filteredCustomers.map((customer) => {
          const isActive = selectedCustomerId === customer.id
          return (
            <button
              key={customer.id}
              type="button"
              onClick={() => onSelectCustomer(customer)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                isActive
                  ? 'border-indigo-200 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-xs text-slate-500">{customer.email}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {customer.total_orders_count} pedidos
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>{customer.phone}</span>
                <span className="font-semibold text-slate-700">
                  Ticket médio: {formatCurrency(customer.average_ticket, 'BRL')}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
          Nenhum cliente encontrado com esse nome.
        </div>
      ) : null}

      {pagination && filteredCustomers.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
          <div className="text-xs text-slate-500">
            Mostrando <span className="font-semibold text-slate-700">{pagination.from ?? 0}</span>
            {' – '}
            <span className="font-semibold text-slate-700">{pagination.to ?? 0}</span> de{' '}
            <span className="font-semibold text-slate-700">{pagination.total}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!pagination.prev_page_url}
              onClick={() => onGoToPage(pagination.current_page - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            <div className="mx-1 flex items-center gap-1">
              {pageItems.map((item, idx) =>
                item === '...' ? (
                  <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onGoToPage(item)}
                    className={`min-w-9 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      item === pagination.current_page
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              disabled={!pagination.next_page_url}
              onClick={() => onGoToPage(pagination.current_page + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default CustomersListSection
