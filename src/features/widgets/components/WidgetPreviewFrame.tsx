import type { ReactNode } from 'react'

type Props = {
  viewport: 'desktop' | 'mobile'
  children: ReactNode
  fullscreen?: boolean
}

const WidgetPreviewFrame = ({ viewport, children, fullscreen = false }: Props) => {
  if (viewport === 'mobile') {
    return (
      <div className={`mx-auto rounded-[2rem] border-8 border-slate-900 bg-slate-950 p-2 shadow-2xl ${fullscreen ? 'w-[360px]' : 'w-[280px]'}`}>
        <div className="mb-2 h-5 w-24 rounded-full bg-slate-800 mx-auto" />
        <div className="rounded-[1.4rem] bg-slate-100 p-3 min-h-[520px]">
          <div className="space-y-2 pb-3">
            <div className="h-2.5 w-1/3 rounded bg-slate-200" />
            <div className="h-2.5 w-2/3 rounded bg-slate-200" />
          </div>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-300 bg-white shadow-2xl">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-300" />
        <span className="h-3 w-3 rounded-full bg-amber-300" />
        <span className="h-3 w-3 rounded-full bg-emerald-300" />
      </div>
      <div className={`bg-slate-100 p-5 ${fullscreen ? 'min-h-[560px]' : 'min-h-[280px]'}`}>
        <div className="space-y-3 pb-4">
          <div className="h-3 w-1/4 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-200" />
        </div>
        {children}
      </div>
    </div>
  )
}

export default WidgetPreviewFrame
