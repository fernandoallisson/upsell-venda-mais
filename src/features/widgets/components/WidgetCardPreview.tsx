import WidgetHtmlPreview from './WidgetHtmlPreview'
import { normalizeWidgetConfig } from '../utils/widgetTemplateGenerator'
import { isHtmlWidgetTemplateConfig } from '../utils/htmlWidgetTemplateGenerator'
import type { Widget } from '../../../types/widget'

type Props = {
  widget: Widget
}

const WidgetCardPreview = ({ widget }: Props) => {
  const config = normalizeWidgetConfig(widget.config)
  const htmlTemplateConfig = isHtmlWidgetTemplateConfig(widget.config?.attributes)
    ? widget.config.attributes
    : null

  return (
    <div className="space-y-2 rounded-xl bg-slate-100 p-3">
      <WidgetHtmlPreview html={widget.html} css={widget.css} compact allowScripts={Boolean(htmlTemplateConfig?.supportsScript)} />
      <p className="truncate text-xs text-slate-500">
        {htmlTemplateConfig ? `${htmlTemplateConfig.templateCategory} • HTML preservado` : `${config.layout} • ${config.variant}`}
      </p>
    </div>
  )
}

export default WidgetCardPreview
