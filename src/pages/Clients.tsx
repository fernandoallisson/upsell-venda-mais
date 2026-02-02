import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Mail,
  Pencil,
  Phone,
  PlusCircle,
  RefreshCcw,
  Tag,
  Trash2,
  User,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import { ApiError } from '../lib/api'
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from '../lib/services/customers/customers.service'
import type {
  Customer,
  CustomerPayload,
  CustomersResponse,
} from '../lib/services/customers/customers.types'
import { getSegments } from '../lib/services/segments/segments.service'
import type { Segment } from '../lib/services/segments/segments.types'

const formatCurrency = (value: string, currency: string) => {
  const number = Number(value)
  if (Number.isNaN(number)) return value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(number)
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}


type PaginationMeta = Pick<
  CustomersResponse,
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
  const delta = 2
  const pages: Array<number | '...'> = []

  const left = Math.max(1, current - delta)
  const right = Math.min(last, current + delta)

  pages.push(1)

  if (left > 2) pages.push('...')

  for (let p = left; p <= right; p += 1) {
    if (p !== 1 && p !== last) pages.push(p)
  }

  if (right < last - 1) pages.push('...')

  if (last !== 1) pages.push(last)

  const normalized: Array<number | '...'> = []
  for (const item of pages) {
    if (normalized.length === 0 || normalized[normalized.length - 1] !== item) {
      normalized.push(item)
    }
  }
  return normalized
}

const formatLifecycleStage = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())

