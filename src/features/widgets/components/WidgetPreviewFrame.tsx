import type { ReactNode } from 'react'

type Props = {
  viewport: 'desktop' | 'mobile'
  children: ReactNode
  fullscreen?: boolean
  compactChrome?: boolean
}

const FRAME = {
  desktop: { width: 820, height: 560 },
  mobile: { width: 320, height: 560 },
} as const

const WidgetPreviewFrame = ({ viewport, children, fullscreen = false, compactChrome = false }: Props) => {
  const frame = fullscreen
    ? viewport === 'mobile'
      ? { width: 360, height: 640 }
      : { width: 1080, height: 720 }
    : FRAME[viewport]

  if (viewport === 'mobile') {
    return (
      <div
        className="mx-auto flex max-h-full flex-shrink-0 flex-col rounded-[1.75rem] border-[7px] border-slate-900 bg-slate-950 shadow-2xl"
        style={{ width: frame.width + 14, maxWidth: '100%' }}
      >
        <div className="mx-auto my-2 h-3 w-12 shrink-0 rounded-full bg-slate-800" />
        <div
          className="min-h-0 overflow-hidden rounded-[1.1rem] bg-slate-100"
          style={{ width: frame.width, maxWidth: '100%', height: frame.height }}
        >
          <div className="flex h-full w-full flex-col">
            {!compactChrome ? (
              <div className="shrink-0 space-y-1.5 px-3 pb-2 pt-3">
                <div className="h-2 w-1/3 rounded bg-slate-200" />
                <div className="h-2 w-2/3 rounded bg-slate-200" />
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-hidden p-2">
              <div className="h-full w-full">
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
      className="mx-auto flex max-h-full flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl"
      style={{ width: frame.width, maxWidth: '100%' }}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <div className="ml-3 h-6 flex-1 rounded-md bg-slate-100" />
      </div>
      <div
        className="min-h-0 overflow-hidden bg-slate-100 p-4"
        style={{ height: frame.height }}
      >
        {!compactChrome ? (
          <div className="space-y-2 pb-3">
            <div className="h-2.5 w-1/4 rounded bg-slate-200" />
            <div className="h-2.5 w-2/3 rounded bg-slate-200" />
          </div>
        ) : null}
        <div className="h-full min-h-[320px] w-full">
          {children}
        </div>
      </div>
    </div>
  )
}

export default WidgetPreviewFrame
