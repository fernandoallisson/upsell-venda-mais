import type { CSSProperties } from 'react'
import type { WidgetVisualConfig } from '../types/widgetTemplate'

type Props = {
  config: WidgetVisualConfig
  compact?: boolean
}

const shadowMap: Record<WidgetVisualConfig['shadow'], string> = {
  none: 'none',
  sm: '0 1px 4px rgba(15,23,42,0.16)',
  md: '0 8px 24px rgba(15,23,42,0.2)',
  lg: '0 12px 32px rgba(15,23,42,0.26)',
}

const WidgetLivePreview = ({ config, compact = false }: Props) => {
  const isVertical = config.mediaPosition === 'top' || config.mediaPosition === 'bottom'
  const reverse = config.mediaPosition === 'right' || config.mediaPosition === 'bottom'

  const wrapperStyle: CSSProperties = {
    width: '100%',
    maxWidth: compact ? 360 : config.width,
    minHeight: compact ? 180 : config.minHeight,
    margin: '0 auto',
    backgroundColor: config.backgroundColor,
    color: config.textColor,
    border: `1px solid ${config.borderColor}`,
    borderRadius: config.borderRadius,
    padding: compact ? Math.min(config.padding, 14) : config.padding,
    opacity: config.opacity / 100,
    boxShadow: shadowMap[config.shadow],
    backdropFilter: config.glass ? 'blur(10px)' : 'none',
    display: 'flex',
    flexDirection: `${isVertical ? 'column' : 'row'}${reverse ? '-reverse' : ''}` as CSSProperties['flexDirection'],
    gap: compact ? 10 : 16,
    alignItems: 'center',
    textAlign: config.alignment,
  }

  const mediaStyle: CSSProperties = {
    width: `${compact ? Math.min(config.mediaWidth, 45) : config.mediaWidth}%`,
    borderRadius: Math.max(config.borderRadius - 4, 8),
    overflow: 'hidden',
  }

  const contentStyle: CSSProperties = {
    width: `${compact ? 100 - Math.min(config.mediaWidth, 45) : config.contentWidth}%`,
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? 6 : 10,
  }

  return (
    <div style={wrapperStyle}>
      {config.mediaType !== 'none' && config.layout !== 'text-only' ? (
        <div style={mediaStyle}>
          {config.mediaType === 'video' ? (
            <video src={config.mediaUrl} controls muted className="h-full min-h-[120px] w-full object-cover" />
          ) : (
            <img src={config.mediaUrl} alt={config.title} className="h-full min-h-[120px] w-full object-cover" />
          )}
        </div>
      ) : null}

      <div style={contentStyle}>
        {config.showBadge ? (
          <span className="inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ background: config.buttonColor }}>
            {config.badgeText}
          </span>
        ) : null}
        <h3 className={`m-0 ${compact ? 'text-base' : 'text-2xl'} ${config.highlightTitle ? 'font-extrabold' : 'font-bold'}`}>{config.title}</h3>
        <p className="m-0 text-xs opacity-80">{config.subtitle}</p>
        {config.showDescription ? <p className={`m-0 ${compact ? 'text-xs' : 'text-sm'} opacity-95`}>{config.description}</p> : null}
        {config.showComplementaryText ? <p className="m-0 text-xs opacity-80">{config.extraText}</p> : null}
        {config.showButton ? (
          <div className={`flex ${config.ctaPosition === 'left' ? 'justify-start' : config.ctaPosition === 'center' ? 'justify-center' : 'justify-end'}`}>
            <button type="button" className="rounded-lg px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: config.buttonColor }}>
              {config.buttonText}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default WidgetLivePreview
