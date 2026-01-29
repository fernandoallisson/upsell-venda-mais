import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  ClipboardList,
  DollarSign,
  Mail,
  Phone,
  RefreshCcw,
  Tag,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ApiError } from '../lib/api'
import { getOrderById, getOrders } from '../lib/services/orders/orders.service'
import type {
  Order,
  OrdersResponse,
} from '../lib/services/orders/orders.types'
import DashboardPage from '../components/layout/DashboardPage'

const formatCurrency = (value: string, currency: string) => {
  const number = Number(value)
  if (Number.isNaN(number)) return value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(number)
}

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}

type PaginationMeta = Pick<
  OrdersResponse,
  | 'current_page'
  | 'last_page'
  | 'per_page'
  | 'total'
  | 'from'
  | 'to'
  | 'next_page_url'
  | 'prev_page_url'
>

const buildPageItems = (current: number, last: number) => {
  // exemplo: 1 ... 4 5 6 ... 11
  const delta = 2
  const pages: Array<number | '...'> = []

  const left = Math.max(1, current - delta)
  const right = Math.min(last, current + delta)

  // sempre mostra primeira
  pages.push(1)

  if (left > 2) pages.push('...')

  for (let p = left; p <= right; p += 1) {
    if (p !== 1 && p !== last) pages.push(p)
  }

  if (right < last - 1) pages.push('...')

  // sempre mostra última (se for diferente)
  if (last !== 1) pages.push(last)

  // remove duplicadas (casos de last pequeno)
  const normalized: Array<number | '...'> = []
  for (const item of pages) {
    if (normalized.length === 0 || normalized[normalized.length - 1] !== item) {
      normalized.push(item)
    }
  }
  return normalized
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [detailStatus, setDetailStatus] = useState<'idle' | 'loading' | 'error'>(
    'idle',
  )
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)

  const fetchOrderDetails = useCallback(async (id: number) => {
    setDetailStatus('loading')
    try {
      const response = await getOrderById(id)
      setSelectedOrder(response)
      setDetailStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar detalhes do pedido.'
      setError(message)
      setDetailStatus('error')
    }
  }, [])

  const fetchOrders = useCallback(
    async (targetPage = page) => {
      setStatus('loading')
      setError(null)

      try {
        const response = await getOrders(targetPage)

        setOrders(response.data)
        setPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to,
          next_page_url: response.next_page_url,
          prev_page_url: response.prev_page_url,
        })
        setPage(response.current_page)

        const firstOrder = response.data[0] ?? null
        setSelectedOrder(firstOrder)

        if (firstOrder) {
          fetchOrderDetails(firstOrder.id)
        }

        setStatus('idle')
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao carregar pedidos.'
        setError(message)
        setStatus('error')
      }
    },
    [fetchOrderDetails, page],
  )

  useEffect(() => {
    fetchOrders(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totals = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.count += 1
        acc.revenue += Number(order.total_amount) || 0
        return acc
      },
      { count: 0, revenue: 0 },
    )
  }, [orders])

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order)
    fetchOrderDetails(order.id)
  }

  const handleGoToPage = (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.last_page) return
    fetchOrders(nextPage)
  }

  const pageItems = useMemo(() => {
    if (!pagination) return []
    return buildPageItems(pagination.current_page, pagination.last_page)
  }, [pagination])

  return (
    <DashboardPage
      title="Pedidos"
      subtitle="Operações"
      containerClassName="max-w-6xl"
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Pedidos</p>

          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-semibold text-slate-900">
              {pagination?.total ?? totals.count}
            </p>
            <span className="text-sm text-slate-400">
              total {pagination ? `(pág. ${pagination.current_page} de ${pagination.last_page})` : ''}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Receita (página atual):{' '}
            <span className="font-semibold text-slate-700">
              {formatCurrency(totals.revenue.toFixed(2), 'BRL')}
            </span>
          </p>

          {pagination ? (
            <p className="mt-1 text-xs text-slate-400">
              Mostrando {pagination.from ?? 0}–{pagination.to ?? 0} de {pagination.total}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => fetchOrders(page)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
        >
          <RefreshCcw className="h-4 w-4" />
          Atualizar (página {page})
        </button>
      </section>

      {status === 'loading' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold">Não foi possível carregar os pedidos.</p>
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchOrders(page)}
            className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'idle' && orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          <p className="font-semibold">Nenhum pedido encontrado.</p>
          <p className="text-sm text-slate-500">
            Assim que houver pedidos, eles serão listados aqui.
          </p>
        </div>
      ) : null}

      {status === 'idle' && orders.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 px-2 pb-3 text-sm font-semibold text-slate-700">
              <ClipboardList className="h-4 w-4 text-indigo-500" />
              Lista de pedidos
            </div>

            <div className="space-y-3">
              {orders.map((order) => {
                const isActive = selectedOrder?.id === order.id
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => handleSelectOrder(order)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      isActive
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {order.customer.first_name} {order.customer.last_name}
                        </p>
                        <p className="text-xs text-slate-500">{order.external_id}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{formatDate(order.placed_at)}</span>
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(order.total_amount, order.currency)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Paginação */}
            {pagination ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
                <div className="text-xs text-slate-500">
                  Mostrando <span className="font-semibold text-slate-700">{pagination.from ?? 0 }</span>
                   –<span className="font-semibold text-slate-700">{pagination.to ?? 0}</span> de{' '}
                  <span className="font-semibold text-slate-700">{pagination.total}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!pagination.prev_page_url}
                    onClick={() => handleGoToPage(pagination.current_page - 1)}
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
                          onClick={() => handleGoToPage(item)}
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
                    onClick={() => handleGoToPage(pagination.current_page + 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          {/* DETALHES (mantive sua lógica, só colei aqui sem alterar) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Detalhes</p>
                <p className="text-xs text-slate-500">
                  {selectedOrder?.external_id ?? 'Selecione um pedido'}
                </p>
              </div>
              {detailStatus === 'loading' ? (
                <span className="text-xs text-slate-400">Atualizando...</span>
              ) : null}
            </div>

            {selectedOrder ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Pedido
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-indigo-500" />
                        {selectedOrder.external_id}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        {formatDate(selectedOrder.placed_at)}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-indigo-500" />
                        {formatCurrency(
                          selectedOrder.total_amount,
                          selectedOrder.currency,
                        )}
                      </div>
                      <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                        {selectedOrder.status}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Cliente
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-500" />
                        {selectedOrder.customer.first_name}{' '}
                        {selectedOrder.customer.last_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-indigo-500" />
                        {selectedOrder.customer.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-indigo-500" />
                        {selectedOrder.customer.phone}
                      </div>
                      <div className="text-xs text-slate-500">
                        Total de pedidos: {selectedOrder.customer.total_orders_count}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Itens do pedido
                  </p>
                  <div className="mt-3 space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Quantidade: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {formatCurrency(item.total, selectedOrder.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    UTM da campanha
                  </p>
                  {selectedOrder.utm ? (
                    <div className="mt-3 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase text-slate-400">Source</p>
                        <p className="font-semibold text-slate-700">
                          {selectedOrder.utm.source}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-slate-400">Medium</p>
                        <p className="font-semibold text-slate-700">
                          {selectedOrder.utm.medium}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-slate-400">Campaign</p>
                        <p className="font-semibold text-slate-700">
                          {selectedOrder.utm.campaign}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-slate-400">Term</p>
                        <p className="font-semibold text-slate-700">
                          {selectedOrder.utm.term}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Nenhuma informação de UTM disponível.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Selecione um pedido para ver os detalhes.
              </div>
            )}
          </section>
        </div>
      ) : null}
    </DashboardPage>
  )
}

export default Orders
