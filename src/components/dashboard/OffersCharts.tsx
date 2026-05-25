import type { OfferAnalytics } from '../../lib/services/analytics/analytics.types'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

const calcRate = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0

const offerLabel = (offer: OfferAnalytics) =>
  offer.product_name ?? `#${offer.id}`

type OffersChartsProps = {
  offers: OfferAnalytics[]
}

const OffersCharts = ({ offers }: OffersChartsProps) => {
  const topOffers = [...offers]
    .sort(
      (a, b) =>
        (Number(b.revenue_generated) || 0) - (Number(a.revenue_generated) || 0),
    )
    .slice(0, 5)
  const maxViews = Math.max(1, ...topOffers.map((offer) => offer.views_count))
  const maxClicks = Math.max(1, ...topOffers.map((offer) => offer.clicks_count))
  const maxAccepted = Math.max(1, ...topOffers.map((offer) => offer.accepted_count))
  const maxRevenue = Math.max(
    1,
    ...topOffers.map((offer) => Number(offer.revenue_generated) || 0),
  )

  return (
    <div className="dashboard-chart-grid grid min-w-0 gap-4 lg:grid-cols-3">
      <section className="dashboard-chart-card min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              Views x Clicks x Accepted
            </h3>
            <p className="text-xs text-slate-500">Top 5 por receita.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> Views
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Clicks
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Aceites
            </span>
          </div>
        </header>
        <div className="dashboard-comparison-bars mt-3 space-y-2.5">
          {topOffers.map((offer) => (
            <div key={offer.id} className="min-w-0 space-y-1">
              <div className="flex min-w-0 items-center justify-between gap-2 text-[10px] text-slate-500">
                <span className="min-w-0 truncate font-medium text-slate-700" title={offerLabel(offer)}>
                  {offerLabel(offer)}
                </span>
                <span className="shrink-0">
                  {offer.views_count} / {offer.clicks_count} / {offer.accepted_count}
                </span>
              </div>
              <div className="grid gap-1">
                <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${(offer.views_count / maxViews) * 100}%` }} />
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${(offer.clicks_count / maxClicks) * 100}%` }} />
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(offer.accepted_count / maxAccepted) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-chart-card min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Receita por oferta</h3>
        <p className="text-xs text-slate-500">Top 5 por receita gerada.</p>
        <div className="mt-3 flex min-w-0 items-end gap-2">
          {topOffers.map((offer) => {
            const revenue = Number(offer.revenue_generated) || 0
            const height = (revenue / maxRevenue) * 88

            return (
              <div key={offer.id} className="group relative flex min-w-0 flex-1 flex-col items-center">
                <div
                  className="w-full min-w-0 rounded-t-md bg-blue-500/80"
                  style={{ height: `${Math.max(5, height)}px` }}
                  title={`${offerLabel(offer)}: ${formatCurrency(revenue)}`}
                />
                <span className="mt-1 block w-full truncate text-center text-[10px] text-slate-500" title={offerLabel(offer)}>
                  {offerLabel(offer)}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="dashboard-chart-card min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">Top offers</h3>
            <p className="text-xs text-slate-500">Ranking por receita.</p>
          </div>
          <span className="shrink-0 text-xs text-slate-400">Top 5</span>
        </div>
        <div className="mt-3 space-y-2">
          {topOffers.map((offer, index) => {
            const revenue = Number(offer.revenue_generated) || 0
            const ctr = calcRate(offer.clicks_count, offer.views_count)
            return (
              <div key={offer.id} className="flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
                <span className="w-5 shrink-0 text-[10px] font-semibold text-slate-400">#{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-700" title={offerLabel(offer)}>{offerLabel(offer)}</p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(revenue / maxRevenue) * 100}%` }} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-semibold text-slate-700">{formatCurrency(revenue)}</p>
                  <p className="text-[10px] text-slate-500">CTR {Math.round(ctr * 100)}%</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default OffersCharts
