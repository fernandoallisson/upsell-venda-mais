import { defaultWidgetVisualConfig, type WidgetVisualConfig } from '../types/widgetTemplate'
import type { WidgetConfig } from '../../../types/widget'

const esc = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

export const normalizeWidgetConfig = (config: WidgetConfig | null | undefined): WidgetVisualConfig => {
  const source = config && typeof config === 'object' ? config : {}

  return {
    ...defaultWidgetVisualConfig,
    ...source,
  } as WidgetVisualConfig
}

const shadowMap: Record<WidgetVisualConfig['shadow'], string> = {
  none: 'none',
  sm: '0 1px 4px rgba(15,23,42,0.16)',
  md: '0 8px 24px rgba(15,23,42,0.2)',
  lg: '0 12px 32px rgba(15,23,42,0.26)',
}

export const generateWidgetCss = (config: WidgetVisualConfig) => {
  const direction = config.mediaPosition === 'top' || config.mediaPosition === 'bottom' ? 'column' : 'row'
  const reverse = config.mediaPosition === 'right' || config.mediaPosition === 'bottom' ? '-reverse' : ''

  return `.widget-template{display:flex;flex-direction:${direction}${reverse};align-items:center;gap:16px;width:100%;max-width:${config.width}px;min-height:${config.minHeight}px;margin:${config.margin}px auto;padding:${config.padding}px;background:${config.backgroundColor};color:${config.textColor};border:1px solid ${config.borderColor};border-radius:${config.borderRadius}px;opacity:${config.opacity / 100};box-shadow:${shadowMap[config.shadow]};backdrop-filter:${config.glass ? 'blur(10px)' : 'none'};text-align:${config.alignment};}
.widget-template__media{width:${config.mediaWidth}%;border-radius:${Math.max(config.borderRadius - 4, 8)}px;overflow:hidden;}
.widget-template__media img,.widget-template__media video{width:100%;height:100%;min-height:130px;object-fit:cover;display:block;}
.widget-template__content{width:${config.contentWidth}%;display:flex;flex-direction:column;gap:10px;}
.widget-template__badge{display:inline-flex;align-self:flex-start;padding:4px 10px;border-radius:999px;background:${config.buttonColor};color:#fff;font-size:11px;font-weight:700;}
.widget-template__title{margin:0;font-size:22px;font-weight:${config.highlightTitle ? 800 : 700};}
.widget-template__subtitle{margin:0;font-size:13px;opacity:0.85;}
.widget-template__description{margin:0;font-size:14px;line-height:1.5;opacity:0.95;}
.widget-template__extra{margin:0;font-size:12px;opacity:0.8;}
.widget-template__actions{display:flex;justify-content:${config.ctaPosition === 'left' ? 'flex-start' : config.ctaPosition === 'center' ? 'center' : 'flex-end'};}
.widget-template__button{background:${config.buttonColor};color:white;border:none;border-radius:10px;padding:10px 16px;font-weight:700;cursor:pointer;}`
}

export const generateWidgetHtml = (config: WidgetVisualConfig) => {
  const hasMedia = config.mediaType !== 'none' && config.layout !== 'text-only'
  const mediaTag = config.mediaType === 'video' ? 'video' : 'img'
  const mediaInner =
    mediaTag === 'video'
      ? `<video src="${esc(config.mediaUrl)}" controls muted playsinline></video>`
      : `<img src="${esc(config.mediaUrl)}" alt="${esc(config.title)}"/>`

  const mediaBlock = hasMedia ? `<div class="widget-template__media">${mediaInner}</div>` : ''
  const buttonBlock = config.showButton
    ? `<div class="widget-template__actions"><a href="${esc(config.buttonLink)}"><button class="widget-template__button">${esc(config.buttonText)}</button></a></div>`
    : ''

  return `<div class="widget-template">
  ${mediaBlock}
  <div class="widget-template__content">
    ${config.showBadge ? `<span class="widget-template__badge">${esc(config.badgeText)}</span>` : ''}
    <h3 class="widget-template__title">${esc(config.title)}</h3>
    <p class="widget-template__subtitle">${esc(config.subtitle)}</p>
    ${config.showDescription ? `<p class="widget-template__description">${esc(config.description)}</p>` : ''}
    ${config.showComplementaryText ? `<p class="widget-template__extra">${esc(config.extraText)}</p>` : ''}
    ${buttonBlock}
  </div>
</div>`
}
