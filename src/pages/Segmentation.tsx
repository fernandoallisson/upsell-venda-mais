import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Pencil,
  PlusCircle,
  RefreshCcw,
  Tag,
  UserCircle2,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import { ApiError } from '../lib/api'
import {
  createSegment,
  getSegmentById,
  getSegments,
  updateSegment,
} from '../lib/services/segments/segments.service'
import type {
  CreateSegmentPayload,
  Segment,
  SegmentsResponse,
  UpdateSegmentPayload,
  SegmentRules,
} from '../lib/services/segments/segments.types'

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}

type PaginationMeta = Pick<
  SegmentsResponse,
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

const formatRuleLabel = (label: string) =>
  label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())

const parseListInput = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const Segmentation = () => {
  const [segments, setSegments] = useState<Segment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
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
  const [segmentForm, setSegmentForm] = useState({
    name: '',
    rules: '',
  })
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    rules: '',
  })
  const [isEditOpen, setIsEditOpen] = useState(false)

  const fetchSegmentDetails = useCallback(async (id: number) => {
    setDetailStatus('loading')
    try {
      const response = await getSegmentById(id)
      setSelectedSegment(response)
      setDetailStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar detalhes do segmento.'
      setError(message)
      setDetailStatus('error')
    }
  }, [])

  const fetchSegments = useCallback(
    async (targetPage = page) => {
      setStatus('loading')
      setError(null)

      try {
        const response = await getSegments(targetPage)

        setSegments(response.data)
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

        const firstSegment = response.data[0] ?? null
        setSelectedSegment(firstSegment)

        if (firstSegment) {
          fetchSegmentDetails(firstSegment.id)
        }

        setStatus('idle')
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao carregar segmentos.'
        setError(message)
        setStatus('error')
      }
    },
    [fetchSegmentDetails, page],
  )

  useEffect(() => {
    fetchSegments(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedSegment) return
    setEditForm({
      name: selectedSegment.name,
      rules: Object.keys(selectedSegment.rules).join(', '),
    })
    setIsEditOpen(false)
  }, [selectedSegment])

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
    return segments.reduce(
      (acc, segment) => {
        acc.count += 1
        acc.rules += Object.keys(segment.rules).length
        return acc
      },
      { count: 0, rules: 0 },
    )
  }, [segments])

  const handleSelectSegment = (segment: Segment) => {
    setSelectedSegment(segment)
    fetchSegmentDetails(segment.id)
  }

  const handleGoToPage = (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.last_page) return
    fetchSegments(nextPage)
  }

  const handleCreateSegment = async () => {
    setCreateStatus('loading')
    setCreateError(null)

    const payload: CreateSegmentPayload = {
      name: segmentForm.name,
      rules: parseListInput(segmentForm.rules),
    }

    try {
      await createSegment(payload)
      setCreateStatus('success')
      setSegmentForm({ name: '', rules: '' })
      setIsCreateOpen(false)
      fetchSegments(1)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar segmento.'
      setCreateError(message)
      setCreateStatus('error')
    }
  }

  const handleUpdateSegment = async () => {
    if (!selectedSegment) return

    setUpdateStatus('loading')
    setUpdateError(null)

    const payload: UpdateSegmentPayload = {
      name: editForm.name,
      rules: parseListInput(editForm.rules),
    }

    try {
      const updated = await updateSegment(selectedSegment.id, payload)
      setSelectedSegment(updated)
      setUpdateStatus('success')
      fetchSegments(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar segmento.'
      setUpdateError(message)
      setUpdateStatus('error')
    }
  }

  const pageItems = useMemo(() => {
    if (!pagination) return []
    return buildPageItems(pagination.current_page, pagination.last_page)
  }, [pagination])

  const isCreateValid =
    segmentForm.name.trim().length > 0 && segmentForm.rules.trim().length > 0

  const isUpdateValid =
    editForm.name.trim().length > 0 && editForm.rules.trim().length > 0

  const selectedRules = useMemo(() => {
    if (!selectedSegment) return []
    return Object.entries(selectedSegment.rules)
  }, [selectedSegment])

  return (
    <DashboardPage
      title="Segmentação"
      subtitle="Clientes"
      containerClassName="max-w-6xl"
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Segmentos</p>

          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-semibold text-slate-900">
              {pagination?.total ?? totals.count}
            </p>
            <span className="text-sm text-slate-400">
              total{' '}
              {pagination
                ? `(pág. ${pagination.current_page} de ${pagination.last_page})`
                : ''}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Regras (página atual):{' '}
            <span className="font-semibold text-slate-700">{totals.rules}</span>
          </p>

          {pagination ? (
            <p className="mt-1 text-xs text-slate-400">
              Mostrando {pagination.from ?? 0}–{pagination.to ?? 0} de{' '}
              {pagination.total}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => fetchSegments(page)}
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
          <p className="font-semibold">Não foi possível carregar os segmentos.</p>
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchSegments(page)}
            className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'idle' && segments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          <p className="font-semibold">Nenhum segmento encontrado.</p>
          <p className="text-sm text-slate-500">
            Assim que houver segmentos, eles serão listados aqui.
          </p>
        </div>
      ) : null}

      {status === 'idle' && segments.length > 0 ? (
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
                  Novo segmento
                </div>
                <span className="text-xs font-semibold text-indigo-600">
                  {isCreateOpen ? 'Recolher' : 'Expandir'}
                </span>
              </button>

              {isCreateOpen ? (
                <>
                  <div className="mt-4 grid gap-4">
                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Nome</span>
                      <input
                        type="text"
                        value={segmentForm.name}
                        onChange={(event) =>
                          setSegmentForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Compradores frequentes"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Regras (separadas por vírgula)</span>
                      <input
                        type="text"
                        value={segmentForm.rules}
                        onChange={(event) =>
                          setSegmentForm((prev) => ({
                            ...prev,
                            rules: event.target.value,
                          }))
                        }
                        placeholder="lifetime_value, total_orders"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCreateSegment}
                      disabled={!isCreateValid || createStatus === 'loading'}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Tag className="h-4 w-4" />
                      Criar segmento
                    </button>

                    {createStatus === 'success' ? (
                      <span className="text-xs font-semibold text-emerald-600">
                        Segmento criado!
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
                <Filter className="h-4 w-4 text-indigo-500" />
                Lista de segmentos
              </div>

              <div className="space-y-3">
                {segments.map((segment) => {
                  const isActive = selectedSegment?.id === segment.id
                  const rulesCount = Object.keys(segment.rules).length

                  return (
                    <button
                      key={segment.id}
                      type="button"
                      onClick={() => handleSelectSegment(segment)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-indigo-200 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {segment.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {segment.tenant_id}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {rulesCount} regra{rulesCount === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{formatDate(segment.created_at)}</span>
                        <span className="font-semibold text-slate-700">
                          Atualizado: {formatDate(segment.updated_at)}
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
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Detalhes</p>
                <p className="text-xs text-slate-500">
                  {selectedSegment?.name ?? 'Selecione um segmento'}
                </p>
              </div>
              {detailStatus === 'loading' ? (
                <span className="text-xs text-slate-400">Atualizando...</span>
              ) : null}
            </div>

            {selectedSegment ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Segmento
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-indigo-500" />
                        {selectedSegment.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="h-4 w-4 text-indigo-500" />
                        {selectedSegment.tenant_id}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        Criado em {formatDate(selectedSegment.created_at)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Atualizado em {formatDate(selectedSegment.updated_at)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Resumo
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <p className="text-xs text-slate-500">
                        Regras cadastradas
                      </p>
                      <p className="text-2xl font-semibold text-slate-900">
                        {selectedRules.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Pencil className="h-4 w-4 text-indigo-500" />
                      Editar segmento
                    </div>
                    <span className="text-xs font-semibold text-indigo-600">
                      {isEditOpen ? 'Recolher' : 'Expandir'}
                    </span>
                  </button>

                  {isEditOpen ? (
                    <>
                      <div className="mt-4 grid gap-4">
                        <label className="space-y-2 text-sm text-slate-600">
                          <span>Nome</span>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          />
                        </label>

                        <label className="space-y-2 text-sm text-slate-600">
                          <span>Regras (separadas por vírgula)</span>
                          <input
                            type="text"
                            value={editForm.rules}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                rules: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleUpdateSegment}
                          disabled={!isUpdateValid || updateStatus === 'loading'}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Pencil className="h-4 w-4" />
                          Salvar alterações
                        </button>

                        {updateStatus === 'success' ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            Segmento atualizado!
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

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Regras de segmentação
                  </p>
                  {selectedRules.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {selectedRules.map(([ruleKey, rule]) => (
                        <div
                          key={ruleKey}
                          className="flex flex-wrap items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">
                              {formatRuleLabel(ruleKey)}
                            </p>
                            <p className="text-xs text-slate-500">
                              Operador {rule.operator}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {rule.operator} {rule.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Nenhuma regra cadastrada para este segmento.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Selecione um segmento para ver os detalhes.
              </div>
            )}
          </section>
        </div>
      ) : null}
    </DashboardPage>
  )
}

export default Segmentation
