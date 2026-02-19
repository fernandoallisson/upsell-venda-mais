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
  Tag,
  Trash2,
  Zap,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import { ApiError } from '../lib/api'
import {
  createOffer,
  deleteOffer,
  getOfferById,
  getOffers,
  updateOffer,
} from '../lib/services/offers/offers.service'
import type {
  CreateOfferPayload,
  Offer,
  OffersResponse,
  UpdateOfferPayload,
} from '../lib/services/offers/offers.types'

type PaginationMeta = Pick<
  OffersResponse,
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

type MetricKey = (typeof metricOptions)[number]['value']

type PieGroupKey = 'funnel' | 'conversion' | 'finance'

const pieGroupOptions = [
  { value: 'funnel', label: 'Funil' },
  { value: 'conversion', label: 'Conversão' },
  { value: 'finance', label: 'Financeiro' },
] as const

const chartColors = [
  '#6366F1',
  '#10B981',
  '#F97316',
  '#EF4444',
  '#0EA5E9',
  '#FACC15',
]

const offerTypes = [
  { value: 'cart_drawer', label: 'Carrinho' },
  { value: 'post_purchase', label: 'Pós-compra' },
  { value: 'pre_checkout', label: 'Pré-checkout' },
]

const discountTypes = [
  { value: 'percentage', label: 'Percentual' },
  { value: 'fixed_amount', label: 'Valor fixo' },
  { value: 'free_shipping', label: 'Frete grátis' },
]

const buildDailySeries = (total: number, days: number, seed: number) => {
  if (total <= 0 || days <= 0) {
    return Array.from({ length: days }, () => 0)
  }

  const weights = [1, 0.9, 1.1, 0.8, 1.25, 0.95, 1.05]
  const rotated = Array.from({ length: days }, (_, index) => {
    return weights[(index + seed) % weights.length]
  })
  const sum = rotated.reduce((acc, value) => acc + value, 0)
  const values = rotated.map((value) => Math.round((total * value) / sum))
  const diff = total - values.reduce((acc, value) => acc + value, 0)
  values[values.length - 1] += diff
  return values
}

const buildDateLabels = (reference: string, days: number) => {
  const base = new Date(reference)
  const safeBase = Number.isNaN(base.getTime()) ? new Date() : base
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(safeBase)
    date.setDate(date.getDate() - (days - 1 - index))
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  })
}

const UpsellOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([])
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [details, setDetails] = useState<Offer | null>(null)
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
  const [pieGroup, setPieGroup] = useState<PieGroupKey>('funnel')

  const [offerForm, setOfferForm] = useState({
    upsell_campaign_id: '',
    product_id: '',
    segment_id: '',
    type: offerTypes[0]?.value ?? '',
    discount_type: discountTypes[0]?.value ?? '',
    discount_value: '',
    headline: '',
    description: '',
  })

  const [editForm, setEditForm] = useState({
    upsell_campaign_id: '',
    product_id: '',
    segment_id: '',
    type: offerTypes[0]?.value ?? '',
    discount_type: discountTypes[0]?.value ?? '',
    discount_value: '',
    headline: '',
    description: '',
  })

  const fetchOfferDetails = useCallback(async (id: number) => {
    setDetailStatus('loading')
    setDetailError(null)
    try {
      const response = await getOfferById(id)
      setDetails(response)
      setDetailStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar detalhes da oferta.'
      setDetailError(message)
      setDetailStatus('error')
    }
  }, [])

  const fetchOffers = useCallback(
    async (targetPage = page) => {
      setStatus('loading')
      setError(null)

      try {
        const response = await getOffers(targetPage)
        setOffers(response.data)
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

        const firstOffer = response.data[0] ?? null
        setSelectedOffer(firstOffer)
        setDetails(null)

        if (firstOffer) {
          fetchOfferDetails(firstOffer.id)
        }

        setStatus('idle')
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao carregar ofertas.'
        setError(message)
        setStatus('error')
      }
    },
    [fetchOfferDetails, page],
  )

  useEffect(() => {
    fetchOffers(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedOffer) return
    setEditForm({
      upsell_campaign_id: String(selectedOffer.upsell_campaign_id),
      product_id: String(selectedOffer.product_id),
      segment_id:
        selectedOffer.segment_id === null
          ? ''
          : String(selectedOffer.segment_id),
      type: selectedOffer.type,
      discount_type: selectedOffer.discount_type,
      discount_value: String(selectedOffer.discount_value),
      headline: selectedOffer.headline,
      description: selectedOffer.description,
    })
    setIsEditOpen(false)
  }, [selectedOffer])

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
    return offers.reduce(
      (acc, offer) => {
        acc.count += 1
        acc.revenue += offer.revenue_generated
        return acc
      },
      { count: 0, revenue: 0 },
    )
  }, [offers])

  const handleSelectOffer = (offer: Offer) => {
    setSelectedOffer(offer)
    fetchOfferDetails(offer.id)
  }

  const handleGoToPage = (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.last_page) return
    fetchOffers(nextPage)
  }

  const isFormValid = (form: typeof offerForm | typeof editForm): boolean => {
    return (
      form.upsell_campaign_id.trim().length > 0 &&
      form.product_id.trim().length > 0 &&
      form.type.trim().length > 0 &&
      form.discount_type.trim().length > 0 &&
      form.discount_value.trim().length > 0 &&
      form.headline.trim().length > 0 &&
      form.description.trim().length > 0
    )
  }

  const buildPayload = (
    form: typeof offerForm | typeof editForm,
  ): CreateOfferPayload => {
    return {
      upsell_campaign_id: parseNumber(form.upsell_campaign_id) ?? 0,
      product_id: parseNumber(form.product_id) ?? 0,
      segment_id: parseNumber(form.segment_id ?? '') ?? null,
      type: form.type,
      discount_type: form.discount_type,
      discount_value: parseNumber(form.discount_value) ?? 0,
      headline: form.headline,
      description: form.description,
    }
  }

  const handleCreateOffer = async () => {
    setCreateStatus('loading')
    setCreateError(null)

    const payload = buildPayload(offerForm)

    try {
      await createOffer(payload)
      setCreateStatus('success')
      setOfferForm({
        upsell_campaign_id: '',
        product_id: '',
        segment_id: '',
        type: offerTypes[0]?.value ?? '',
        discount_type: discountTypes[0]?.value ?? '',
        discount_value: '',
        headline: '',
        description: '',
      })
      setIsCreateOpen(false)
      fetchOffers(1)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar oferta.'
      setCreateError(message)
      setCreateStatus('error')
    }
  }

  const handleUpdateOffer = async () => {
    if (!selectedOffer) return

    setUpdateStatus('loading')
    setUpdateError(null)

    const payload: UpdateOfferPayload = buildPayload(editForm)

    try {
      const updated = await updateOffer(selectedOffer.id, payload)
      setSelectedOffer(updated)
      setUpdateStatus('success')
      fetchOffers(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar oferta.'
      setUpdateError(message)
      setUpdateStatus('error')
    }
  }

  const handleDeleteOffer = async () => {
    if (!selectedOffer) return

    const confirmed = window.confirm(
      'Tem certeza que deseja remover esta oferta?',
    )
    if (!confirmed) return

    try {
      await deleteOffer(selectedOffer.id)
      setSelectedOffer(null)
      setDetails(null)
      fetchOffers(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao remover oferta.'
      setError(message)
    }
  }

  const pageItems = useMemo(() => {
    if (!pagination) return []
    return buildPageItems(pagination.current_page, pagination.last_page)
  }, [pagination])

  const lineData = useMemo(() => {
    if (!details) return []
    const seed = details.id % 7
    const totalsMap = {
      views: details.views_count,
      clicks: details.clicks_count,
      accepted: details.accepted_count,
      revenue: Math.round(details.revenue_generated),
    }
    const values = buildDailySeries(totalsMap[metricFilter], 7, seed)
    const labels = buildDateLabels(details.updated_at, 7)

    return values.map((value, index) => ({
      label: labels[index],
      value,
    }))
  }, [details, metricFilter])

  const lineMax = Math.max(1, ...lineData.map((item) => item.value))

  const linePoints = lineData.map((item, index) => {
    const x = lineData.length === 1 ? 50 : (index / (lineData.length - 1)) * 100
    const y = 100 - (item.value / lineMax) * 100
    return { ...item, x, y }
  })

  const pieSummary = useMemo(() => {
    if (!details) return []

    const rejected = Math.max(details.views_count - details.accepted_count, 0)
    const discountValue = details.discount_type === 'percentage'
      ? (details.revenue_generated * details.discount_value) / 100
      : details.discount_type === 'fixed_amount'
        ? details.discount_value
        : 0

    const summary =
      pieGroup === 'funnel'
        ? [
            { label: 'Views', value: details.views_count },
            { label: 'Clicks', value: details.clicks_count },
            { label: 'Aceites', value: details.accepted_count },
          ]
        : pieGroup === 'conversion'
          ? [
              { label: 'Aceites', value: details.accepted_count },
              { label: 'Não aceites', value: rejected },
            ]
          : [
              { label: 'Receita', value: details.revenue_generated },
              { label: 'Desconto', value: discountValue },
            ]

    return summary.map((item, index) => ({
      ...item,
      color: chartColors[index % chartColors.length],
    }))
  }, [details, pieGroup])

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

  return (
    <DashboardPage
      title="Ofertas"
      subtitle="Upsell"
      containerClassName="max-w-6xl"
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Ofertas</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-semibold text-slate-900">
              {pagination?.total ?? totals.count}
            </p>
            <span className="text-sm text-slate-400">
              {formatCurrency(totals.revenue)} em receita
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
          onClick={() => fetchOffers(page)}
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
          <p className="font-semibold">Não foi possível carregar as ofertas.</p>
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchOffers(page)}
            className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'idle' ? (
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
                  Nova oferta
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
                        <span>ID da campanha</span>
                        <input
                          type="number"
                          value={offerForm.upsell_campaign_id}
                          onChange={(event) =>
                            setOfferForm((prev) => ({
                              ...prev,
                              upsell_campaign_id: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="16"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>ID do produto</span>
                        <input
                          type="number"
                          value={offerForm.product_id}
                          onChange={(event) =>
                            setOfferForm((prev) => ({
                              ...prev,
                              product_id: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="16"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>ID do segmento (opcional)</span>
                        <input
                          type="number"
                          value={offerForm.segment_id}
                          onChange={(event) =>
                            setOfferForm((prev) => ({
                              ...prev,
                              segment_id: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="2"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Tipo de oferta</span>
                        <select
                          value={offerForm.type}
                          onChange={(event) =>
                            setOfferForm((prev) => ({
                              ...prev,
                              type: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
                        >
                          {offerTypes.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Tipo de desconto</span>
                        <select
                          value={offerForm.discount_type}
                          onChange={(event) =>
                            setOfferForm((prev) => ({
                              ...prev,
                              discount_type: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
                        >
                          {discountTypes.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Valor do desconto</span>
                        <input
                          type="number"
                          value={offerForm.discount_value}
                          onChange={(event) =>
                            setOfferForm((prev) => ({
                              ...prev,
                              discount_value: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="20"
                        />
                      </label>
                    </div>

                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Headline</span>
                      <input
                        value={offerForm.headline}
                        onChange={(event) =>
                          setOfferForm((prev) => ({
                            ...prev,
                            headline: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                        placeholder="Oferta especial: Kit completo"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Descrição</span>
                      <textarea
                        value={offerForm.description}
                        onChange={(event) =>
                          setOfferForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                        className="min-h-[96px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                        placeholder="Detalhe as condições e benefícios desta oferta."
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCreateOffer}
                      disabled={!isFormValid(offerForm) || createStatus === 'loading'}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Zap className="h-4 w-4" />
                      Criar oferta
                    </button>

                    {createStatus === 'success' ? (
                      <span className="text-xs font-semibold text-emerald-600">
                        Oferta criada!
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
                <Tag className="h-4 w-4 text-indigo-500" />
                Lista de ofertas
              </div>

              <div className="space-y-3">
                {offers.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-slate-400">
                    Nenhuma oferta encontrada.
                  </p>
                ) : null}
                {offers.map((offer) => {
                  const isActive = selectedOffer?.id === offer.id
                  return (
                    <button
                      key={offer.id}
                      type="button"
                      onClick={() => handleSelectOffer(offer)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-indigo-200 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {offer.headline}
                          </p>
                          <p className="text-xs text-slate-500">
                            Produto {offer.product_id} · Campanha {offer.upsell_campaign_id}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {offer.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>
                          {offer.discount_type.replace('_', ' ')} ·{' '}
                          {offer.discount_type === 'percentage'
                            ? formatPercentage(offer.discount_value)
                            : offer.discount_type === 'free_shipping'
                              ? 'Frete grátis'
                              : formatCurrency(offer.discount_value)}
                        </span>
                        <span>
                          {offer.views_count} views · {offer.accepted_count} aceites
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
                  {selectedOffer?.headline ?? 'Selecione uma oferta'}
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

            {selectedOffer && details ? (
              <div className="mt-6 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {details.headline}
                      </p>
                      <p className="text-xs text-slate-500">
                        Campanha {details.upsell_campaign_id} · Produto{' '}
                        {details.product_id}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                          {formatDate(details.created_at)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">
                          {details.discount_type.replace('_', ' ')} ·{' '}
                          {details.discount_type === 'percentage'
                            ? formatPercentage(details.discount_value)
                            : details.discount_type === 'free_shipping'
                              ? 'Frete grátis'
                              : formatCurrency(details.discount_value)}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                      {details.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Views
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {details.views_count}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {details.clicks_count} clicks registrados
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Aceites
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {details.accepted_count}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Conversão estimada{' '}
                      {details.views_count
                        ? formatPercentage(
                            (details.accepted_count / details.views_count) * 100,
                          )
                        : '0%'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Receita
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {formatCurrency(details.revenue_generated)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Atualizado em {formatDateLabel(details.updated_at)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <LineChart className="h-4 w-4 text-indigo-500" />
                        Evolução simulada
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
                        Sem dados para esta oferta.
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
                          <span>Últimos 7 dias</span>
                          <span>Máximo: {lineMax}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <PieChart className="h-4 w-4 text-indigo-500" />
                        Composição da oferta
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Filtro</span>
                        <select
                          value={pieGroup}
                          onChange={(event) =>
                            setPieGroup(event.target.value as PieGroupKey)
                          }
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700"
                        >
                          {pieGroupOptions.map((option) => (
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
                                <span>{item.label}</span>
                              </div>
                              <span className="font-semibold text-slate-700">
                                {pieTotal === 0
                                  ? '0%'
                                  : `${((item.value / pieTotal) * 100).toFixed(1)}%`}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
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
                      Editar oferta
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
                            <span>ID da campanha</span>
                            <input
                              type="number"
                              value={editForm.upsell_campaign_id}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  upsell_campaign_id: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>ID do produto</span>
                            <input
                              type="number"
                              value={editForm.product_id}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  product_id: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>ID do segmento (opcional)</span>
                            <input
                              type="number"
                              value={editForm.segment_id}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  segment_id: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Tipo de oferta</span>
                            <select
                              value={editForm.type}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  type: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
                            >
                              {offerTypes.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Tipo de desconto</span>
                            <select
                              value={editForm.discount_type}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  discount_type: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
                            >
                              {discountTypes.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Valor do desconto</span>
                            <input
                              type="number"
                              value={editForm.discount_value}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  discount_value: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                        </div>

                        <label className="space-y-2 text-sm text-slate-600">
                          <span>Headline</span>
                          <input
                            value={editForm.headline}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                headline: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          />
                        </label>

                        <label className="space-y-2 text-sm text-slate-600">
                          <span>Descrição</span>
                          <textarea
                            value={editForm.description}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                description: event.target.value,
                              }))
                            }
                            className="min-h-[96px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleUpdateOffer}
                          disabled={!isFormValid(editForm) || updateStatus === 'loading'}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Pencil className="h-4 w-4" />
                          Salvar alterações
                        </button>

                        {updateStatus === 'success' ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            Oferta atualizada!
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
                    Remover oferta
                  </div>
                  <p className="mt-2 text-xs text-rose-600">
                    Esta ação é irreversível e remove a oferta do catálogo.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteOffer}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir oferta
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Selecione uma oferta para ver os detalhes.
              </div>
            )}
          </section>
        </div>
      ) : null}
    </DashboardPage>
  )
}

export default UpsellOffers
