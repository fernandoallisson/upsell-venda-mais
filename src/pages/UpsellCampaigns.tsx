import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import WorkspaceTabs from '../components/layout/WorkspaceTabs'
import { ApiError } from '../lib/api'
import {
  deleteCampaign,
  getCampaignById,
  getCampaignProducts,
  getCampaignSegments,
  getCampaigns,
  updateCampaignProducts,
  updateCampaignSegments,
} from '../lib/services/campaigns/campaigns.service'
import type {
  Campaign,
  CampaignDetails,
  CampaignProduct,
  CampaignsResponse,
  CampaignSegmentWithPivot,
} from '../lib/services/campaigns/campaigns.types'
import { getProducts } from '../lib/services/products/products.service'
import type { Product } from '../lib/services/products/products.types'
import { getSegments } from '../lib/services/segments/segments.service'
import type { Segment } from '../lib/services/segments/segments.types'
import { COMPACT_PAGE_SIZE, loadCompactPage } from '../lib/utils/compactPagination'

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

const formatPercentage = (value: number) => `${value.toFixed(2)}%`

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
  '#2563EB',
  '#10B981',
  '#F97316',
  '#EF4444',
  '#0EA5E9',
  '#FACC15',
]

const UpsellCampaigns = () => {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [details, setDetails] = useState<CampaignDetails | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [detailStatus, setDetailStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [campaignProducts, setCampaignProducts] = useState<CampaignProduct[]>(
    [],
  )
  const [campaignProductsStatus, setCampaignProductsStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [campaignProductsError, setCampaignProductsError] = useState<
    string | null
  >(null)
  const [productList, setProductList] = useState<Product[]>([])
  const [productListStatus, setProductListStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [productListError, setProductListError] = useState<string | null>(null)
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [productSelection, setProductSelection] = useState<number[]>([])
  const [updateProductsStatus, setUpdateProductsStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [updateProductsError, setUpdateProductsError] = useState<string | null>(
    null,
  )

  const [campaignSegments, setCampaignSegments] = useState<CampaignSegmentWithPivot[]>([])
  const [campaignSegmentsStatus, setCampaignSegmentsStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [campaignSegmentsError, setCampaignSegmentsError] = useState<string | null>(null)
  const [segmentList, setSegmentList] = useState<Segment[]>([])
  const [segmentListStatus, setSegmentListStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [isSegmentsOpen, setIsSegmentsOpen] = useState(false)
  const [segmentSelection, setSegmentSelection] = useState<number[]>([])
  const [updateSegmentsStatus, setUpdateSegmentsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [updateSegmentsError, setUpdateSegmentsError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [serverPageSize, setServerPageSize] = useState(COMPACT_PAGE_SIZE)
  const [workspaceView, setWorkspaceView] = useState<'list' | 'details' | 'create'>('list')
  const [detailView, setDetailView] = useState<
    'summary' | 'analytics' | 'products' | 'segments' | 'offers' | 'actions'
  >('summary')
  const [productPickerPage, setProductPickerPage] = useState(0)
  const [segmentPickerPage, setSegmentPickerPage] = useState(0)
  const [offerPage, setOfferPage] = useState(0)

  const [metricFilter, setMetricFilter] = useState<MetricKey>('views')
  const [pieMetric, setPieMetric] = useState<PieMetricKey>('revenue')
  const [offerTypeFilter, setOfferTypeFilter] = useState('all')

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

  const fetchCampaignProducts = useCallback(async (id: number) => {
    setCampaignProductsStatus('loading')
    setCampaignProductsError(null)
    try {
      const response = await getCampaignProducts(id)
      setCampaignProducts(response)
      setProductSelection(response.map((product) => product.id))
      setCampaignProductsStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar produtos da campanha.'
      setCampaignProductsError(message)
      setCampaignProductsStatus('error')
    }
  }, [])

  const fetchProductList = useCallback(async () => {
    setProductListStatus('loading')
    setProductListError(null)
    try {
      const response = await getProducts(1)
      setProductList(response.data)
      setProductListStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar produtos.'
      setProductListError(message)
      setProductListStatus('error')
    }
  }, [])

  const fetchCampaignSegments = useCallback(async (id: number) => {
    setCampaignSegmentsStatus('loading')
    setCampaignSegmentsError(null)
    try {
      const response = await getCampaignSegments(id)
      setCampaignSegments(response)
      setSegmentSelection(response.map((s) => s.id))
      setCampaignSegmentsStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar segmentos da campanha.'
      setCampaignSegmentsError(message)
      setCampaignSegmentsStatus('error')
    }
  }, [])

  const fetchSegmentList = useCallback(async () => {
    setSegmentListStatus('loading')
    try {
      const response = await getSegments(1)
      setSegmentList(response.data)
      setSegmentListStatus('idle')
    } catch {
      setSegmentListStatus('error')
    }
  }, [])

  const fetchCampaigns = useCallback(
    async (targetPage = page) => {
      setStatus('loading')
      setError(null)

      try {
        const response = await loadCompactPage<Campaign, CampaignsResponse>(
          getCampaigns,
          targetPage,
          serverPageSize,
        )
        setCampaigns(response.data)
        setPagination(response.pagination)
        setServerPageSize(response.serverPageSize)
        setPage(response.pagination.current_page)

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
    [fetchCampaignDetails, page, serverPageSize],
  )

  useEffect(() => {
    fetchCampaigns(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedCampaign) return
    setIsProductsOpen(false)
    setIsSegmentsOpen(false)
    setUpdateProductsStatus('idle')
    setUpdateProductsError(null)
    setUpdateSegmentsStatus('idle')
    setUpdateSegmentsError(null)
    fetchCampaignProducts(selectedCampaign.id)
    fetchCampaignSegments(selectedCampaign.id)
  }, [fetchCampaignProducts, fetchCampaignSegments, selectedCampaign])

  useEffect(() => {
    if (!isProductsOpen) return
    if (productList.length > 0 || productListStatus === 'loading') return
    fetchProductList()
  }, [fetchProductList, isProductsOpen, productList.length, productListStatus])

  useEffect(() => {
    if (!isSegmentsOpen) return
    if (segmentList.length > 0 || segmentListStatus === 'loading') return
    fetchSegmentList()
  }, [fetchSegmentList, isSegmentsOpen, segmentList.length, segmentListStatus])

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

  const selectedProductIds = useMemo(
    () => new Set(productSelection),
    [productSelection],
  )

  const selectedSegmentIds = useMemo(
    () => new Set(segmentSelection),
    [segmentSelection],
  )

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setWorkspaceView('details')
    setDetailView('summary')
    setProductPickerPage(0)
    setSegmentPickerPage(0)
    setOfferPage(0)
    fetchCampaignDetails(campaign.id)
  }

  const handleGoToPage = (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.last_page) return
    fetchCampaigns(nextPage)
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

  const handleToggleProductSelection = (productId: number) => {
    setProductSelection((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      }
      return [...prev, productId]
    })
  }

  const handleToggleSegmentSelection = (segmentId: number) => {
    setSegmentSelection((prev) => {
      if (prev.includes(segmentId)) {
        return prev.filter((id) => id !== segmentId)
      }
      return [...prev, segmentId]
    })
  }

  const handleSyncCampaignSegments = async () => {
    if (!selectedCampaign) return
    setUpdateSegmentsStatus('loading')
    setUpdateSegmentsError(null)
    try {
      const response = await updateCampaignSegments(selectedCampaign.id, segmentSelection)
      setCampaignSegments(response)
      setSegmentSelection(response.map((s) => s.id))
      setUpdateSegmentsStatus('success')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao atualizar segmentos da campanha.'
      setUpdateSegmentsError(message)
      setUpdateSegmentsStatus('error')
    }
  }

  const handleSyncCampaignProducts = async () => {
    if (!selectedCampaign) return
    setUpdateProductsStatus('loading')
    setUpdateProductsError(null)
    try {
      const response = await updateCampaignProducts(
        selectedCampaign.id,
        productSelection,
      )
      setCampaignProducts(response)
      setProductSelection(response.map((product) => product.id))
      setUpdateProductsStatus('success')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao atualizar produtos da campanha.'
      setUpdateProductsError(message)
      setUpdateProductsStatus('error')
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
      containerClassName="viewport-workspace crud-workspace max-w-6xl"
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Campanhas</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-semibold text-slate-900">
              {pagination?.total ?? totals.count}
            </p>
            <span className="text-sm text-slate-400">{totals.active} ativas nesta pagina</span>
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

      {status === 'idle' ? (
        <>
          <WorkspaceTabs
            value={workspaceView}
            onChange={(value) => {
              if (value === 'create') {
                navigate('/upsell/campanhas/nova')
                return
              }
              setWorkspaceView(value)
            }}
            tabs={[
              { value: 'list', label: 'Lista' },
              { value: 'details', label: 'Detalhes' },
              { value: 'create', label: 'Nova' },
            ]}
          />
        <div className="desktop-workspace-columns grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
          <div className="desktop-workspace-stack space-y-6">
            <button
              type="button"
              onClick={() => navigate('/upsell/campanhas/nova')}
              className={`desktop-workspace-panel ${workspaceView === 'create' ? 'is-active' : ''} flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:bg-blue-50`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600">
                <PlusCircle className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">Nova campanha</p>
                <p className="text-xs text-slate-500">Criar com preview em tempo real</p>
              </div>
            </button>

            <section className={`workspace-list-panel desktop-workspace-panel ${workspaceView === 'list' ? 'is-active' : ''} rounded-2xl border border-slate-200 bg-white p-4 shadow-sm`}>
              <div className="flex items-center gap-2 px-2 pb-3 text-sm font-semibold text-slate-700">
                <Zap className="h-4 w-4 text-blue-500" />
                Lista de campanhas
              </div>

              <div className="workspace-list-items space-y-3">
                {campaigns.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-slate-400">
                    Nenhuma campanha encontrada.
                  </p>
                ) : null}
                {campaigns.slice(0, 5).map((campaign) => {
                  const isActive = selectedCampaign?.id === campaign.id
                  return (
                    <button
                      key={campaign.id}
                      type="button"
                      onClick={() => handleSelectCampaign(campaign)}
                      className={`workspace-list-row w-full rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-blue-200 bg-blue-50'
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
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {campaign.start_date || campaign.end_date ? (
                          <span>
                            {campaign.start_date ? formatDateLabel(campaign.start_date) : '—'} –{' '}
                            {campaign.end_date ? formatDateLabel(campaign.end_date) : '—'}
                          </span>
                        ) : null}
                        {campaign.display_locations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {campaign.display_locations.map((loc) => (
                              <span key={loc} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                                {loc.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        )}
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
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
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

          <section className={`desktop-workspace-panel ${workspaceView === 'details' ? 'is-active' : ''} rounded-2xl border border-slate-200 bg-white p-6 shadow-sm`}>
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
              <>
              <WorkspaceTabs
                value={detailView}
                onChange={setDetailView}
                tabs={[
                  { value: 'summary', label: 'Resumo' },
                  { value: 'analytics', label: 'Desempenho' },
                  { value: 'products', label: 'Produtos' },
                  { value: 'segments', label: 'Segmentos' },
                  { value: 'offers', label: 'Ofertas' },
                  { value: 'actions', label: 'Acoes' },
                ]}
              />
              <div className="mt-4 space-y-4">
                <div className={`desktop-workspace-panel ${detailView === 'summary' ? 'is-active' : ''} rounded-xl border border-slate-200 bg-slate-50 p-4`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {details.campaign.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Prioridade {details.campaign.priority}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {(details.campaign.start_date || details.campaign.end_date) && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                            {details.campaign.start_date ? formatDate(details.campaign.start_date) : '—'} —{' '}
                            {details.campaign.end_date ? formatDate(details.campaign.end_date) : '—'}
                          </span>
                        )}
                        {details.campaign.display_locations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {details.campaign.display_locations.map((loc) => (
                              <span key={loc} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                                {loc.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
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

                <div className={`desktop-workspace-panel ${detailView === 'summary' ? 'is-active' : ''} grid gap-4 md:grid-cols-3`}>
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

                <div className={`desktop-workspace-panel ${detailView === 'analytics' ? 'is-active' : ''} grid gap-4 md:grid-cols-[1.4fr_1fr]`}>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <LineChart className="h-4 w-4 text-blue-500" />
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
                            stroke="#2563EB"
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
                              fill="#2563EB"
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
                        <PieChart className="h-4 w-4 text-blue-500" />
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

                <div className={`desktop-workspace-panel ${detailView === 'products' ? 'is-active' : ''} rounded-xl border border-slate-200 bg-white p-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Produtos da campanha
                      </p>
                      <p className="text-xs text-slate-500">
                        {campaignProducts.length} produto(s) vinculados
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsProductsOpen((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                    >
                      {isProductsOpen ? 'Fechar seleção' : 'Adicionar produtos'}
                    </button>
                  </div>

                  {campaignProductsStatus === 'loading' ? (
                    <p className="mt-4 text-xs text-slate-400">
                      Carregando produtos da campanha...
                    </p>
                  ) : null}

                  {campaignProductsStatus === 'error' ? (
                    <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                      {campaignProductsError}
                    </div>
                  ) : null}

                  {campaignProductsStatus === 'idle' ? (
                    <div className="mt-4 space-y-3">
                      {campaignProducts.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                          Nenhum produto vinculado ainda.
                        </div>
                      ) : (
                        campaignProducts.slice(0, 3).map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                          >
                            <div>
                              <p className="font-semibold text-slate-700">
                                {product.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {product.sku}
                              </p>
                            </div>
                            <span className="font-semibold text-slate-700">
                              {formatCurrency(Number(product.price))}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                  {campaignProducts.length > 3 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Mais {campaignProducts.length - 3} produto(s). Use Adicionar produtos para revisar a selecao.
                    </p>
                  ) : null}

                  {isProductsOpen ? (
                    <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-600">
                            Selecione os produtos
                          </p>
                          <p className="text-xs text-slate-400">
                            Escolha os itens já cadastrados para a campanha.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={fetchProductList}
                          className="text-xs font-semibold text-blue-600"
                        >
                          Recarregar lista
                        </button>
                      </div>

                      {productListStatus === 'loading' ? (
                        <p className="text-xs text-slate-400">
                          Carregando produtos...
                        </p>
                      ) : null}

                      {productListStatus === 'error' ? (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                          {productListError}
                        </div>
                      ) : null}

                      {productListStatus === 'idle' ? (
                        <div className="space-y-2">
                          {productList.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
                              Nenhum produto encontrado.
                            </div>
                          ) : (
                            productList.slice(productPickerPage * 3, productPickerPage * 3 + 3).map((product) => {
                              const isSelected = selectedProductIds.has(
                                product.id,
                              )
                              return (
                                <label
                                  key={product.id}
                                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-xs transition ${
                                    isSelected
                                      ? 'border-blue-200 bg-white'
                                      : 'border-slate-200 bg-white'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      handleToggleProductSelection(product.id)
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                  />
                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-700">
                                      {product.name}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                      {product.sku} ·{' '}
                                      {formatCurrency(Number(product.price))}
                                    </p>
                                  </div>
                                  <span
                                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                                      product.is_active
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {product.is_active ? 'Ativo' : 'Inativo'}
                                  </span>
                                </label>
                              )
                            })
                          )}
                        </div>
                      ) : null}

                      {productList.length > 3 ? (
                        <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
                          <button type="button" disabled={productPickerPage === 0} onClick={() => setProductPickerPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">Anterior</button>
                          <span>{productPickerPage + 1} / {Math.ceil(productList.length / 3)}</span>
                          <button type="button" disabled={productPickerPage + 1 >= Math.ceil(productList.length / 3)} onClick={() => setProductPickerPage((value) => value + 1)} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">Proxima</button>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleSyncCampaignProducts}
                          disabled={updateProductsStatus === 'loading'}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Salvar seleção
                        </button>
                        {updateProductsStatus === 'success' ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            Produtos atualizados!
                          </span>
                        ) : null}
                        {updateProductsStatus === 'error' ? (
                          <span className="text-xs font-semibold text-rose-600">
                            {updateProductsError}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className={`desktop-workspace-panel ${detailView === 'segments' ? 'is-active' : ''} rounded-xl border border-slate-200 bg-white p-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Segmentos da campanha
                      </p>
                      <p className="text-xs text-slate-500">
                        {campaignSegments.length} segmento(s) vinculados
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSegmentsOpen((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                    >
                      {isSegmentsOpen ? 'Fechar seleção' : 'Gerenciar segmentos'}
                    </button>
                  </div>

                  {campaignSegmentsStatus === 'loading' ? (
                    <p className="mt-4 text-xs text-slate-400">Carregando segmentos...</p>
                  ) : null}

                  {campaignSegmentsStatus === 'error' ? (
                    <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                      {campaignSegmentsError}
                    </div>
                  ) : null}

                  {campaignSegmentsStatus === 'idle' && campaignSegments.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {campaignSegments.slice(0, 3).map((seg) => (
                        <span key={seg.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                          {seg.name}
                          {seg.matched_customers_count != null && (
                            <span className="ml-1.5 text-slate-400">({seg.matched_customers_count})</span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {isSegmentsOpen ? (
                    <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-slate-600">Selecione os segmentos</p>
                        <button
                          type="button"
                          onClick={fetchSegmentList}
                          className="text-xs font-semibold text-blue-600"
                        >
                          Recarregar lista
                        </button>
                      </div>

                      {segmentListStatus === 'loading' ? (
                        <p className="text-xs text-slate-400">Carregando segmentos...</p>
                      ) : null}

                      {segmentListStatus === 'idle' ? (
                        <div className="space-y-2">
                          {segmentList.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
                              Nenhum segmento encontrado.
                            </div>
                          ) : (
                            segmentList.slice(segmentPickerPage * 3, segmentPickerPage * 3 + 3).map((seg) => {
                              const isSelected = selectedSegmentIds.has(seg.id)
                              return (
                                <label
                                  key={seg.id}
                                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs transition"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSegmentSelection(seg.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                  />
                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-700">{seg.name}</p>
                                    {seg.matched_customers_count != null && (
                                      <p className="text-[11px] text-slate-400">
                                        {seg.matched_customers_count} clientes correspondentes
                                      </p>
                                    )}
                                  </div>
                                </label>
                              )
                            })
                          )}
                        </div>
                      ) : null}

                      {segmentList.length > 3 ? (
                        <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
                          <button type="button" disabled={segmentPickerPage === 0} onClick={() => setSegmentPickerPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">Anterior</button>
                          <span>{segmentPickerPage + 1} / {Math.ceil(segmentList.length / 3)}</span>
                          <button type="button" disabled={segmentPickerPage + 1 >= Math.ceil(segmentList.length / 3)} onClick={() => setSegmentPickerPage((value) => value + 1)} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">Proxima</button>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleSyncCampaignSegments}
                          disabled={updateSegmentsStatus === 'loading'}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Salvar seleção
                        </button>
                        {updateSegmentsStatus === 'success' ? (
                          <span className="text-xs font-semibold text-emerald-600">Segmentos atualizados!</span>
                        ) : null}
                        {updateSegmentsStatus === 'error' ? (
                          <span className="text-xs font-semibold text-rose-600">{updateSegmentsError}</span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className={`desktop-workspace-panel ${detailView === 'offers' ? 'is-active' : ''} rounded-xl border border-slate-200 bg-white p-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-700">
                      Ofertas da campanha
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Filtrar tipo</span>
                      <select
                        value={offerTypeFilter}
                        onChange={(event) => {
                          setOfferTypeFilter(event.target.value)
                          setOfferPage(0)
                        }}
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

                  <div className="mt-4 overflow-hidden">
                    <table className="w-full table-fixed text-left text-xs text-slate-600">
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
                        {filteredOffers.slice(offerPage * 3, offerPage * 3 + 3).map((offer) => (
                          <tr
                            key={offer.id}
                            className="border-t border-slate-100"
                          >
                            <td className="px-2 py-2">
                              <div className="truncate font-semibold text-slate-700" title={offer.product.name}>
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
                  {filteredOffers.length > 3 ? (
                    <div className="mt-3 flex items-center justify-end gap-2 text-xs text-slate-500">
                      <button type="button" disabled={offerPage === 0} onClick={() => setOfferPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">Anterior</button>
                      <span>{offerPage + 1} / {Math.ceil(filteredOffers.length / 3)}</span>
                      <button type="button" disabled={offerPage + 1 >= Math.ceil(filteredOffers.length / 3)} onClick={() => setOfferPage((value) => value + 1)} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">Proxima</button>
                    </div>
                  ) : null}
                  {campaignSegments.length > 3 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Mais {campaignSegments.length - 3} segmento(s). Use Gerenciar segmentos para revisar a selecao.
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/upsell/campanhas/${selectedCampaign.id}/editar`)
                  }
                  className={`desktop-workspace-panel ${detailView === 'actions' ? 'is-active' : ''} flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50`}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Pencil className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800">
                      Editar campanha
                    </p>
                    <p className="text-xs text-slate-500">
                      Editar com preview em tempo real
                    </p>
                  </div>
                </button>

                <div className={`desktop-workspace-panel ${detailView === 'actions' ? 'is-active' : ''} rounded-xl border border-rose-200 bg-rose-50 p-4`}>
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
              </>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Selecione uma campanha para ver os detalhes.
              </div>
            )}
          </section>
        </div>
        </>
      ) : null}
    </DashboardPage>
  )
}

export default UpsellCampaigns
