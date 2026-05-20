import { useEffect, useRef } from 'react'

type Props = {
  html: string
  css: string
  compact?: boolean
  allowScripts?: boolean
  fill?: boolean
}

const WidgetHtmlPreview = ({ html, css, compact = false, allowScripts = false, fill = false }: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument
    if (!doc) return

    doc.open()
    doc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  html, body { width: 100%; min-height: 100%; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; padding: 12px; overflow: auto; }
  ${css}
  html, body { width: 100%; min-height: 0 !important; height: 100%; background: transparent !important; }
  body { margin: 0 !important; padding: 12px !important; overflow: auto; }
  :where(.hero, .overlay, .banner, .popup, .card, .offer-box, .showcase, .cd-section, .vagas-box, .progress-card, .prize-card, .dep-card, .testimonials, .urgency-wrap, .flash-banner) {
    width: min(100%, 600px) !important;
    max-width: 600px !important;
    min-height: 0 !important;
    height: auto !important;
  }
  :where(.hero) { padding: 24px 20px !important; border-radius: 20px !important; }
  :where(.overlay) { position: relative !important; inset: auto !important; padding: 0 !important; background: transparent !important; backdrop-filter: none !important; }
  :where(.banner, .flash-banner) { position: relative !important; inset: auto !important; border-radius: 16px !important; flex-wrap: wrap !important; }
</style>
</head>
<body>${html}</body>
</html>`)
    doc.close()
  }, [html, css])

  if (!html && !css) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-slate-100 p-4 text-xs text-slate-400">
        Sem HTML/CSS gerado
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      title="Widget preview"
      sandbox={allowScripts ? 'allow-same-origin allow-scripts' : 'allow-same-origin'}
      className={`w-full rounded-xl border-0 bg-white ${fill ? 'h-full min-h-[260px]' : compact ? 'h-[180px]' : 'h-[340px]'}`}
    />
  )
}

export default WidgetHtmlPreview
