import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  LineChart,
  Pencil,
  PieChart,
  PlusCircle,
  RefreshCcw,
  Trash2,
  Zap,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import { ApiError } from '../lib/api'
import {
  createCampaign,
  deleteCampaign,
  getCampaignById,
  getCampaigns,
  updateCampaign,
} from '../lib/services/campaigns/campaigns.service'
import type {
  Campaign,
  CampaignDetails,
  CampaignsResponse,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '../lib/services/campaigns/campaigns.types'

type PaginationMeta = Pick<
  CampaignsResponse,
  | 'current_page'
  | 'last_page'
  | 'per_page'
  | 'total'
  | 'from'
  | 'to'
  | 'next_page_url'
  | 'prev_page_url'
>

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}

const formatDateLabel = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('pt-BR')
}

const toDateInputValue = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

const toIsoDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString()
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

const formatPercentage = (value: number) => `${value.toFixed(2)}%`

const parseNumber = (value: string) => {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

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

const metricOptions = [
  { value: 'views', label: 'Views' },
  { value: 'clicks', label: 'Clicks' },
  { value: 'accepted', label: 'Aceites' },
  { value: 'revenue', label: 'Receita' },
] as const

const pieMetricOptions = [
  { value: 'views', label: 'Views' },
  { value: 'clicks', label: 'Clicks' },
  { value: 'accepted', label: 'Aceites' },
  { value: 'rejected', label: 'Recusas' },
  { value: 'revenue', label: 'Receita' },
] as const

type MetricKey = (typeof metricOptions)[number]['value']
type PieMetricKey = (typeof pieMetricOptions)[number]['value']

const chartColors = [
  '#6366F1',
  '#10B981',
  '#F97316',
  '#EF4444',
  '#0EA5E9',
  '#FACC15',
]

const UpsellCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [details, setDetails] = useState<CampaignDetails | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [detailStatus, setDetailStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [createError, setCreateError] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [updateError, setUpdateError] = useState<string | null>(null)

  const [metricFilter, setMetricFilter] = useState<MetricKey>('views')
  const [pieMetric, setPieMetric] = useState<PieMetricKey>('revenue')
  const [offerTypeFilter, setOfferTypeFilter] = useState('all')

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    priority: '',
    is_active: true,
    start_date: '',
    end_date: '',
  })

  const [editForm, setEditForm] = useState({
    name: '',
    priority: '',
    is_active: true,
    start_date: '',
    end_date: '',
  })

  const fetchCampaignDetails = useCallback(async (id: number) => {
    setDetailStatus('loading')
    setDetailError(null)
    try {
      const response = await getCampaignById(id)
      setDetails(response)
      setDetailStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar detalhes da campanha.'
      setDetailError(message)
      setDetailStatus('error')
    }
  }, [])

  const fetchCampaigns = useCallback(
    async (targetPage = page) => {
      setStatus('loading')
      setError(null)

      try {
        const response = await getCampaigns(targetPage)
        setCampaigns(response.data)
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

        const firstCampaign = response.data[0] ?? null
        setSelectedCampaign(firstCampaign)
        setDetails(null)

        if (firstCampaign) {
          fetchCampaignDetails(firstCampaign.id)
        }

        setStatus('idle')
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao carregar campanhas.'
        setError(message)
        setStatus('error')
      }
    },
    [fetchCampaignDetails, page],
  )

  useEffect(() => {
    fetchCampaigns(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedCampaign) return
    setEditForm({
      name: selectedCampaign.name,
      priority: String(selectedCampaign.priority),
      is_active: selectedCampaign.is_active,
      start_date: toDateInputValue(selectedCampaign.start_date),
      end_date: toDateInputValue(selectedCampaign.end_date),
    })
    setIsEditOpen(false)
  }, [selectedCampaign])

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
    return campaigns.reduce(
      (acc, campaign) => {
        acc.count += 1
        if (campaign.is_active) acc.active += 1
        return acc
      },
      { count: 0, active: 0 },
    )
  }, [campaigns])

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    fetchCampaignDetails(campaign.id)
  }

  const handleGoToPage = (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.last_page) return
    fetchCampaigns(nextPage)
  }

  const isFormValid = (
    form: typeof campaignForm | typeof editForm,
  ): boolean => {
    return (
      form.name.trim().length > 0 &&
      form.priority.trim().length > 0 &&
      Boolean(form.start_date) &&
      Boolean(form.end_date)
    )
  }

  const handleCreateCampaign = async () => {
    setCreateStatus('loading')
    setCreateError(null)

    const payload: CreateCampaignPayload = {
      name: campaignForm.name,
      priority: parseNumber(campaignForm.priority) ?? 0,
      is_active: campaignForm.is_active,
      start_date: toIsoDate(campaignForm.start_date),
      end_date: toIsoDate(campaignForm.end_date),
    }

    try {
      await createCampaign(payload)
      setCreateStatus('success')
      setCampaignForm({
        name: '',
        priority: '',
        is_active: true,
        start_date: '',
        end_date: '',
      })
      setIsCreateOpen(false)
      fetchCampaigns(1)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar campanha.'
      setCreateError(message)
      setCreateStatus('error')
    }
  }

  const handleUpdateCampaign = async () => {
    if (!selectedCampaign) return

    setUpdateStatus('loading')
    setUpdateError(null)

    const payload: UpdateCampaignPayload = {
      name: editForm.name,
      priority: parseNumber(editForm.priority) ?? 0,
      is_active: editForm.is_active,
      start_date: toIsoDate(editForm.start_date),
      end_date: toIsoDate(editForm.end_date),
    }

    try {
      const updated = await updateCampaign(selectedCampaign.id, payload)
      setSelectedCampaign(updated)
      setUpdateStatus('success')
      fetchCampaigns(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar campanha.'
      setUpdateError(message)
      setUpdateStatus('error')
    }
  }

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return

    const confirmed = window.confirm(
      'Tem certeza que deseja remover esta campanha?',
    )
    if (!confirmed) return

    try {
      await deleteCampaign(selectedCampaign.id)
      setSelectedCampaign(null)
      setDetails(null)
      fetchCampaigns(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao remover campanha.'
      setError(message)
    }
  }

  const pageItems = useMemo(() => {
    if (!pagination) return []
    return buildPageItems(pagination.current_page, pagination.last_page)
  }, [pagination])

  const offerTypes = useMemo(() => {
    if (!details) return []
    return Array.from(new Set(details.offers.map((offer) => offer.type)))
  }, [details])

  const filteredOffers = useMemo(() => {
    if (!details) return []
    if (offerTypeFilter === 'all') return details.offers
    return details.offers.filter((offer) => offer.type === offerTypeFilter)
  }, [details, offerTypeFilter])

  const pieSummary = useMemo(() => {
    if (!details) return []
    const totalsByType = new Map<string, number>()
    details.offers.forEach((offer) => {
      const value =
        pieMetric === 'views'
          ? offer.views
          : pieMetric === 'clicks'
            ? offer.clicks
            : pieMetric === 'accepted'
              ? offer.accepted
              : pieMetric === 'rejected'
                ? offer.rejected
                : offer.revenue
      totalsByType.set(
        offer.type,
        (totalsByType.get(offer.type) ?? 0) + value,
      )
    })

    return Array.from(totalsByType.entries()).map(([label, value], index) => ({
      label,
      value,
      color: chartColors[index % chartColors.length],
    }))
  }, [details, pieMetric])

  const pieTotal = pieSummary.reduce((sum, item) => sum + item.value, 0)
  const pieGradient = pieTotal
    ? pieSummary
        .reduce<{ start: number; segments: string[] }>(
          (acc, item) => {
            const percent = (item.value / pieTotal) * 100
            const end = acc.start + percent
            acc.segments.push(
              `${item.color} ${acc.start.toFixed(2)}% ${end.toFixed(2)}%`,
            )
            acc.start = end
            return acc
          },
          { start: 0, segments: [] },
        )
        .segments.join(', ')
    : '#E2E8F0'

  const lineData = useMemo(() => {
    if (!details) return []
    return details.daily.map((item) => ({
      label: item.date,
      value:
        metricFilter === 'views'
          ? item.views
          : metricFilter === 'clicks'
            ? item.clicks
            : metricFilter === 'accepted'
              ? item.accepted
              : item.revenue,
    }))
  }, [details, metricFilter])

  const lineMax = Math.max(1, ...lineData.map((item) => item.value))

  const linePoints = lineData.map((item, index) => {
    const x = lineData.length === 1 ? 50 : (index / (lineData.length - 1)) * 100
    const y = 100 - (item.value / lineMax) * 100
    return { ...item, x, y }
  })

  return (
    <DashboardPage
      title="Campanhas"
      subtitle="Upsell"
      containerClassName="max-w-6xl"
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Campanhas</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-semibold text-slate-900">
              {pagination?.total ?? totals.count}
            </p>
            <span className="text-sm text-slate-400">{totals.active} ativas</span>
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
          onClick={() => fetchCampaigns(page)}
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
          <p className="font-semibold">
            Não foi possível carregar as campanhas.
          </p>
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchCampaigns(page)}
            className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'idle' && campaigns.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          <p className="font-semibold">Nenhuma campanha encontrada.</p>
          <p className="text-sm text-slate-500">
            Assim que houver campanhas, elas aparecerão aqui.
          </p>
        </div>
      ) : null}

      {status === 'idle' && campaigns.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <button
                type="button"
                onClick={() => setIsCreateOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <PlusCircle className="h-4 w-4 text-indigo-500" />
                  Nova campanha
                </div>
                <span className="text-xs font-semibold text-indigo-600">
                  {isCreateOpen ? 'Recolher' : 'Expandir'}
                </span>
              </button>

              {isCreateOpen ? (
                <>
                  <div className="mt-4 grid gap-4">
                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Nome da campanha</span>
                      <input
                        value={campaignForm.name}
                        onChange={(event) =>
                          setCampaignForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                        placeholder="Campanha VIP de fevereiro"
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Prioridade</span>
                        <input
                          type="number"
                          value={campaignForm.priority}
                          onChange={(event) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              priority: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="1"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={campaignForm.is_active}
                          onChange={(event) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              is_active: event.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                        Campanha ativa
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Data de início</span>
                        <input
                          type="date"
                          value={campaignForm.start_date}
                          onChange={(event) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              start_date: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Data de término</span>
                        <input
                          type="date"
                          value={campaignForm.end_date}
                          onChange={(event) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              end_date: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCreateCampaign}
                      disabled={
                        !isFormValid(campaignForm) ||
                        createStatus === 'loading'
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Zap className="h-4 w-4" />
                      Criar campanha
                    </button>

                    {createStatus === 'success' ? (
                      <span className="text-xs font-semibold text-emerald-600">
                        Campanha criada!
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
                <Zap className="h-4 w-4 text-indigo-500" />
                Lista de campanhas
              </div>

              <div className="space-y-3">
                {campaigns.map((campaign) => {
                  const isActive = selectedCampaign?.id === campaign.id
                  return (
                    <button
                      key={campaign.id}
                      type="button"
                      onClick={() => handleSelectCampaign(campaign)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-indigo-200 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {campaign.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Prioridade {campaign.priority}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            campaign.is_active
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {campaign.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>
                          {formatDateLabel(campaign.start_date)} –{' '}
                          {formatDateLabel(campaign.end_date)}
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
                  {selectedCampaign?.name ?? 'Selecione uma campanha'}
                </p>
              </div>
              {detailStatus === 'loading' ? (
                <span className="text-xs text-slate-400">Atualizando...</span>
              ) : null}
            </div>

            {detailStatus === 'error' ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {detailError}
              </div>
            ) : null}

            {selectedCampaign && details ? (
              <div className="mt-6 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {details.campaign.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Prioridade {details.campaign.priority}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                          {formatDate(details.campaign.start_date)} —{' '}
                          {formatDate(details.campaign.end_date)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        details.campaign.is_active
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {details.campaign.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Receita total
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {formatCurrency(details.totals.revenue)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {details.totals.orders} pedidos gerados
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Conversão
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {formatPercentage(details.totals.conversion_rate)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Click → Accept{' '}
                      {formatPercentage(details.totals.click_to_accept_rate)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Receita por view
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {formatCurrency(details.totals.revenue_per_view)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {details.totals.views} views no período
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <LineChart className="h-4 w-4 text-indigo-500" />
                        Evolução diária
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Indicador</span>
                        <select
                          value={metricFilter}
                          onChange={(event) =>
                            setMetricFilter(event.target.value as MetricKey)
                          }
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700"
                        >
                          {metricOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {lineData.length === 0 ? (
                      <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                        Sem dados diários para este período.
                      </div>
                    ) : (
                      <div className="mt-6">
                        <svg
                          viewBox="0 0 100 100"
                          className="h-40 w-full"
                          preserveAspectRatio="none"
                        >
                          <polyline
                            fill="none"
                            stroke="#6366F1"
                            strokeWidth="2"
                            points={linePoints
                              .map((point) => `${point.x},${point.y}`)
                              .join(' ')}
                          />
                          {linePoints.map((point) => (
                            <circle
                              key={point.label}
                              cx={point.x}
                              cy={point.y}
                              r="1.8"
                              fill="#6366F1"
                            />
                          ))}
                        </svg>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                          <span>
                            {formatDateLabel(details.timeframe.start)} –{' '}
                            {formatDateLabel(details.timeframe.end)}
                          </span>
                          <span>Máximo: {lineMax}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <PieChart className="h-4 w-4 text-indigo-500" />
                        Distribuição por tipo
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Métrica</span>
                        <select
                          value={pieMetric}
                          onChange={(event) =>
                            setPieMetric(event.target.value as PieMetricKey)
                          }
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700"
                        >
                          {pieMetricOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col items-center gap-4">
                      <div
                        className="h-32 w-32 rounded-full border border-slate-200"
                        style={{
                          background: `conic-gradient(${pieGradient})`,
                        }}
                      />
                      <div className="w-full space-y-2 text-xs text-slate-600">
                        {pieSummary.length === 0 ? (
                          <p className="text-center text-slate-500">
                            Sem dados disponíveis.
                          </p>
                        ) : (
                          pieSummary.map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="capitalize">
                                  {item.label.replace('_', ' ')}
                                </span>
                              </div>
                              <span className="font-semibold text-slate-700">
                                {pieTotal === 0
                                  ? '0%'
                                  : `${((item.value / pieTotal) * 100).toFixed(
                                      1,
                                    )}%`}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-700">
                      Ofertas da campanha
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Filtrar tipo</span>
                      <select
                        value={offerTypeFilter}
                        onChange={(event) => setOfferTypeFilter(event.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700"
                      >
                        <option value="all">Todos</option>
                        {offerTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 overflow-auto">
                    <table className="min-w-full text-left text-xs text-slate-600">
                      <thead className="text-xs font-semibold uppercase text-slate-400">
                        <tr>
                          <th className="px-2 py-2">Produto</th>
                          <th className="px-2 py-2">Tipo</th>
                          <th className="px-2 py-2 text-right">Views</th>
                          <th className="px-2 py-2 text-right">Clicks</th>
                          <th className="px-2 py-2 text-right">Aceites</th>
                          <th className="px-2 py-2 text-right">Receita</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOffers.map((offer) => (
                          <tr
                            key={offer.id}
                            className="border-t border-slate-100"
                          >
                            <td className="px-2 py-2">
                              <div className="font-semibold text-slate-700">
                                {offer.product.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {offer.product.sku}
                              </div>
                            </td>
                            <td className="px-2 py-2 capitalize">
                              {offer.type.replace('_', ' ')}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {offer.views}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {offer.clicks}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {offer.accepted}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {formatCurrency(offer.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                      Editar campanha
                    </div>
                    <span className="text-xs font-semibold text-indigo-600">
                      {isEditOpen ? 'Recolher' : 'Expandir'}
                    </span>
                  </button>

                  {isEditOpen ? (
                    <>
                      <div className="mt-4 grid gap-4">
                        <label className="space-y-2 text-sm text-slate-600">
                          <span>Nome da campanha</span>
                          <input
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

                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Prioridade</span>
                            <input
                              type="number"
                              value={editForm.priority}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  priority: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={editForm.is_active}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  is_active: event.target.checked,
                                }))
                              }
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                            />
                            Campanha ativa
                          </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Data de início</span>
                            <input
                              type="date"
                              value={editForm.start_date}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  start_date: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Data de término</span>
                            <input
                              type="date"
                              value={editForm.end_date}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  end_date: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleUpdateCampaign}
                          disabled={
                            !isFormValid(editForm) || updateStatus === 'loading'
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Pencil className="h-4 w-4" />
                          Salvar alterações
                        </button>

                        {updateStatus === 'success' ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            Campanha atualizada!
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

                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                    <Trash2 className="h-4 w-4" />
                    Remover campanha
                  </div>
                  <p className="mt-2 text-xs text-rose-600">
                    Esta ação é irreversível e remove a campanha do calendário.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteCampaign}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir campanha
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Selecione uma campanha para ver os detalhes.
              </div>
            )}
          </section>
        </div>
      ) : null}
    </DashboardPage>
  )
}

export default UpsellCampaigns
