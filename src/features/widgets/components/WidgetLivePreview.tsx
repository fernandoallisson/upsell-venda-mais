import type { WidgetVisualConfig } from '../types/widgetTemplate'
import WidgetRenderer from './WidgetRenderer'

type Props = {
  config: WidgetVisualConfig
  compact?: boolean
}

const WidgetLivePreview = ({ config, compact = false }: Props) => (
  <WidgetRenderer config={config} mode={compact ? 'thumbnail' : 'preview'} />
)

export default WidgetLivePreview