const Clients = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  )
  const [segments, setSegments] = useState<Segment[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [detailStatus, setDetailStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [createError, setCreateError] = useState<string | null>(null)
  const [customerForm, setCustomerForm] = useState({
    external_id: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    preferences: {
      sms: false,
      newsletter: false,
    },
    segments: [] as string[],
  })

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    external_id: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    preferences: {
      sms: false,
      newsletter: false,
    },
    segments: [] as string[],
  })

  const fetchCustomerDetails = useCallback(async (id: number) => {
    setDetailStatus('loading')
    try {
      const response = await getCustomerById(id)
      setSelectedCustomer(response)
      setDetailStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar detalhes do cliente.'
      setError(message)
      setDetailStatus('error')
    }
  }, [])

  const fetchCustomers = useCallback(
    async (targetPage = page) => {
      setStatus('loading')
      setError(null)

      try {
        const response = await getCustomers(targetPage)

        setCustomers(response.data)
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

        const firstCustomer = response.data[0] ?? null
        setSelectedCustomer(firstCustomer)

        if (firstCustomer) {
          fetchCustomerDetails(firstCustomer.id)
        }

        setStatus('idle')
              } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao carregar clientes.'
        setError(message)
        setStatus('error')
      }
    },
    [fetchCustomerDetails, page],
  )

  const fetchSegmentsList = useCallback(async () => {
    try {
      const response = await getSegments(1)
      setSegments(response.data)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar segmentos.'
      setError(message)
    }
  }, [])

  useEffect(() => {
    fetchCustomers(1)
    fetchSegmentsList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedCustomer) return
    setEditForm({
      external_id: selectedCustomer.external_id ?? '',
      email: selectedCustomer.email,
      phone: selectedCustomer.phone,
      first_name: selectedCustomer.first_name,
      last_name: selectedCustomer.last_name,
      preferences: {
        sms: selectedCustomer.preferences.sms,
        newsletter: selectedCustomer.preferences.newsletter,
      },
      segments: selectedCustomer.segments.map((segment) => String(segment.id)),
    })
    setIsEditOpen(false)
  }, [selectedCustomer])

  useEffect(() => {
    if (isCreateOpen) return
    setCreateStatus('idle')
    setCreateError(null)
  }, [isCreateOpen])

  useEffect(() => {
    if (isEditOpen) return
    setUpdateStatus('idle')
    setUpdateError(null)
  }, [isEditOpen])

  const totals = useMemo(() => {
    return customers.reduce(
      (acc, customer) => {
        acc.count += 1
        acc.orders += customer.total_orders_count
        return acc
      },
      { count: 0, orders: 0 },
    )
  }, [customers])

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    fetchCustomerDetails(customer.id)
  }

  const handleGoToPage = (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.last_page) return
    fetchCustomers(nextPage)
  }

  const toggleSegment = <T extends { segments: string[] }>(
    value: string,
    setter: Dispatch<SetStateAction<T>>,
  ) => {
    setter((prev) => {
      const exists = prev.segments.includes(value)
      const segments = exists
        ? prev.segments.filter((segment) => segment !== value)
        : [...prev.segments, value]
      return { ...prev, segments }
    })
  }

  const handleCreateCustomer = async () => {
    setCreateStatus('loading')
    setCreateError(null)

    const payload: CustomerPayload = {
      external_id: customerForm.external_id.trim() || null,
      email: customerForm.email.trim(),
      phone: customerForm.phone.trim(),
      first_name: customerForm.first_name.trim(),
      last_name: customerForm.last_name.trim(),
      preferences: customerForm.preferences,
      segments: customerForm.segments
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id)),
  }

    try {
      await createCustomer(payload)
      setCreateStatus('success')
      setCustomerForm({
        external_id: '',
        email: '',
        phone: '',
        first_name: '',
        last_name: '',
        preferences: {
          sms: false,
          newsletter: false,
        },
        segments: [],
      })
      setIsCreateOpen(false)
      fetchCustomers(1)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar cliente.'
      setCreateError(message)
      setCreateStatus('error')
    }
  }

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return

    setUpdateStatus('loading')
    setUpdateError(null)

    const payload: CustomerPayload = {
      external_id: editForm.external_id.trim() || null,
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      preferences: editForm.preferences,
      segments: editForm.segments
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id)),
    }

    try {
      const updated = await updateCustomer(selectedCustomer.id, payload)
      setSelectedCustomer(updated)
      setUpdateStatus('success')
      fetchCustomers(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar cliente.'
      setUpdateError(message)
      setUpdateStatus('error')
    }
  }

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return

    const confirmed = window.confirm(
      'Tem certeza que deseja remover este cliente?',
    )
    if (!confirmed) return

    try {
      await deleteCustomer(selectedCustomer.id)
      setSelectedCustomer(null)
      fetchCustomers(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao remover cliente.'
      setError(message)
    }
  }

  const pageItems = useMemo(() => {
    if (!pagination) return []
    return buildPageItems(pagination.current_page, pagination.last_page)
  }, [pagination])

  const isFormValid = (
    form: typeof customerForm | typeof editForm,
  ): boolean => {
    const requiredFields =
      form.email.trim() &&
      form.phone.trim() &&
      form.first_name.trim() &&
      form.last_name.trim()

    return Boolean(requiredFields)
  }

  const selectedSegments = useMemo(() => {
    if (!selectedCustomer) return []
    return selectedCustomer.segments
  }, [selectedCustomer])

  return (
    <DashboardPage
      title="Clientes"
      subtitle="CRM"
      containerClassName="max-w-6xl"
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Clientes</p>

          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-semibold text-slate-900">
              {pagination?.total ?? totals.count}
            </p>
            <span className="text-sm text-slate-400">
              {totals.orders} pedidos
            </span>
            <span className="text-sm text-slate-400">
              {pagination
                ? `(pág. ${pagination.current_page} de ${pagination.last_page})`
                : ''}
            </span>
          </div>

          {pagination ? (
            <p className="mt-1 text-xs text-slate-400">
              Mostrando {pagination.from ?? 0}–{pagination.to ?? 0} de{' '}
              {pagination.total}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => fetchCustomers(page)}
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
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold">Não foi possível carregar os clientes.</p>
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchCustomers(page)}
            className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'idle' && customers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          <p className="font-semibold">Nenhum cliente encontrado.</p>
          <p className="text-sm text-slate-500">
            Assim que houver clientes, eles aparecerão aqui.
          </p>
        </div>
      ) : null}

      {status === 'idle' && customers.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <button
                type="button"
                onClick={() => setIsCreateOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <PlusCircle className="h-4 w-4 text-indigo-500" />
                  Novo cliente
                </div>
                <span className="text-xs font-semibold text-indigo-600">
                  {isCreateOpen ? 'Recolher' : 'Expandir'}
                </span>
              </button>

              {isCreateOpen ? (
                <>
                  <div className="mt-4 grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Primeiro nome</span>
                        <input
                          value={customerForm.first_name}
                          onChange={(event) =>
                            setCustomerForm((prev) => ({
                              ...prev,
                              first_name: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="Ana"
                        />
                      </label>

                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Sobrenome</span>
                        <input
                          value={customerForm.last_name}
                          onChange={(event) =>
                            setCustomerForm((prev) => ({
                              ...prev,
                              last_name: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="Almeida"
                        />
                      </label>
                    </div>

                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Email</span>
                      <input
                        type="email"
                        value={customerForm.email}
                        onChange={(event) =>
                          setCustomerForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                        placeholder="ana.almeida@example.com"
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Telefone</span>
                        <input
                          value={customerForm.phone}
                          onChange={(event) =>
                            setCustomerForm((prev) => ({
                              ...prev,
                              phone: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="(11) 99999-9999"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>External ID (opcional)</span>
                        <input
                          value={customerForm.external_id}
                          onChange={(event) =>
                            setCustomerForm((prev) => ({
                              ...prev,
                              external_id: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="cust-000036"
                        />
                      </label>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-700">
                        Preferências
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={customerForm.preferences.sms}
                            onChange={(event) =>
                              setCustomerForm((prev) => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  sms: event.target.checked,
                                },
                              }))
                            }
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                          />
                          SMS
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={customerForm.preferences.newsletter}
                            onChange={(event) =>
                              setCustomerForm((prev) => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  newsletter: event.target.checked,
                                },
                              }))
                            }
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                          />
                          Newsletter
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-700">
                        Segmentos vinculados
                      </p>
                      {segments.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          Nenhum segmento disponível para seleção.
                        </p>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2">
                          {segments.map((segment) => (
                            <label
                              key={segment.id}
                              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600"
                            >
                              <input
                                type="checkbox"
                                checked={customerForm.segments.includes(
                                  String(segment.id),
                                )}
                                onChange={() =>
                                  toggleSegment(
                                    String(segment.id),
                                    setCustomerForm,
                                  )
                                }
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                              />
                              {segment.name}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCreateCustomer}
                      disabled={!isFormValid(customerForm) || createStatus === 'loading'}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <User className="h-4 w-4" />
                      Criar cliente
                    </button>

                    {createStatus === 'success' ? (
                      <span className="text-xs font-semibold text-emerald-600">
                        Cliente criado!
                      </span>
                    ) : null}
                    {createStatus === 'error' ? (
                      <span className="text-xs font-semibold text-rose-600">
                        {createError}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : null}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 px-2 pb-3 text-sm font-semibold text-slate-700">
                <User className="h-4 w-4 text-indigo-500" />
                Lista de clientes
              </div>

              <div className="space-y-3">
                {customers.map((customer) => {
                  const isActive = selectedCustomer?.id === customer.id
                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => handleSelectCustomer(customer)}
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
                          <p className="text-xs text-slate-500">
                            {customer.email}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {customer.total_orders_count} pedidos
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{customer.phone}</span>
                        <span className="font-semibold text-slate-700">
                          Ticket médio:{' '}
                          {formatCurrency(customer.average_ticket, 'BRL')}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {pagination ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
                  <div className="text-xs text-slate-500">
                    Mostrando{' '}
                    <span className="font-semibold text-slate-700">
                      {pagination.from ?? 0}
                    </span>{' '}
                    –
                    <span className="font-semibold text-slate-700">
                      {pagination.to ?? 0}
                    </span>{' '}
                    de{' '}
                    <span className="font-semibold text-slate-700">
                      {pagination.total}
                    </span>
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
                          <span
                            key={`dots-${idx}`}
                            className="px-2 text-xs text-slate-400"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleGoToPage(item)}
                            className={`min-w-9 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                              item === pagination.current_page
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
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
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {detailStatus === 'loading' ? (
                <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ) : null}

              {detailStatus !== 'loading' && selectedCustomer ? (
                <>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Cliente selecionado
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {formatLifecycleStage(selectedCustomer.lifecycle_stage)}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Total gasto
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(selectedCustomer.lifetime_value, 'BRL')}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Ticket médio
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(selectedCustomer.average_ticket, 'BRL')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-indigo-500" />
                      {selectedCustomer.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-indigo-500" />
                      {selectedCustomer.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      Última compra: {formatDate(selectedCustomer.last_purchase_at)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-indigo-500" />
                      {selectedCustomer.total_orders_count} pedidos no total
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-semibold text-slate-500">
                      Preferências
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCustomer.preferences.sms ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          SMS
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                          Sem SMS
                        </span>
                      )}
                      {selectedCustomer.preferences.newsletter ? (
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                          Newsletter
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                          Sem newsletter
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-semibold text-slate-500">
                      Segmentos
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSegments.length === 0 ? (
                        <span className="text-xs text-slate-400">
                          Nenhum segmento vinculado.
                        </span>
                      ) : (
                        selectedSegments.map((segment) => (
                          <span
                            key={segment.id}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                          >
                            {segment.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-slate-200 p-4">
                    <button
                      type="button"
                      onClick={() => setIsEditOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Pencil className="h-4 w-4 text-indigo-500" />
                        Editar cliente
                      </div>
                      <span className="text-xs font-semibold text-indigo-600">
                        {isEditOpen ? 'Recolher' : 'Expandir'}
                      </span>
                    </button>

                    {isEditOpen ? (
                      <>
                        <div className="mt-4 grid gap-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2 text-sm text-slate-600">
                              <span>Primeiro nome</span>
                              <input
                                value={editForm.first_name}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    first_name: event.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                              />
                            </label>

                            <label className="space-y-2 text-sm text-slate-600">
                              <span>Sobrenome</span>
                              <input
                                value={editForm.last_name}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    last_name: event.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                              />
                            </label>
                          </div>

                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Email</span>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  email: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>

                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2 text-sm text-slate-600">
                              <span>Telefone</span>
                              <input
                                value={editForm.phone}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    phone: event.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-slate-600">
                              <span>External ID (opcional)</span>
                              <input
                                value={editForm.external_id}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    external_id: event.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                              />
                            </label>
                          </div>

                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-700">
                              Preferências
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editForm.preferences.sms}
                                  onChange={(event) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      preferences: {
                                        ...prev.preferences,
                                        sms: event.target.checked,
                                      },
                                    }))
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                />
                                SMS
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editForm.preferences.newsletter}
                                  onChange={(event) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      preferences: {
                                        ...prev.preferences,
                                        newsletter: event.target.checked,
                                      },
                                    }))
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                />
                                Newsletter
                              </label>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-700">
                              Segmentos vinculados
                            </p>
                            {segments.length === 0 ? (
                              <p className="text-xs text-slate-400">
                                Nenhum segmento disponível para seleção.
                              </p>
                            ) : (
                              <div className="grid gap-2 md:grid-cols-2">
                                {segments.map((segment) => (
                                  <label
                                    key={segment.id}
                                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={editForm.segments.includes(
                                        String(segment.id),
                                      )}
                                      onChange={() =>
                                        toggleSegment(
                                          String(segment.id),
                                          setEditForm,
                                        )
                                      }
                                      className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                    />
                                    {segment.name}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={handleUpdateCustomer}
                            disabled={!isFormValid(editForm) || updateStatus === 'loading'}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Pencil className="h-4 w-4" />
                            Atualizar cliente
                          </button>

                          {updateStatus === 'success' ? (
                            <span className="text-xs font-semibold text-emerald-600">
                              Cliente atualizado!
                            </span>
                          ) : null}
                          {updateStatus === 'error' ? (
                            <span className="text-xs font-semibold text-rose-600">
                              {updateError}
                            </span>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                      <Trash2 className="h-4 w-4" />
                      Remover cliente
                    </div>
                    <p className="mt-2 text-xs text-rose-600">
                      Esta ação é irreversível e remove o cliente do CRM.
                    </p>
                    <button
                      type="button"
                      onClick={handleDeleteCustomer}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir cliente
                    </button>
                  </div>
                </>
              ) : null}

              {detailStatus !== 'loading' && !selectedCustomer ? (
                <div className="text-sm text-slate-500">
                  Selecione um cliente para ver detalhes.
                </div>
              ) : null}
            </section>

          </div>
        </div>
      ) : null}
    </DashboardPage>
  )
}

export default Clients
