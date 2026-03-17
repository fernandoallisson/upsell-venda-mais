import { useEffect, useRef } from 'react'

type Props = {
  html: string
  css: string
  compact?: boolean
}

const WidgetHtmlPreview = ({ html, css, compact = false }: Props) => {
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
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; padding: 8px; }
  ${css}
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
      sandbox="allow-same-origin"
      className={`w-full border-0 rounded-xl bg-white ${compact ? 'h-[160px]' : 'h-[300px]'}`}
    />
  )
}

export default WidgetHtmlPreview
