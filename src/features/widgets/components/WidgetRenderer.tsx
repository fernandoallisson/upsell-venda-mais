import type { ReactNode } from 'react'
import { MOCK_WIDGET_CONTENT, type WidgetVisualConfig } from '../types/widgetTemplate'
import { getWidgetComputedStyles, getWidgetLayoutDefinition, getWidgetVariantDefinition, type WidgetRenderMode } from '../utils/widgetRenderer'

type Props = {
  config: WidgetVisualConfig
  mode?: WidgetRenderMode
}

const mediaBeforeLayouts = new Set([
  'media-left',
  'media-top',
  'card-horizontal',
  'card-vertical',
  'banner',
  'modal',
  'toast',
  'promo-block',
  'video-text',
  'image-only',
  'image-button',
  'video-button',
])

const WidgetRenderer = ({ config, mode = 'preview' }: Props) => {
  const layout = getWidgetLayoutDefinition(config.layout)
  const variant = getWidgetVariantDefinition(config.variant)
  const styles = getWidgetComputedStyles(config, mode)
  const showMedia = config.showMedia && config.mediaType !== 'none'

  const mediaCore = showMedia ? (
    <div style={styles.mediaStyle} className="overflow-hidden bg-slate-200">
      <div
        className={`flex h-full min-h-[120px] items-center justify-center font-semibold ${config.mediaType === 'video' ? 'bg-slate-900 text-white' : 'bg-slate-300 text-slate-700'}`}
      >
        {config.mediaType === 'video' ? '▶ Vídeo mockado' : 'Imagem mockada'}
      </div>
    </div>
  ) : null

  const Media: ReactNode = config.mediaClickableCta && showMedia ? (
    <a href="#" onClick={(event) => event.preventDefault()} className="block cursor-pointer" aria-label="Mídia clicável como CTA">
      {mediaCore}
    </a>
  ) : (
    mediaCore
  )

  const mediaBefore = mediaBeforeLayouts.has(config.layout)

  return (
    <div style={styles.surfaceStyle} className={`${variant.cardClass} ${layout.containerClass} flex gap-4 ${config.layout === 'modal' ? 'mx-auto' : ''}`}>
      {mediaBefore ? Media : null}

      {config.layout !== 'image-only' ? (
        <div className={`flex flex-1 flex-col gap-2 ${variant.bodyClass}`}>
          {config.showBadge ? <span className={`w-fit bg-black/80 px-3 py-1 text-[11px] text-white ${variant.badgeClass}`}>{MOCK_WIDGET_CONTENT.badgeText}</span> : null}
          {config.showTitle ? <h3 className={`m-0 text-xl ${variant.titleClass}`}>{MOCK_WIDGET_CONTENT.title}</h3> : null}
          {config.showSubtitle ? <p className="m-0 text-xs opacity-80">{MOCK_WIDGET_CONTENT.subtitle}</p> : null}
          {config.showDescription ? <p className="m-0 text-sm">{MOCK_WIDGET_CONTENT.description}</p> : null}
          {config.showComplementaryText ? <p className="m-0 text-xs opacity-75">{MOCK_WIDGET_CONTENT.extraText}</p> : null}
          {config.showButton ? (
            <button type="button" className={`mt-2 px-4 py-2 text-xs text-white ${variant.buttonClass}`} style={styles.buttonStyle}>
              {MOCK_WIDGET_CONTENT.buttonText}
            </button>
          ) : null}
        </div>
      ) : null}

      {!mediaBefore ? Media : null}
    </div>
  )
}

export default WidgetRenderer
