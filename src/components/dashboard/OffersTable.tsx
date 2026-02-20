import type { OfferAnalytics } from '../../lib/services/analytics/analytics.types'

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

const calcRate = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0

type TruncatedCellProps = {
  text: string
  fallback?: string
}

const TruncatedCell = ({ text, fallback }: TruncatedCellProps) => {
  const display = text || fallback || ''
  const needsTooltip = display.length > 20
  return (
    <div className="group relative max-w-[160px]">
      <span className="block truncate">{display}</span>
      {needsTooltip ? (
        <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg group-hover:block">
          {display}
        </div>
      ) : null}
    </div>
  )
}

type OffersTableProps = {
  offers: OfferAnalytics[]
}

const OffersTable = ({ offers }: OffersTableProps) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 px-6 py-4">
      <h3 className="text-base font-semibold text-slate-900">Detalhamento das ofertas</h3>
      <p className="text-sm text-slate-500">Comparativo completo por offer.</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-6 py-3 text-left font-medium">ID</th>
            <th className="px-6 py-3 text-left font-medium">Produto</th>
            <th className="px-6 py-3 text-left font-medium">Campanha</th>
            <th className="px-6 py-3 text-right font-medium">Views</th>
            <th className="px-6 py-3 text-right font-medium">Clicks</th>
            <th className="px-6 py-3 text-right font-medium">Accepted</th>
            <th className="px-6 py-3 text-right font-medium">Receita</th>
            <th className="px-6 py-3 text-right font-medium">CTR</th>
            <th className="px-6 py-3 text-right font-medium">Accept Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {offers.map((offer) => {
            const ctr = calcRate(offer.clicks_count, offer.views_count)
            const acceptRate = calcRate(offer.accepted_count, offer.clicks_count)
            const revenue = Number(offer.revenue_generated)

            return (
              <tr key={offer.id} className="text-slate-700">
                <td className="px-6 py-4 font-medium text-slate-900">#{offer.id}</td>
                <td className="px-6 py-4">
                  <TruncatedCell
                    text={offer.product_name ?? ''}
                    fallback={`#${offer.product_id}`}
                  />
                </td>
                <td className="px-6 py-4">
                  <TruncatedCell
                    text={offer.campaign_name ?? ''}
                    fallback={`#${offer.upsell_campaign_id}`}
                  />
                </td>
                <td className="px-6 py-4 text-right">{offer.views_count}</td>
                <td className="px-6 py-4 text-right">{offer.clicks_count}</td>
                <td className="px-6 py-4 text-right">{offer.accepted_count}</td>
                <td className="px-6 py-4 text-right">
                  {formatCurrency(Number.isNaN(revenue) ? 0 : revenue)}
                </td>
                <td className="px-6 py-4 text-right">{formatPercent(ctr)}</td>
                <td className="px-6 py-4 text-right">{formatPercent(acceptRate)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </div>
)

export default OffersTable
