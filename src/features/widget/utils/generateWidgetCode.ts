import { SHADOW_MAP } from '../constants'
import type { WidgetFormState } from '../types'
import { isVideoUrl } from './widgetMedia'

const esc = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const css = (lines: string[]) => lines.filter(Boolean).join('\n')

/** Convert a px value to a responsive clamp() using vw (calibrated at 1440px viewport) */
const rVw = (px: number): string => {
  const vw = +(px / 14.4).toFixed(2)
  const min = Math.round(px * 0.7)
  const max = Math.round(px * 1.2)
  return `clamp(${min}px, ${vw}vw, ${max}px)`
}

/** Convert a px value to a responsive clamp() using vh (calibrated at 900px viewport) */
const rVh = (px: number): string => {
  const vh = +(px / 9).toFixed(2)
  const min = Math.round(px * 0.65)
  const max = Math.round(px * 1.25)
  return `clamp(${min}px, ${vh}vh, ${max}px)`
}

/** Convert a font-size px value to a responsive clamp() */
const rFont = (px: number): string => {
  const vw = +(px / 14.4).toFixed(2)
  const min = Math.max(10, Math.round(px * 0.8))
  const max = Math.round(px * 1.15)
  return `clamp(${min}px, ${vw}vw, ${max}px)`
}

const ctaAttrs = (form: WidgetFormState) => {
  const href = form.cta_link?.trim() || '#'
  const target = form.cta_new_tab ? ' target="_blank" rel="noopener noreferrer"' : ''
  return `href="${esc(href)}"${target}`
}

const renderMedia = (form: WidgetFormState) => {
  if (!form.media_url || form.layout.imagePosition === 'none') return ''

  if (isVideoUrl(form.media_url)) {
    return `  <a class="upsell-widget__media-link" ${ctaAttrs(form)}><video class="upsell-widget__image" src="${esc(form.media_url)}" muted playsinline preload="metadata"></video></a>`
  }

  return `  <a class="upsell-widget__media-link" ${ctaAttrs(form)}><img class="upsell-widget__image" src="${esc(form.media_url)}" alt="Oferta" /></a>`
}

function baseContainerCss(form: WidgetFormState, extra: string[] = []): string[] {
  const { colors, spacing, layout } = form
  const shadow = SHADOW_MAP[layout.shadowIntensity] ?? 'none'

  return [
    '.upsell-widget {',
    `  background-color: ${colors.bg};`,
    `  border-radius: ${rVw(spacing.borderRadius)};`,
    layout.borderWidth > 0 ? `  border: ${layout.borderWidth}px solid ${colors.border};` : '',
    shadow !== 'none' ? `  box-shadow: ${shadow};` : '',
    '  overflow: hidden;',
    '  font-family: inherit;',
    '  box-sizing: border-box;',
    '  width: 100%;',
    '  max-width: 100%;',
    ...extra,
    '}',
  ]
}

const sharedCss = (form: WidgetFormState) => [
  `.upsell-widget__media-link { display:block; text-decoration:none; color:inherit; }`,
  `.upsell-widget__badge { display:inline-flex; align-items:center; margin-bottom:${rVw(10)}; border-radius:999px; padding:${rVw(4)} ${rVw(10)}; background:${form.colors.accent}; color:${form.colors.buttonText}; font-size:${rFont(11)}; font-weight:700; }`,
  `.upsell-widget__subtitle { margin:${rVw(6)} 0 0; line-height:1.4; opacity:.65; color:${form.colors.text}; font-size:${rFont(12)}; }`,
  `.upsell-widget__close { margin-left:${rVw(12)}; border:none; background:transparent; color:${form.colors.text}; opacity:.45; font-size:${rFont(20)}; line-height:1; cursor:pointer; padding:0; }`,
]

const generateClassicCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  const hasImage = layout.imagePosition !== 'none'

  return css([
    ...baseContainerCss(form),
    ...sharedCss(form),
    hasImage ? `.upsell-widget__image { display:block; width:100%; height:${rVh(layout.imageHeight)}; object-fit:cover; }` : '',
    `.upsell-widget__body { padding:${rVw(spacing.padding)}; display:flex; align-items:flex-start; gap:${rVw(12)}; }`,
    `.upsell-widget__content { flex:1; min-width:0; }`,
    `.upsell-widget__headline { margin:0; line-height:1.3; color:${form.colors.text}; font-size:${rFont(form.typography.headlineSize)}; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:${rVw(8)} 0 0; line-height:1.5; opacity:.75; color:${form.colors.text}; font-size:${rFont(form.typography.descriptionSize)}; }`,
    `.upsell-widget__actions { margin-top:${rVw(spacing.gap)}; }`,
    `.upsell-widget__cta { display:inline-block; width:100%; box-sizing:border-box; text-align:center; text-decoration:none; border:none; cursor:pointer; transition:opacity .2s; border-radius:${rVw(Math.max(8, spacing.borderRadius - 4))}; padding:${rVw(10)} ${rVw(16)}; background:${form.colors.button}; color:${form.colors.buttonText}; font-size:${rFont(form.typography.ctaSize)}; font-weight:600; }`,
    '.upsell-widget__cta:hover { opacity:.9; }',
  ])
}

const generateMinimalCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  border: 1px solid #e2e8f0;', '  box-shadow: none;']),
    ...sharedCss(form),
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:100%; height:${rVh(layout.imageHeight)}; object-fit:cover; filter:saturate(.9); }` : '',
    `.upsell-widget__body { padding:${rVw(spacing.padding)}; display:flex; align-items:flex-start; gap:${rVw(12)}; }`,
    `.upsell-widget__content { flex:1; min-width:0; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${rFont(form.typography.headlineSize)}; font-weight:600; }`,
    `.upsell-widget__description { margin:${rVw(6)} 0 0; color:${form.colors.text}; opacity:.7; font-size:${rFont(form.typography.descriptionSize)}; }`,
    `.upsell-widget__cta { display:inline-block; margin-top:${rVw(spacing.gap)}; width:100%; box-sizing:border-box; text-align:center; text-decoration:none; border:1px solid ${form.colors.border}; background:transparent; color:${form.colors.text}; border-radius:${rVw(10)}; padding:${rVw(10)} ${rVw(14)}; font-size:${rFont(form.typography.ctaSize)}; font-weight:600; cursor:pointer; }`,
  ])
}

const generateBoldCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);']),
    ...sharedCss(form),
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:100%; height:${rVh(layout.imageHeight)}; object-fit:cover; mix-blend:multiply; opacity:.9; }` : '',
    `.upsell-widget__body { padding:${rVw(spacing.padding)}; display:flex; align-items:flex-start; gap:${rVw(12)}; }`,
    `.upsell-widget__content { flex:1; min-width:0; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${rFont(form.typography.headlineSize)}; font-weight:800; text-transform:uppercase; letter-spacing:.02em; }`,
    `.upsell-widget__description { margin:${rVw(10)} 0 0; color:${form.colors.text}; opacity:.88; font-size:${rFont(form.typography.descriptionSize)}; }`,
    `.upsell-widget__actions { margin-top:${rVw(spacing.gap)}; }`,
    `.upsell-widget__cta { display:inline-block; width:100%; box-sizing:border-box; text-align:center; text-decoration:none; border:none; cursor:pointer; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:${rVw(Math.max(10, spacing.borderRadius - 2))}; padding:${rVw(12)} ${rVw(16)}; font-size:${rFont(form.typography.ctaSize)}; font-weight:700; box-shadow:0 ${rVh(8)} ${rVw(24)} rgba(0,0,0,.25); }`,
  ])
}

const generateCompactCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  display:flex; align-items:stretch;']),
    ...sharedCss(form),
    layout.imagePosition !== 'none' ? `.upsell-widget__media-link { width:${rVw(layout.imageHeight)}; flex-shrink:0; }` : '',
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:${rVw(layout.imageHeight)}; height:100%; object-fit:cover; flex-shrink:0; }` : '',
    `.upsell-widget__body { padding:${rVw(spacing.padding)}; flex:1; display:flex; flex-direction:column; justify-content:center; gap:${rVw(8)}; min-width:0; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${rFont(form.typography.headlineSize)}; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:0; color:${form.colors.text}; opacity:.7; font-size:${rFont(form.typography.descriptionSize)}; }`,
    `.upsell-widget__actions { display:flex; align-items:center; justify-content:space-between; gap:${rVw(12)}; flex-wrap:wrap; }`,
    `.upsell-widget__cta { display:inline-block; text-decoration:none; border:none; cursor:pointer; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:${rVw(Math.max(6, spacing.borderRadius - 4))}; padding:${rVw(8)} ${rVw(14)}; font-size:${rFont(form.typography.ctaSize)}; font-weight:600; }`,
  ])
}

const generateBannerCss = (form: WidgetFormState) => {
  const { spacing } = form
  return css([
    ...baseContainerCss(form, ['  display:flex; align-items:center; flex-wrap:wrap;']),
    ...sharedCss(form),
    `.upsell-widget__media-link { width:${rVw(80)}; height:${rVw(80)}; flex-shrink:0; margin:${rVw(12)}; }`,
    `.upsell-widget__image { width:${rVw(80)}; height:${rVw(80)}; object-fit:cover; border-radius:${rVw(8)}; }`,
    `.upsell-widget__body { flex:1; min-width:0; padding:${rVw(spacing.padding / 2)} ${rVw(spacing.padding)}; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${rFont(form.typography.headlineSize)}; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:${rVw(4)} 0 0; color:${form.colors.text}; opacity:.8; font-size:${rFont(form.typography.descriptionSize)}; }`,
    `.upsell-widget__actions { padding:${rVw(spacing.padding)}; flex-shrink:0; display:flex; align-items:center; gap:${rVw(12)}; }`,
    `.upsell-widget__cta { display:inline-block; text-decoration:none; border:none; cursor:pointer; white-space:nowrap; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:${rVw(Math.max(6, spacing.borderRadius - 4))}; padding:${rVw(10)} ${rVw(20)}; font-size:${rFont(form.typography.ctaSize)}; font-weight:600; }`,
  ])
}

const generateFloatingCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  border: 1px solid rgba(255,255,255,.45);', '  backdrop-filter: blur(8px);']),
    ...sharedCss(form),
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:100%; height:${rVh(layout.imageHeight)}; object-fit:cover; }` : '',
    `.upsell-widget__body { padding:${rVw(spacing.padding)}; background:linear-gradient(180deg, rgba(255,255,255,.2), rgba(255,255,255,.05)); display:flex; align-items:flex-start; gap:${rVw(12)}; }`,
    `.upsell-widget__content { flex:1; min-width:0; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${rFont(form.typography.headlineSize)}; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:${rVw(8)} 0 0; color:${form.colors.text}; opacity:.8; font-size:${rFont(form.typography.descriptionSize)}; }`,
    `.upsell-widget__actions { margin-top:${rVw(spacing.gap)}; }`,
    `.upsell-widget__cta { display:inline-block; width:100%; box-sizing:border-box; text-align:center; text-decoration:none; border:none; cursor:pointer; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:999px; padding:${rVw(10)} ${rVw(18)}; font-size:${rFont(form.typography.ctaSize)}; font-weight:700; }`,
  ])
}

export const generateWidgetCss = (form: WidgetFormState): string => {
  switch (form.template) {
    case 'minimal':
      return generateMinimalCss(form)
    case 'bold':
      return generateBoldCss(form)
    case 'compact':
      return generateCompactCss(form)
    case 'banner':
      return generateBannerCss(form)
    case 'floating':
      return generateFloatingCss(form)
    case 'classic':
    default:
      return generateClassicCss(form)
  }
}

