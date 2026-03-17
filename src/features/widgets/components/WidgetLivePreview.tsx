import type { WidgetVisualConfig } from '../types/widgetTemplate'
import WidgetRenderer from './WidgetRenderer'

type Props = {
  config: WidgetVisualConfig
  compact?: boolean
  viewport?: 'desktop' | 'mobile'
}

const WidgetLivePreview = ({ config, compact = false, viewport = 'desktop' }: Props) => (
  <WidgetRenderer config={config} mode={compact ? 'thumbnail' : 'preview'} viewport={viewport} />
)

export default WidgetLivePreview
