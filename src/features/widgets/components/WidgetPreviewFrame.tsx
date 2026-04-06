import type { ReactNode } from 'react'

type Props = {
  viewport: 'desktop' | 'mobile'
  children: ReactNode
  fullscreen?: boolean
}

/** Fixed preview dimensions */
const FRAME = {
  desktop: { width: 683, height: 512 },
  mobile: { width: 207, height: 448 },
} as const

const WidgetPreviewFrame = ({ viewport, children, fullscreen = false }: Props) => {
  const frame = fullscreen
    ? viewport === 'mobile'
      ? { width: 360, height: 640 }
      : { width: 1024, height: 680 }
    : FRAME[viewport]

  if (viewport === 'mobile') {
    return (
      <div
        className="mx-auto flex-shrink-0 rounded-[2rem] border-8 border-slate-900 bg-slate-950 shadow-2xl"
        style={{ width: frame.width + 16 }}
      >
        <div className="my-2 h-4 w-12 rounded-full bg-slate-800 mx-auto" />
        <div
          className="overflow-hidden rounded-[1.2rem] bg-slate-100"
          style={{ width: frame.width, height: frame.height }}
        >
          <div className="flex h-full w-full flex-col">
            <div className="space-y-1.5 px-3 pt-3 pb-2">
              <div className="h-2 w-1/3 rounded bg-slate-200" />
              <div className="h-2 w-2/3 rounded bg-slate-200" />
            </div>
            <div className="flex flex-1 items-start justify-center overflow-auto px-2 pb-2">
              <div className="w-full origin-top" style={{ transform: `scale(${Math.min(1, frame.width / 520)})` }}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="mx-auto flex-shrink-0 rounded-2xl border border-slate-300 bg-white shadow-2xl"
      style={{ width: frame.width }}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
      </div>
      <div
        className="overflow-auto bg-slate-100 p-4"
        style={{ height: frame.height }}
      >
        <div className="space-y-2 pb-3">
          <div className="h-2.5 w-1/4 rounded bg-slate-200" />
          <div className="h-2.5 w-2/3 rounded bg-slate-200" />
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  )
}

export default WidgetPreviewFrame