function contentLines(form: WidgetFormState): string[] {
  const headline = form.headline || 'Título da oferta'
  const subtitle = form.subtitle || ''
  const description = form.description || 'Descrição da oferta'
  const ctaText = form.cta_text || 'Comprar agora'

  return [
    form.badge ? `      <span class="upsell-widget__badge">${esc(form.badge)}</span>` : '',
    `      <h3 class="upsell-widget__headline">${esc(headline)}</h3>`,
    subtitle ? `      <p class="upsell-widget__subtitle">${esc(subtitle)}</p>` : '',
    `      <p class="upsell-widget__description">${esc(description)}</p>`,
    '      <div class="upsell-widget__actions">',
    `        <a class="upsell-widget__cta" ${ctaAttrs(form)}>${esc(ctaText)}</a>`,
    '      </div>',
  ].filter(Boolean)
}

function closeButton(form: WidgetFormState): string {
  if (!form.layout.showDismiss) return ''
  return '    <button id="upse-close" class="upsell-widget__close" type="button" aria-label="Fechar campanha">×</button>'
}

function generateClassicHtml(form: WidgetFormState): string {
  const lines: string[] = ['<div class="upsell-widget">']
  const media = renderMedia(form)

  if (media) lines.push(media)

  lines.push(
    '  <div class="upsell-widget__body">',
    '    <div class="upsell-widget__content">',
    ...contentLines(form),
    '    </div>',
  )

  const close = closeButton(form)
  if (close) lines.push(close)

  lines.push('  </div>', '</div>')
  return lines.join('\n')
}

function generateCompactHtml(form: WidgetFormState): string {
  const lines: string[] = ['<div class="upsell-widget">']
  const media = renderMedia(form)

  if (media) lines.push(media)

  lines.push(
    '  <div class="upsell-widget__body">',
    form.badge ? `    <span class="upsell-widget__badge">${esc(form.badge)}</span>` : '',
    `    <h3 class="upsell-widget__headline">${esc(form.headline || 'Título')}</h3>`,
    form.subtitle ? `    <p class="upsell-widget__subtitle">${esc(form.subtitle)}</p>` : '',
    `    <p class="upsell-widget__description">${esc(form.description || 'Descrição...')}</p>`,
    '    <div class="upsell-widget__actions">',
    `      <a class="upsell-widget__cta" ${ctaAttrs(form)}>${esc(form.cta_text || 'Comprar agora')}</a>`,
  )

  const close = closeButton(form)
  if (close) lines.push(`      ${close.trim()}`)

  lines.push('    </div>', '  </div>', '</div>')
  return lines.filter(Boolean).join('\n')
}

function generateBannerHtml(form: WidgetFormState): string {
  const lines: string[] = ['<div class="upsell-widget">']
  const media = renderMedia(form)

  if (media) lines.push(media)

  lines.push(
    '  <div class="upsell-widget__body">',
    form.badge ? `    <span class="upsell-widget__badge">${esc(form.badge)}</span>` : '',
    `    <h3 class="upsell-widget__headline">${esc(form.headline || 'Título')}</h3>`,
    form.subtitle ? `    <p class="upsell-widget__subtitle">${esc(form.subtitle)}</p>` : '',
    `    <p class="upsell-widget__description">${esc(form.description || 'Descrição...')}</p>`,
    '  </div>',
    '  <div class="upsell-widget__actions">',
    `    <a class="upsell-widget__cta" ${ctaAttrs(form)}>${esc(form.cta_text || 'Comprar')}</a>`,
  )

  const close = closeButton(form)
  if (close) lines.push(`    ${close.trim()}`)

  lines.push('  </div>', '</div>')
  return lines.filter(Boolean).join('\n')
}

export const generateWidgetHtml = (form: WidgetFormState): string => {
  switch (form.template) {
    case 'compact':
    case 'minimal':
      return generateCompactHtml(form)
    case 'banner':
      return generateBannerHtml(form)
    case 'bold':
    case 'floating':
    case 'classic':
    default:
      return generateClassicHtml(form)
  }
}
