import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type Props = {
  icon?: React.ReactNode
  badge?: React.ReactNode
  number?: number
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

const CollapsibleSection = ({
  icon,
  badge,
  number,
  title,
  defaultOpen = true,
  children,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-slate-50 rounded-2xl"
      >
        <div className="flex items-center gap-2">
          {number !== undefined ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {number}
            </span>
          ) : (
            icon && <span className="text-slate-400">{icon}</span>
          )}
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          {badge && <span className="ml-1">{badge}</span>}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && <div className="px-6 pb-6">{children}</div>}
    </section>
  )
}

export default CollapsibleSection
