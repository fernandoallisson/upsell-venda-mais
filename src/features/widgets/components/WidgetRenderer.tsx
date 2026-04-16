import type { ReactNode } from 'react'
import { MOCK_WIDGET_CONTENT, type WidgetVisualConfig } from '../types/widgetTemplate'
import { getWidgetComputedStyles, getWidgetLayoutDefinition, getWidgetVariantDefinition, type WidgetRenderMode } from '../utils/widgetRenderer'

type Props = {
  config: WidgetVisualConfig
  mode?: WidgetRenderMode
  viewport?: 'desktop' | 'mobile'
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

const WidgetRenderer = ({ config, mode = 'preview', viewport = 'desktop' }: Props) => {
  const layout = getWidgetLayoutDefinition(config.layout)
  const variant = getWidgetVariantDefinition(config.variant)
  const styles = getWidgetComputedStyles(config, mode, viewport)
  const showMedia = config.showMedia && config.mediaType !== 'none'

  const isClickableMedia = config.mediaClickableCta && showMedia
  const mediaStyleForCore = isClickableMedia
    ? { ...styles.mediaStyle, width: '100%' as const }
    : styles.mediaStyle

  const mediaCore = showMedia ? (
    <div className={`overflow-hidden bg-slate-200 ${config.mediaType === 'video' ? 'bg-slate-900' : 'bg-slate-300'}`} style={mediaStyleForCore}>
      <div
        className={`flex h-full min-h-[120px] items-center justify-center font-semibold ${config.mediaType === 'video' ? 'text-white' : 'text-slate-700'}`}
      >
        {config.mediaType === 'video' ? '▶ Vídeo mockado' : 'Imagem mockada'}
      </div>
    </div>
  ) : null

  const Media: ReactNode = isClickableMedia ? (
    <a href="#" onClick={(event) => event.preventDefault()} className="block shrink-0 cursor-pointer" style={{ width: styles.mediaStyle.width }} aria-label="Mídia clicável como CTA">
      {mediaCore}
    </a>
  ) : (
    mediaCore
  )

  const mediaBefore = mediaBeforeLayouts.has(config.layout)

  return (
    <div style={styles.surfaceStyle} className={`${variant.cardClass} ${layout.containerClass} relative flex max-w-full gap-4 overflow-hidden ${config.layout === 'modal' ? 'mx-auto' : ''}`}>
      <button
        id="upse-close"
        type="button"
        onClick={(e) => e.preventDefault()}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border-none bg-black/10 text-lg leading-none hover:bg-black/20"
        style={{ color: config.textColor }}
        aria-label="Fechar"
      >
        &times;
      </button>

      {mediaBefore ? Media : null}

      {config.layout !== 'image-only' ? (
        <div className={`flex min-w-0 flex-1 flex-col gap-2 ${variant.bodyClass}`}>
          {config.showBadge ? <span className={`w-fit bg-black/80 px-3 py-1 text-[11px] text-white ${variant.badgeClass}`}>{MOCK_WIDGET_CONTENT.badgeText}</span> : null}
          {config.showTitle ? <h3 className={`m-0 break-words text-xl ${variant.titleClass}`}>{MOCK_WIDGET_CONTENT.title}</h3> : null}
          {config.showSubtitle ? <p className="m-0 break-words text-xs opacity-80">{MOCK_WIDGET_CONTENT.subtitle}</p> : null}
          {config.showDescription ? <p className="m-0 break-words text-sm">{MOCK_WIDGET_CONTENT.description}</p> : null}
          {config.showComplementaryText ? <p className="m-0 break-words text-xs opacity-75">{MOCK_WIDGET_CONTENT.extraText}</p> : null}
          {config.showButton ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button id="upse-accept" type="button" className={`max-w-full px-4 py-2 text-xs text-white ${variant.buttonClass}`} style={styles.buttonStyle}>
                {MOCK_WIDGET_CONTENT.buttonText}
              </button>
              <button id="upse-reject" type="button" className="border-none bg-transparent px-3 py-1.5 text-[11px] opacity-70 hover:opacity-100" style={{ color: variant.bodyClass.includes('dark') ? '#f1f5f9' : config.textColor }}>
                {MOCK_WIDGET_CONTENT.rejectText}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!mediaBefore ? Media : null}
    </div>
  )
}

export default WidgetRenderer
