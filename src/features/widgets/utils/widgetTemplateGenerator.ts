import type { WidgetConfig } from '../../../types/widget'
import { defaultWidgetVisualConfig, MOCK_WIDGET_CONTENT, type WidgetVisualConfig } from '../types/widgetTemplate'
import { layoutPresetDefinitions } from './layoutPresetDefinitions'

const esc = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const shadowMap: Record<WidgetVisualConfig['shadow'], string> = {
  none: 'none',
  sm: '0 2px 10px rgba(15,23,42,.12)',
  md: '0 10px 28px rgba(15,23,42,.18)',
  lg: '0 18px 44px rgba(15,23,42,.28)',
}

const variantStyles: Record<WidgetVisualConfig['variant'], {
  cardBackground: string
  bodyColor: string
  titleWeight: string
  titleTransform: string
  titleSpacing: string
  buttonRadius: string
  buttonWeight: string
  buttonTransform: string
  buttonSpacing: string
  badgeRadius: string
  badgeWeight: string
  badgeTransform: string
  badgeSpacing: string
}> = {
  modern: {
    cardBackground: 'var(--widget-bg)',
    bodyColor: 'var(--widget-text)',
    titleWeight: '700',
    titleTransform: 'none',
    titleSpacing: '-0.015em',
    buttonRadius: '12px',
    buttonWeight: '600',
    buttonTransform: 'none',
    buttonSpacing: 'normal',
    badgeRadius: '999px',
    badgeWeight: '700',
    badgeTransform: 'none',
    badgeSpacing: 'normal',
  },
  minimal: {
    cardBackground: 'var(--widget-bg)',
    bodyColor: '#64748b',
    titleWeight: '600',
    titleTransform: 'none',
    titleSpacing: '-0.01em',
    buttonRadius: '8px',
    buttonWeight: '500',
    buttonTransform: 'none',
    buttonSpacing: 'normal',
    badgeRadius: '8px',
    badgeWeight: '600',
    badgeTransform: 'none',
    badgeSpacing: 'normal',
  },
  premium: {
    cardBackground: 'linear-gradient(135deg,#020617,#0f172a,#18181b)',
    bodyColor: '#e2e8f0',
    titleWeight: '600',
    titleTransform: 'none',
    titleSpacing: '0.02em',
    buttonRadius: '999px',
    buttonWeight: '600',
    buttonTransform: 'uppercase',
    buttonSpacing: '0.04em',
    badgeRadius: '999px',
    badgeWeight: '700',
    badgeTransform: 'uppercase',
    badgeSpacing: '0.04em',
  },
  promotional: {
    cardBackground: 'linear-gradient(90deg,#fef3c7,#ffe4e6)',
    bodyColor: '#334155',
    titleWeight: '800',
    titleTransform: 'uppercase',
    titleSpacing: '0.03em',
    buttonRadius: '10px',
    buttonWeight: '800',
    buttonTransform: 'uppercase',
    buttonSpacing: '0.03em',
    badgeRadius: '10px',
    badgeWeight: '900',
    badgeTransform: 'uppercase',
    badgeSpacing: '0.04em',
  },
  glass: {
    cardBackground: 'linear-gradient(135deg, rgba(56,189,248,.25), rgba(99,102,241,.25))',
    bodyColor: 'rgba(255,255,255,.92)',
    titleWeight: '600',
    titleTransform: 'none',
    titleSpacing: 'normal',
    buttonRadius: '12px',
    buttonWeight: '600',
    buttonTransform: 'none',
    buttonSpacing: 'normal',
    badgeRadius: '999px',
    badgeWeight: '600',
    badgeTransform: 'none',
    badgeSpacing: 'normal',
  },
  bold: {
    cardBackground: '#0f172a',
    bodyColor: '#f1f5f9',
    titleWeight: '900',
    titleTransform: 'uppercase',
    titleSpacing: '0.03em',
    buttonRadius: '0',
    buttonWeight: '900',
    buttonTransform: 'uppercase',
    buttonSpacing: '0.05em',
    badgeRadius: '0',
    badgeWeight: '900',
    badgeTransform: 'uppercase',
    badgeSpacing: '0.05em',
  },
}

