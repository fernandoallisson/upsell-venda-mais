import type { CSSProperties } from 'react'
import { MOCK_WIDGET_CONTENT, type WidgetVisualConfig } from '../types/widgetTemplate'
import { layoutPresetDefinitions } from '../utils/layoutPresetDefinitions'
import { styleVariantDefinitions } from '../utils/styleVariantDefinitions'

type Props = {
  config: WidgetVisualConfig
  compact?: boolean
  viewport?: 'desktop' | 'mobile'
}

const shadowMap: Record<WidgetVisualConfig['shadow'], string> = {
  none: 'none',
  sm: '0 2px 10px rgba(15,23,42,.12)',
  md: '0 10px 28px rgba(15,23,42,.18)',
  lg: '0 18px 44px rgba(15,23,42,.28)',
}

const WidgetLivePreview = ({ config, compact = false, viewport = 'desktop' }: Props) => {
  const layout = layoutPresetDefinitions[config.layout]
  const variant = styleVariantDefinitions[config.variant]
  const showMedia = config.showMedia && config.mediaType !== 'none'

  const surfaceStyle: CSSProperties = {
    width: '100%',
    maxWidth: compact ? 360 : viewport === 'mobile' ? 360 : config.width,
    minHeight: compact ? 160 : config.layout === 'toast' ? 110 : config.minHeight,
    margin: '0 auto',
    borderRadius: config.layout === 'banner' ? 999 : config.borderRadius,
    border: `1px solid ${config.borderColor}`,
    boxShadow: shadowMap[config.shadow],
    padding: config.layout === 'toast' ? Math.max(14, Math.round(config.padding * 0.65)) : compact ? Math.min(config.padding, 16) : config.padding,
    background: config.variant === 'glass' ? 'linear-gradient(135deg, rgba(56,189,248,.25), rgba(99,102,241,.25))' : config.backgroundColor,
    color: config.textColor,
  }

  const mediaStyle: CSSProperties = {
    width: layout.supportsMediaSize ? `${Math.min(70, Math.max(20, config.mediaSize))}%` : '100%',
    minHeight: config.layout === 'toast' ? 72 : 140,
    borderRadius: Math.max(config.borderRadius - 4, 10),
  }

  const Media = showMedia ? (
    <div style={mediaStyle} className="overflow-hidden bg-slate-200">
      <div className={`flex h-full min-h-[120px] items-center justify-center font-semibold ${config.mediaType === 'video' ? 'bg-slate-900 text-white' : 'bg-slate-300 text-slate-700'}`}>
        {config.mediaType === 'video' ? '▶ Vídeo mockado' : 'Imagem mockada'}
      </div>
    </div>
  ) : null

  const mediaBefore = ['media-left', 'media-top', 'card-horizontal', 'card-vertical', 'banner', 'modal', 'toast', 'promo-block', 'video-text', 'image-only', 'image-button', 'video-button'].includes(config.layout)

  return (
    <div style={surfaceStyle} className={`${variant.cardClass} ${layout.containerClass} flex gap-4 ${config.layout === 'modal' ? 'mx-auto max-w-2xl' : ''}`}>
      {mediaBefore ? Media : null}

      {config.layout !== 'image-only' ? (
        <div className={`flex flex-1 flex-col gap-2 ${variant.bodyClass}`}>
          {config.showBadge ? <span className={`w-fit bg-black/80 px-3 py-1 text-[11px] text-white ${variant.badgeClass}`}>{MOCK_WIDGET_CONTENT.badgeText}</span> : null}
          {config.showTitle ? <h3 className={`m-0 text-xl ${variant.titleClass}`}>{MOCK_WIDGET_CONTENT.title}</h3> : null}
          {config.showSubtitle ? <p className="m-0 text-xs opacity-80">{MOCK_WIDGET_CONTENT.subtitle}</p> : null}
          {config.showDescription ? <p className="m-0 text-sm">{MOCK_WIDGET_CONTENT.description}</p> : null}
          {config.showComplementaryText ? <p className="m-0 text-xs opacity-75">{MOCK_WIDGET_CONTENT.extraText}</p> : null}
          {config.showButton ? (
            <button type="button" className={`mt-2 w-fit px-4 py-2 text-xs text-white ${variant.buttonClass}`} style={{ backgroundColor: config.buttonColor }}>
              {MOCK_WIDGET_CONTENT.buttonText}
            </button>
          ) : null}
        </div>
      ) : null}

      {!mediaBefore ? Media : null}
    </div>
  )
}

export default WidgetLivePreview
