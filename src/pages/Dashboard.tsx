import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  DollarSign,
  Eye,
  MousePointer,
  Percent,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { ApiError, invalidateApiCache } from '../lib/api'
import { API_CACHE_TAGS } from '../lib/services/cacheTags'
import {
  getAnalyticsOverview,
  getOffersAnalytics,
} from '../lib/services/analytics/analytics.service'
import type {
  AnalyticsOverviewResponse,
  OfferAnalytics,
} from '../lib/services/analytics/analytics.types'
import { logout } from '../lib/services/auth/auth.service'
import { getCampaigns } from '../lib/services/campaigns/campaigns.service'
import type { Campaign } from '../lib/services/campaigns/campaigns.types'
import { getProducts } from '../lib/services/products/products.service'
import type { Product } from '../lib/services/products/products.types'
import { useAuth } from '../contexts/useAuth'
import DashboardFilters from '../components/dashboard/DashboardFilters'
import OffersCharts from '../components/dashboard/OffersCharts'
import OffersTable from '../components/dashboard/OffersTable'
import DashboardLayout from '../components/layout/DashboardLayout'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

const calcRate = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0

const Dashboard = () => {
  const { signOut, user, refreshUser } = useAuth()
  const [offers, setOffers] = useState<OfferAnalytics[]>([])
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [search, setSearch] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [onlyTop, setOnlyTop] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const [offersResponse, overviewResponse, campaignsResponse, productsResponse] =
        await Promise.all([
          getOffersAnalytics(),
          getAnalyticsOverview(),
          getCampaigns(1),
          getProducts(1),
        ])

      const campaignMap = new Map<number, string>(
        campaignsResponse.data.map((c) => [c.id, c.name]),
      )
      const productMap = new Map<number, string>(
        productsResponse.data.map((p) => [p.id, p.name]),
      )

      const enriched = offersResponse.data.map((offer) => ({
        ...offer,
        campaign_name: campaignMap.get(offer.upsell_campaign_id),
        product_name: productMap.get(offer.product_id),
      }))

      setOffers(enriched)
      setOverview(overviewResponse)
      setCampaigns(campaignsResponse.data)
      setProducts(productsResponse.data)
      setStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao carregar métricas.'
      setError(message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const filteredOffers = useMemo(() => {
    let data = [...offers]

    if (selectedCampaign) {
      data = data.filter(
        (offer) => String(offer.upsell_campaign_id) === selectedCampaign,
      )
    }

    if (selectedProduct) {
      data = data.filter((offer) => String(offer.product_id) === selectedProduct)
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase()
      data = data.filter((offer) =>
        [
          String(offer.id),
          String(offer.product_id),
          String(offer.upsell_campaign_id),
          offer.product_name ?? '',
          offer.campaign_name ?? '',
        ].some((value) => value.toLowerCase().includes(term)),
      )
    }

    if (onlyTop && data.length > 0) {
      const avgCtr =
        data.reduce(
          (sum, offer) => sum + calcRate(offer.clicks_count, offer.views_count),
          0,
        ) / data.length
      data = data.filter(
        (offer) => calcRate(offer.clicks_count, offer.views_count) >= avgCtr,
      )
    }

    return data
  }, [offers, selectedCampaign, selectedProduct, search, onlyTop])

  const totals = useMemo(() => {
    return filteredOffers.reduce(
      (acc, offer) => {
        acc.views += offer.views_count
        acc.clicks += offer.clicks_count
        acc.accepted += offer.accepted_count
        acc.revenue += Number(offer.revenue_generated) || 0
        return acc
      },
      { views: 0, clicks: 0, accepted: 0, revenue: 0 },
    )
  }, [filteredOffers])

  const ctr = calcRate(totals.clicks, totals.views)
  const acceptRate = calcRate(totals.accepted, totals.clicks)
  const metricGroups = [
    {
      title: 'Pedidos',
      items: [
        {
          label: 'Total de Pedidos',
          value: overview ? overview.orders_count.toLocaleString('pt-BR') : '--',
          icon: <ShoppingCart className="h-4 w-4" />,
        },
        {
          label: 'Receita de Pedidos',
          value: overview ? formatCurrency(Number(overview.revenue) || 0) : '--',
          icon: <DollarSign className="h-4 w-4" />,
        },
        {
          label: 'Ticket Medio',
          value: overview ? formatCurrency(Number(overview.avg_ticket) || 0) : '--',
          icon: <TrendingUp className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Interações',
      items: [
        { label: 'Views', value: totals.views.toLocaleString('pt-BR'), icon: <Eye className="h-4 w-4" /> },
        { label: 'Clicks', value: totals.clicks.toLocaleString('pt-BR'), icon: <MousePointer className="h-4 w-4" /> },
        { label: 'Aceites', value: totals.accepted.toLocaleString('pt-BR'), icon: <CheckCircle2 className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Performance',
      items: [
        { label: 'Receita Total', value: formatCurrency(totals.revenue), icon: <DollarSign className="h-4 w-4" /> },
        { label: 'CTR', value: `${(ctr * 100).toFixed(1)}%`, icon: <Percent className="h-4 w-4" /> },
        { label: 'Taxa de Aceite', value: `${(acceptRate * 100).toFixed(1)}%`, icon: <TrendingUp className="h-4 w-4" /> },
      ],
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      signOut()
    }
  }

  const handleRefresh = () => {
    invalidateApiCache([
      API_CACHE_TAGS.analytics,
      API_CACHE_TAGS.campaigns,
      API_CACHE_TAGS.products,
    ])
    fetchAnalytics()
    void refreshUser({ force: true })
  }

  return (
    <DashboardLayout
      user={user}
      onRefresh={handleRefresh}
      onLogout={handleLogout}
      containerClassName="viewport-workspace dashboard-overview max-w-7xl"
    >
      <DashboardFilters
        search={search}
        selectedCampaign={selectedCampaign}
        selectedProduct={selectedProduct}
        campaigns={campaigns}
        products={products}
        onlyTop={onlyTop}
        onSearchChange={setSearch}
        onCampaignChange={setSelectedCampaign}
        onProductChange={setSelectedProduct}
        onOnlyTopChange={setOnlyTop}
      />

      {status === 'loading' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold">Não foi possível carregar os dados.</p>
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={fetchAnalytics}
            className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'idle' && filteredOffers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          <p className="font-semibold">Nenhuma oferta encontrada.</p>
          <p className="text-sm text-slate-500">
            Ajuste os filtros ou verifique se há dados disponíveis.
          </p>
        </div>
      ) : null}

      {status === 'idle' && filteredOffers.length > 0 ? (
        <>
          <section className="dashboard-kpi-groups grid gap-4 xl:grid-cols-3">
            {metricGroups.map((group) => (
              <div key={group.title} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{group.title}</p>
                <div className="grid grid-cols-3 gap-2">
                  {group.items.map((item) => (
                    <div key={item.label} className="min-w-0 rounded-xl bg-slate-50 p-2">
                      <div className="flex items-center justify-between gap-1 text-slate-500">
                        <p className="truncate text-[10px] font-medium" title={item.label}>{item.label}</p>
                        <span className="shrink-0">{item.icon}</span>
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-900" title={item.value}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <OffersCharts offers={filteredOffers} />

          <OffersTable
            key={`${search}|${selectedCampaign}|${selectedProduct}|${onlyTop}`}
            offers={filteredOffers}
          />
        </>
      ) : null}
    </DashboardLayout>
  )
}

export default Dashboard
