import WidgetLivePreview from './WidgetLivePreview'
import WidgetStatusBadge from './WidgetStatusBadge'
import { normalizeWidgetConfig } from '../utils/widgetTemplateGenerator'
import type { Widget } from '../../../types/widget'

type Props = {
  widget: Widget
}

const WidgetCardPreview = ({ widget }: Props) => {
  const config = normalizeWidgetConfig(widget.config)

  return (
    <div className="space-y-2">
      <WidgetLivePreview config={config} compact />
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs text-slate-500">{config.layout} • {config.variant}</p>
        <WidgetStatusBadge active={widget.is_active} />
      </div>
    </div>
  )
}

export default WidgetCardPreview
