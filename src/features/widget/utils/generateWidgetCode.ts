import { SHADOW_MAP } from '../constants'
import type { WidgetFormState } from '../types'
import { isVideoUrl } from './widgetMedia'

const esc = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const css = (lines: string[]) => lines.filter(Boolean).join('\n')

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
    `  border-radius: ${spacing.borderRadius}px;`,
    layout.borderWidth > 0 ? `  border: ${layout.borderWidth}px solid ${colors.border};` : '',
    shadow !== 'none' ? `  box-shadow: ${shadow};` : '',
    '  overflow: hidden;',
    '  font-family: inherit;',
    ...extra,
    '}',
  ]
}

const sharedCss = (form: WidgetFormState) => [
  `.upsell-widget__media-link { display:block; text-decoration:none; color:inherit; }`,
  `.upsell-widget__badge { display:inline-flex; align-items:center; margin-bottom:10px; border-radius:999px; padding:4px 10px; background:${form.colors.accent}; color:${form.colors.buttonText}; font-size:11px; font-weight:700; }`,
  `.upsell-widget__subtitle { margin:6px 0 0; line-height:1.4; opacity:.65; color:${form.colors.text}; font-size:12px; }`,
  `.upsell-widget__close { margin-left:12px; border:none; background:transparent; color:${form.colors.text}; opacity:.45; font-size:20px; line-height:1; cursor:pointer; padding:0; }`,
]

const generateClassicCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  const hasImage = layout.imagePosition !== 'none'

  return css([
    ...baseContainerCss(form),
    ...sharedCss(form),
    hasImage ? `.upsell-widget__image { display:block; width:100%; height:${layout.imageHeight}px; object-fit:cover; }` : '',
    `.upsell-widget__body { padding:${spacing.padding}px; display:flex; align-items:flex-start; gap:12px; }`,
    `.upsell-widget__content { flex:1; }`,
    `.upsell-widget__headline { margin:0; line-height:1.3; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:8px 0 0; line-height:1.5; opacity:.75; color:${form.colors.text}; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__actions { margin-top:${spacing.gap}px; }`,
    `.upsell-widget__cta { display:inline-block; width:100%; box-sizing:border-box; text-align:center; text-decoration:none; border:none; cursor:pointer; transition:opacity .2s; border-radius:${Math.max(8, spacing.borderRadius - 4)}px; padding:10px 16px; background:${form.colors.button}; color:${form.colors.buttonText}; font-size:${form.typography.ctaSize}px; font-weight:600; }`,
    '.upsell-widget__cta:hover { opacity:.9; }',
  ])
}

const generateMinimalCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  border: 1px solid #e2e8f0;', '  box-shadow: none;']),
    ...sharedCss(form),
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:100%; height:${layout.imageHeight}px; object-fit:cover; filter:saturate(.9); }` : '',
    `.upsell-widget__body { padding:${spacing.padding}px; display:flex; align-items:flex-start; gap:12px; }`,
    `.upsell-widget__content { flex:1; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:600; }`,
    `.upsell-widget__description { margin:6px 0 0; color:${form.colors.text}; opacity:.7; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__cta { display:inline-block; margin-top:${spacing.gap}px; width:100%; box-sizing:border-box; text-align:center; text-decoration:none; border:1px solid ${form.colors.border}; background:transparent; color:${form.colors.text}; border-radius:10px; padding:10px 14px; font-size:${form.typography.ctaSize}px; font-weight:600; cursor:pointer; }`,
  ])
}

const generateBoldCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);']),
    ...sharedCss(form),
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:100%; height:${layout.imageHeight}px; object-fit:cover; mix-blend:multiply; opacity:.9; }` : '',
    `.upsell-widget__body { padding:${spacing.padding}px; display:flex; align-items:flex-start; gap:12px; }`,
    `.upsell-widget__content { flex:1; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:800; text-transform:uppercase; letter-spacing:.02em; }`,
    `.upsell-widget__description { margin:10px 0 0; color:${form.colors.text}; opacity:.88; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__actions { margin-top:${spacing.gap}px; }`,
    `.upsell-widget__cta { display:inline-block; width:100%; box-sizing:border-box; text-align:center; text-decoration:none; border:none; cursor:pointer; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:${Math.max(10, spacing.borderRadius - 2)}px; padding:12px 16px; font-size:${form.typography.ctaSize}px; font-weight:700; box-shadow:0 8px 24px rgba(0,0,0,.25); }`,
  ])
}

const generateCompactCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  display:flex; align-items:stretch;']),
    ...sharedCss(form),
    layout.imagePosition !== 'none' ? `.upsell-widget__media-link { width:${layout.imageHeight}px; flex-shrink:0; }` : '',
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:${layout.imageHeight}px; height:100%; object-fit:cover; flex-shrink:0; }` : '',
    `.upsell-widget__body { padding:${spacing.padding}px; flex:1; display:flex; flex-direction:column; justify-content:center; gap:8px; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:0; color:${form.colors.text}; opacity:.7; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__actions { display:flex; align-items:center; justify-content:space-between; gap:12px; }`,
    `.upsell-widget__cta { display:inline-block; text-decoration:none; border:none; cursor:pointer; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:${Math.max(6, spacing.borderRadius - 4)}px; padding:8px 14px; font-size:${form.typography.ctaSize}px; font-weight:600; }`,
  ])
}

const generateBannerCss = (form: WidgetFormState) => {
  const { spacing } = form
  return css([
    ...baseContainerCss(form, ['  display:flex; align-items:center;']),
    ...sharedCss(form),
    '.upsell-widget__media-link { width:80px; height:80px; flex-shrink:0; margin:12px; }',
    '.upsell-widget__image { width:80px; height:80px; object-fit:cover; border-radius:8px; }',
    `.upsell-widget__body { flex:1; padding:${spacing.padding / 2}px ${spacing.padding}px; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:4px 0 0; color:${form.colors.text}; opacity:.8; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__actions { padding:${spacing.padding}px; flex-shrink:0; display:flex; align-items:center; gap:12px; }`,
    `.upsell-widget__cta { display:inline-block; text-decoration:none; border:none; cursor:pointer; white-space:nowrap; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:${Math.max(6, spacing.borderRadius - 4)}px; padding:10px 20px; font-size:${form.typography.ctaSize}px; font-weight:600; }`,
  ])
}

const generateFloatingCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  border: 1px solid rgba(255,255,255,.45);', '  backdrop-filter: blur(8px);']),
    ...sharedCss(form),
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:100%; height:${layout.imageHeight}px; object-fit:cover; }` : '',
    `.upsell-widget__body { padding:${spacing.padding}px; background:linear-gradient(180deg, rgba(255,255,255,.2), rgba(255,255,255,.05)); display:flex; align-items:flex-start; gap:12px; }`,
    `.upsell-widget__content { flex:1; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:8px 0 0; color:${form.colors.text}; opacity:.8; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__actions { margin-top:${spacing.gap}px; }`,
    `.upsell-widget__cta { display:inline-block; width:100%; box-sizing:border-box; text-align:center; text-decoration:none; border:none; cursor:pointer; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:999px; padding:10px 18px; font-size:${form.typography.ctaSize}px; font-weight:700; }`,
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
