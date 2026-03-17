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

export const normalizeWidgetConfig = (config: WidgetConfig | null | undefined): WidgetVisualConfig => {
  const source = config && typeof config === 'object' ? (config as Record<string, unknown>) : {}
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

  return normalized
}

const renderMediaHtml = (config: WidgetVisualConfig) => {
  if (!config.showMedia || config.mediaType === 'none') return ''
  if (config.mediaType === 'video') return '<div class="widget-template__media"><div class="widget-template__video">▶ Vídeo demonstrativo</div></div>'
  return '<div class="widget-template__media"><div class="widget-template__image">Imagem do template</div></div>'
}

const renderContentHtml = (config: WidgetVisualConfig) => {
  const c = MOCK_WIDGET_CONTENT
  return `<div class="widget-template__content">
    ${config.showBadge ? `<span class="widget-template__badge">${esc(c.badgeText)}</span>` : ''}
    ${config.showTitle ? `<h3 class="widget-template__title">${esc(c.title)}</h3>` : ''}
    ${config.showSubtitle ? `<p class="widget-template__subtitle">${esc(c.subtitle)}</p>` : ''}
    ${config.showDescription ? `<p class="widget-template__description">${esc(c.description)}</p>` : ''}
    ${config.showComplementaryText ? `<p class="widget-template__extra">${esc(c.extraText)}</p>` : ''}
    ${config.showButton ? `<button class="widget-template__button">${esc(c.buttonText)}</button>` : ''}
  </div>`
}

export const generateWidgetHtml = (config: WidgetVisualConfig) => {
  const media = renderMediaHtml(config)
  const content = renderContentHtml(config)
  if (config.layout === 'image-button' || config.layout === 'video-button') return `<div class="widget-template widget-template--hero">${media}${config.showButton ? `<button class="widget-template__button widget-template__button--overlay">${MOCK_WIDGET_CONTENT.buttonText}</button>` : ''}${content}</div>`
  if (config.layout === 'image-only') return `<div class="widget-template widget-template--image-only">${media}${config.showButton ? `<button class="widget-template__button">${MOCK_WIDGET_CONTENT.buttonText}</button>` : ''}</div>`
  return `<div class="widget-template widget-template--${config.layout}">${media}${content}</div>`
}

export const generateWidgetCss = (config: WidgetVisualConfig) => {
  const preset = layoutPresetDefinitions[config.layout]
  const direction = config.layout === 'media-right' ? 'row-reverse' : config.layout === 'media-top' ? 'column' : config.layout === 'media-bottom' ? 'column-reverse' : 'row'

  return `.widget-template{display:flex;flex-direction:${direction};gap:16px;max-width:${config.width}px;min-height:${config.minHeight}px;padding:${config.padding}px;border-radius:${config.borderRadius}px;border:1px solid ${config.borderColor};background:${config.backgroundColor};color:${config.textColor};box-shadow:${shadowMap[config.shadow]};}
.widget-template__media{width:${preset.supportsMediaSize ? `${config.mediaSize}%` : '100%'};min-height:140px;border-radius:${Math.max(config.borderRadius - 4, 10)}px;overflow:hidden;}
.widget-template__image,.widget-template__video{display:flex;align-items:center;justify-content:center;height:100%;min-height:140px;background:linear-gradient(135deg,#cbd5e1,#94a3b8);color:#0f172a;font-weight:700;}
.widget-template__content{display:flex;flex-direction:column;gap:10px;flex:1;}
.widget-template__badge{width:max-content;padding:4px 10px;border-radius:999px;background:${config.buttonColor};color:white;font-size:11px;font-weight:700;}
.widget-template__title{margin:0;font-size:24px;}
.widget-template__subtitle,.widget-template__description,.widget-template__extra{margin:0;}
.widget-template__button{width:max-content;padding:10px 16px;border-radius:10px;border:none;background:${config.buttonColor};color:#fff;font-weight:700;}
.widget-template--toast{max-width:360px;min-height:110px;padding:${Math.max(14, Math.round(config.padding * 0.65))}px;}
.widget-template--banner{border-radius:999px;}
.widget-template--modal{max-width:min(${config.width}px,88vw);}`
}
