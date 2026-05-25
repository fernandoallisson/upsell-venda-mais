import { useMemo, useState } from 'react'
import type { OfferAnalytics } from '../../lib/services/analytics/analytics.types'

const PAGE_SIZE = 3

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

const calcRate = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0

type OffersTableProps = {
  offers: OfferAnalytics[]
}

const OffersTable = ({ offers }: OffersTableProps) => {
  const [page, setPage] = useState(1)
  const lastPage = Math.max(1, Math.ceil(offers.length / PAGE_SIZE))
  const currentPage = Math.min(page, lastPage)

  const visibleOffers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return offers.slice(start, start + PAGE_SIZE)
  }, [currentPage, offers])

  return (
    <section className="dashboard-offers-table min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">Detalhamento das ofertas</h3>
          <p className="text-xs text-slate-500">Pagina {currentPage} de {lastPage} - {offers.length} ofertas</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 disabled:opacity-40">
            Anterior
          </button>
          <button type="button" disabled={currentPage === lastPage} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 disabled:opacity-40">
            Proxima
          </button>
        </div>
      </div>
      <div className="dashboard-table-frame min-w-0 overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-slate-100 text-[11px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="w-[7%] px-2 py-1.5 text-left font-medium">ID</th>
              <th className="w-[18%] px-2 py-1.5 text-left font-medium">Produto</th>
              <th className="w-[18%] px-2 py-1.5 text-left font-medium">Campanha</th>
              <th className="w-[10%] px-2 py-1.5 text-right font-medium">Views</th>
              <th className="w-[10%] px-2 py-1.5 text-right font-medium">Clicks</th>
              <th className="w-[10%] px-2 py-1.5 text-right font-medium">Aceites</th>
              <th className="w-[13%] px-2 py-1.5 text-right font-medium">Receita</th>
              <th className="w-[7%] px-2 py-1.5 text-right font-medium">CTR</th>
              <th className="w-[7%] px-2 py-1.5 text-right font-medium">Taxa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleOffers.map((offer) => {
              const ctr = calcRate(offer.clicks_count, offer.views_count)
              const acceptRate = calcRate(offer.accepted_count, offer.clicks_count)
              const revenue = Number(offer.revenue_generated)
              return (
                <tr key={offer.id} className="text-slate-700">
                  <td className="truncate px-2 py-2 font-medium text-slate-900">#{offer.id}</td>
                  <td className="truncate px-2 py-2" title={offer.product_name ?? `#${offer.product_id}`}>{offer.product_name ?? `#${offer.product_id}`}</td>
                  <td className="truncate px-2 py-2" title={offer.campaign_name ?? `#${offer.upsell_campaign_id}`}>{offer.campaign_name ?? `#${offer.upsell_campaign_id}`}</td>
                  <td className="truncate px-2 py-2 text-right">{offer.views_count}</td>
                  <td className="truncate px-2 py-2 text-right">{offer.clicks_count}</td>
                  <td className="truncate px-2 py-2 text-right">{offer.accepted_count}</td>
                  <td className="truncate px-2 py-2 text-right" title={formatCurrency(Number.isNaN(revenue) ? 0 : revenue)}>
                    {formatCurrency(Number.isNaN(revenue) ? 0 : revenue)}
                  </td>
                  <td className="truncate px-2 py-2 text-right">{formatPercent(ctr)}</td>
                  <td className="truncate px-2 py-2 text-right">{formatPercent(acceptRate)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default OffersTable
