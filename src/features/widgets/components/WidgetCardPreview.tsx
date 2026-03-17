import WidgetHtmlPreview from './WidgetHtmlPreview'
import { normalizeWidgetConfig } from '../utils/widgetTemplateGenerator'
import type { Widget } from '../../../types/widget'

type Props = {
  widget: Widget
}

const WidgetCardPreview = ({ widget }: Props) => {
  const config = normalizeWidgetConfig(widget.config)

  return (
    <div className="space-y-2 rounded-xl bg-slate-100 p-3">
      <WidgetHtmlPreview html={widget.html} css={widget.css} compact />
      <p className="truncate text-xs text-slate-500">{config.layout} • {config.variant}</p>
    </div>
  )
}

export default WidgetCardPreview
