import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import type { Order } from '../../../lib/services/orders/orders.types'
import type { AsyncStatus } from '../types/customers.types'
import { formatCurrency, formatDate } from '../utils/formatters'

type OrdersModalProps = {
  isOpen: boolean
  customerName?: string
  customerOrders: Order[]
  customerOrdersStatus: AsyncStatus
  customerOrdersError: string | null
  visibleCustomerOrders: Order[]
  customerOrdersPage: number
  setCustomerOrdersPage: Dispatch<SetStateAction<number>>
  customerOrdersPerPage: number
  customerOrdersLastPage: number
  customerOrdersPageItems: Array<number | '...'>
  onClose: () => void
}

const OrdersModal = ({
  isOpen,
  customerName,
  customerOrders,
  customerOrdersStatus,
  customerOrdersError,
  visibleCustomerOrders,
  customerOrdersPage,
  setCustomerOrdersPage,
  customerOrdersPerPage,
  customerOrdersLastPage,
  customerOrdersPageItems,
  onClose,
}: OrdersModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Pedidos de {customerName ?? 'cliente'}
            </p>
            <p className="text-xs text-slate-500">{customerOrders.length} pedidos encontrados</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Fechar
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {customerOrdersStatus === 'loading' ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`loading-${index}`}
                  className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : null}

          {customerOrdersStatus === 'error' ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold">Não foi possível carregar os pedidos.</p>
              <p className="text-xs text-rose-600">{customerOrdersError}</p>
            </div>
          ) : null}

          {customerOrdersStatus === 'idle' && customerOrders.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Nenhum pedido encontrado para este cliente.
            </div>
          ) : null}

          {customerOrdersStatus === 'idle' && customerOrders.length > 0 ? (
            <div className="space-y-3">
              {visibleCustomerOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <ClipboardList className="h-4 w-4 text-indigo-500" />
                      Pedido #{order.id}
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDate(order.placed_at)} · {order.items.length} itens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(order.total_amount, 'BRL')}
                    </p>
                    <p className="text-xs text-slate-500">Status: {order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {customerOrdersStatus === 'idle' && customerOrders.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Mostrando{' '}
              <span className="font-semibold text-slate-700">
                {(customerOrdersPage - 1) * customerOrdersPerPage + 1}
              </span>{' '}
              –{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(customerOrdersPage * customerOrdersPerPage, customerOrders.length)}
              </span>{' '}
              de <span className="font-semibold text-slate-700">{customerOrders.length}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={customerOrdersPage === 1}
                onClick={() => setCustomerOrdersPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>

              <div className="mx-1 flex items-center gap-1">
                {customerOrdersPageItems.map((item, idx) =>
                  item === '...' ? (
                    <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCustomerOrdersPage(item)}
                      className={`min-w-9 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        item === customerOrdersPage
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
                disabled={customerOrdersPage === customerOrdersLastPage}
                onClick={() =>
                  setCustomerOrdersPage((prev) => Math.min(customerOrdersLastPage, prev + 1))
                }
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default OrdersModal
