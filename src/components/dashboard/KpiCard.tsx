import type { ReactNode } from 'react'

type KpiCardProps = {
  title: string
  value: string
  icon: ReactNode
  helper?: string
}

const KpiCard = ({ title, value, icon, helper }: KpiCardProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        {helper ? <p className="mt-1 text-xs text-slate-400">{helper}</p> : null}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>
    </div>
  </div>
)

export default KpiCard
