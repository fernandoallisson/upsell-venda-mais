import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  DollarSign,
  Eye,
  MousePointer,
  Percent,
  TrendingUp,
} from 'lucide-react'
import { ApiError } from '../lib/api'
import { getOffersAnalytics } from '../lib/services/analytics/analytics.service'
import type { OfferAnalytics } from '../lib/services/analytics/analytics.types'
import { logout } from '../lib/services/auth/auth.service'
import { getUser } from '../lib/services/users/users.service'
import type { User } from '../lib/services/users/users.types'
import { useAuth } from '../contexts/AuthContext'
import DashboardFilters from '../components/dashboard/DashboardFilters'
import KpiCard from '../components/dashboard/KpiCard'
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
  const { signOut } = useAuth()
  const [offers, setOffers] = useState<OfferAnalytics[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const [search, setSearch] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [onlyTop, setOnlyTop] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const response = await getOffersAnalytics()
      setOffers(response.data)
      setStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao carregar métricas.'
      setError(message)
      setStatus('error')
    }
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const data = await getUser()
      setUser(data)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
    fetchUser()
  }, [fetchAnalytics, fetchUser])

  const campaigns = useMemo(() => {
    const ids = new Set<number>()
    offers.forEach((offer) => ids.add(offer.upsell_campaign_id))
    return Array.from(ids).sort((a, b) => a - b)
  }, [offers])

  const products = useMemo(() => {
    const ids = new Set<number>()
    offers.forEach((offer) => ids.add(offer.product_id))
    return Array.from(ids).sort((a, b) => a - b)
  }, [offers])

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
        [offer.id, offer.product_id, offer.upsell_campaign_id]
          .map(String)
          .some((value) => value.toLowerCase().includes(term)),
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

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      signOut()
    }
  }

  const handleRefresh = () => {
    fetchAnalytics()
    fetchUser()
  }

  return (
    <DashboardLayout user={user} onRefresh={handleRefresh} onLogout={handleLogout}>
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
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <KpiCard
              title="Total de Views"
              value={totals.views.toLocaleString('pt-BR')}
              icon={<Eye className="h-5 w-5" />}
            />
            <KpiCard
              title="Total de Clicks"
              value={totals.clicks.toLocaleString('pt-BR')}
              icon={<MousePointer className="h-5 w-5" />}
            />
            <KpiCard
              title="Total de Accepted"
              value={totals.accepted.toLocaleString('pt-BR')}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <KpiCard
              title="Receita Total"
              value={formatCurrency(totals.revenue)}
              icon={<DollarSign className="h-5 w-5" />}
            />
            <KpiCard
              title="Taxa de Clique (CTR)"
              value={`${(ctr * 100).toFixed(1)}%`}
              icon={<Percent className="h-5 w-5" />}
              helper="Clicks / Views"
            />
            <KpiCard
              title="Taxa de Aceite"
              value={`${(acceptRate * 100).toFixed(1)}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              helper="Accepted / Clicks"
            />
          </section>

          <OffersCharts offers={filteredOffers} />

          <OffersTable offers={filteredOffers} />
        </>
      ) : null}
    </DashboardLayout>
  )
}

export default Dashboard
