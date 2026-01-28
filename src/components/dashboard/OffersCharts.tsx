import type { OfferAnalytics } from '../../lib/services/analytics/analytics.types'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

const calcRate = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0

type OffersChartsProps = {
  offers: OfferAnalytics[]
}

const OffersCharts = ({ offers }: OffersChartsProps) => {
  const maxViews = Math.max(1, ...offers.map((offer) => offer.views_count))
  const maxClicks = Math.max(1, ...offers.map((offer) => offer.clicks_count))
  const maxAccepted = Math.max(1, ...offers.map((offer) => offer.accepted_count))
  const maxRevenue = Math.max(
    1,
    ...offers.map((offer) => Number(offer.revenue_generated) || 0),
  )

  const topOffers = [...offers]
    .sort(
      (a, b) =>
        (Number(b.revenue_generated) || 0) - (Number(a.revenue_generated) || 0),
    )
    .slice(0, 5)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Views x Clicks x Accepted
            </h3>
            <p className="text-sm text-slate-500">Comparativo por oferta.</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> Views
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-500" /> Clicks
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Accepted
            </span>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Offer #{offer.id}</span>
                <span>
                  {offer.views_count} views · {offer.clicks_count} clicks ·{' '}
                  {offer.accepted_count} accepted
                </span>
              </div>
              <div className="grid gap-2">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${(offer.views_count / maxViews) * 100}%` }}
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${(offer.clicks_count / maxClicks) * 100}%` }}
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(offer.accepted_count / maxAccepted) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Receita por oferta</h3>
        <p className="text-sm text-slate-500">Linha de receita gerada.</p>
        <div className="mt-6">
          <div className="flex items-end gap-2">
            {offers.map((offer) => {
              const revenue = Number(offer.revenue_generated) || 0
              const height = (revenue / maxRevenue) * 120

              return (
                <div key={offer.id} className="flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t-lg bg-indigo-500/80"
                    style={{ height: `${Math.max(6, height)}px` }}
                    title={formatCurrency(revenue)}
                  />
                  <span className="mt-2 text-xs text-slate-500">#{offer.id}</span>
                </div>
              )}
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Top offers</h3>
            <p className="text-sm text-slate-500">
              Ranking de performance por receita.
            </p>
          </div>
          <span className="text-xs text-slate-400">Top 5</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {topOffers.map((offer, index) => {
            const revenue = Number(offer.revenue_generated) || 0
            const ctr = calcRate(offer.clicks_count, offer.views_count)

            return (
              <div
                key={offer.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase text-slate-400">
                  #{index + 1} · Offer {offer.id}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formatCurrency(revenue)}
                </p>
                <p className="text-xs text-slate-500">CTR {Math.round(ctr * 100)}%</p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OffersCharts