export const normalizeWidgetConfig = (config: WidgetConfig | null | undefined): WidgetVisualConfig => {
  const source = config?.attributes && typeof config.attributes === 'object' ? (config.attributes as Record<string, unknown>) : config && typeof config === 'object' ? ((config as unknown as Record<string, unknown>)) : {}
  const normalized: WidgetVisualConfig = {
    ...defaultWidgetVisualConfig,
    ...source,
  }

  if ('showMedia' in source === false && source.mediaType === 'none') normalized.showMedia = false
  if (typeof source.mediaWidth === 'number' && typeof source.mediaSize !== 'number') normalized.mediaSize = source.mediaWidth

  const forcedMedia = layoutPresetDefinitions[normalized.layout].forceMediaType
  if (forcedMedia) {
    normalized.mediaType = forcedMedia
    normalized.showMedia = forcedMedia !== 'none'
  }

  if (!normalized.showMedia) normalized.mediaType = 'none'
  if (normalized.mediaType === 'none') normalized.mediaClickableCta = false

  return normalized
}

const mediaBeforeLayouts = new Set<WidgetVisualConfig['layout']>([
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

const renderMediaHtml = (config: WidgetVisualConfig) => {
  if (!config.showMedia || config.mediaType === 'none') return ''

  const mediaContent = config.mediaType === 'video'
    ? '<div class="widget-template__media-placeholder widget-template__media-placeholder--video">▶ Vídeo demonstrativo</div>'
    : '<div class="widget-template__media-placeholder widget-template__media-placeholder--image">Imagem do template</div>'

  const media = `<div class="widget-template__media">${mediaContent}</div>`
  if (!config.mediaClickableCta) return media

  return `<a class="widget-template__media-link" href="#" aria-label="Mídia clicável como CTA">${media}</a>`
}

const renderContentHtml = (config: WidgetVisualConfig) => {
  if (config.layout === 'image-only') return ''
  const c = MOCK_WIDGET_CONTENT

  const acceptBtn = config.showButton ? `<button id="upse-accept" class="widget-template__button ${config.buttonFullWidth ? 'widget-template__button--full' : ''}">${esc(c.buttonText)}</button>` : ''
  const rejectBtn = config.showButton ? `<button id="upse-reject" class="widget-template__reject">${esc(c.rejectText)}</button>` : ''

  return `<div class="widget-template__content">
    ${config.showBadge ? `<span class="widget-template__badge">${esc(c.badgeText)}</span>` : ''}
    ${config.showTitle ? `<h3 class="widget-template__title">${esc(c.title)}</h3>` : ''}
    ${config.showSubtitle ? `<p class="widget-template__subtitle">${esc(c.subtitle)}</p>` : ''}
    ${config.showDescription ? `<p class="widget-template__description">${esc(c.description)}</p>` : ''}
    ${config.showComplementaryText ? `<p class="widget-template__extra">${esc(c.extraText)}</p>` : ''}
    ${acceptBtn || rejectBtn ? `<div class="widget-template__actions">${acceptBtn}${rejectBtn}</div>` : ''}
  </div>`
}

export const generateWidgetHtml = (config: WidgetVisualConfig) => {
  const media = renderMediaHtml(config)
  const content = renderContentHtml(config)
  const mediaBefore = mediaBeforeLayouts.has(config.layout)
  const closeBtn = `<button id="upse-close" class="widget-template__close" aria-label="Fechar">&times;</button>`

  return `<div class="widget-template widget-template--${config.layout} widget-template--${config.variant}">${closeBtn}${mediaBefore ? media : ''}${content}${mediaBefore ? '' : media}</div>`
}

const getFlexDirection = (layout: WidgetVisualConfig['layout']) => {
  switch (layout) {
    case 'media-right':
      return 'row-reverse'
    case 'media-top':
    case 'card-vertical':
    case 'video-text':
    case 'modal':
    case 'image-only':
    case 'image-button':
    case 'video-button':
      return 'column'
    case 'media-bottom':
      return 'column-reverse'
    default:
      return 'row'
  }
}

export const generateWidgetCss = (config: WidgetVisualConfig) => {
  const preset = layoutPresetDefinitions[config.layout]
  const variant = variantStyles[config.variant]
  const toastPadding = Math.max(14, Math.round(config.padding * 0.65))
  const mobileMediaWidth = preset.supportsMediaSize ? `${Math.min(58, Math.max(32, config.mediaSize))}%` : '100%'
  const desktopMediaWidth = preset.supportsMediaSize ? `${config.mediaSize}%` : '100%'

  // Mobile-first: base styles are for mobile, then scale up with min-width media query
  return `/* Mobile-first base styles */
.widget-template {
  --widget-bg: ${config.backgroundColor};
  --widget-text: ${config.textColor};
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  min-height: ${config.layout === 'toast' ? 90 : Math.round(config.minHeight * 0.75)}px;
  margin: 0 auto;
  padding: ${config.layout === 'toast' ? Math.round(toastPadding * 0.8) : Math.round(config.padding * 0.75)}px;
  border-radius: ${config.layout === 'banner' ? 999 : config.borderRadius}px;
  border: 1px solid ${config.borderColor};
  background: ${variant.cardBackground};
  color: ${variant.bodyColor};
  box-shadow: ${shadowMap[config.shadow]};
  overflow: hidden;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-sizing: border-box;
}
.widget-template__close {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.08);
  color: ${config.textColor};
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  z-index: 2;
  transition: background 0.15s;
}
.widget-template__close:hover {
  background: rgba(0, 0, 0, 0.15);
}
.widget-template__media {
  width: ${mobileMediaWidth};
  min-height: ${config.layout === 'toast' ? 60 : 120}px;
  border-radius: ${Math.max(config.borderRadius - 4, 8)}px;
  overflow: hidden;
  background: #e2e8f0;
}
.widget-template__media-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 120px;
  padding: 10px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}
.widget-template__media-placeholder--image {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  color: #334155;
}
.widget-template__media-placeholder--video {
  background: #0f172a;
  color: #fff;
}
.widget-template__media-link {
  display: block;
  text-decoration: none;
  color: inherit;
}
.widget-template__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 6px;
}
.widget-template__badge {
  width: max-content;
  padding: 3px 8px;
  border-radius: ${variant.badgeRadius};
  background: ${config.buttonColor};
  color: #fff;
  font-size: 10px;
  font-weight: ${variant.badgeWeight};
  text-transform: ${variant.badgeTransform};
  letter-spacing: ${variant.badgeSpacing};
}
.widget-template__title {
  margin: 0;
  font-size: 18px;
  font-weight: ${variant.titleWeight};
  text-transform: ${variant.titleTransform};
  letter-spacing: ${variant.titleSpacing};
  line-height: 1.25;
}
.widget-template__subtitle {
  margin: 0;
  font-size: 11px;
  opacity: 0.8;
}
.widget-template__description {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
}
.widget-template__extra {
  margin: 0;
  font-size: 11px;
  opacity: 0.75;
}
.widget-template__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}
.widget-template__button {
  width: 100%;
  max-width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: ${variant.buttonRadius};
  background: ${config.buttonColor};
  color: #fff;
  font-size: 12px;
  font-weight: ${variant.buttonWeight};
  text-transform: ${variant.buttonTransform};
  letter-spacing: ${variant.buttonSpacing};
  cursor: pointer;
  text-align: center;
}
.widget-template__button--full {
  width: 100%;
}
.widget-template__reject {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: ${variant.buttonRadius};
  background: transparent;
  color: ${variant.bodyColor};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.widget-template__reject:hover {
  opacity: 1;
}
.widget-template--modal {
  max-width: 88vw;
}
.widget-template--toast {
  max-width: 100%;
}
.widget-template--glass {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Desktop styles (min-width: 768px) */
@media (min-width: 768px) {
  .widget-template {
    flex-direction: ${getFlexDirection(config.layout)};
    gap: 16px;
    max-width: ${config.width}px;
    min-height: ${config.layout === 'toast' ? 110 : config.minHeight}px;
    padding: ${config.layout === 'toast' ? toastPadding : config.padding}px;
  }
  .widget-template__media {
    width: ${desktopMediaWidth};
    min-height: ${config.layout === 'toast' ? 72 : 140}px;
    border-radius: ${Math.max(config.borderRadius - 4, 10)}px;
  }
  .widget-template__media-placeholder {
    min-height: 140px;
    padding: 12px;
    font-size: 14px;
  }
  .widget-template__content {
    gap: 8px;
  }
  .widget-template__badge {
    padding: 4px 10px;
    font-size: 11px;
  }
  .widget-template__title {
    font-size: 24px;
    line-height: 1.2;
  }
  .widget-template__subtitle {
    font-size: 12px;
  }
  .widget-template__description {
    font-size: 14px;
  }
  .widget-template__extra {
    font-size: 12px;
  }
  .widget-template__actions {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
  .widget-template__button {
    width: max-content;
  }
  .widget-template__button--full {
    width: 100%;
  }
  .widget-template__reject {
    width: auto;
  }
  .widget-template--modal {
    max-width: min(${config.width}px, 88vw);
  }
  .widget-template--toast {
    max-width: 360px;
  }
}
`
}
