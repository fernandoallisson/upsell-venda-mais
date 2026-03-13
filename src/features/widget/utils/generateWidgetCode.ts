import { SHADOW_MAP } from '../constants'
import type { WidgetFormState } from '../types'

const esc = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const css = (lines: string[]) => lines.filter(Boolean).join('\n')

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

const generateClassicCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  const hasImage = layout.imagePosition !== 'none'

  return css([
    ...baseContainerCss(form),
    hasImage ? `.upsell-widget__image { display:block; width:100%; height:${layout.imageHeight}px; object-fit:cover; }` : '',
    `.upsell-widget__body { padding:${spacing.padding}px; }`,
    `.upsell-widget__headline { margin:0; line-height:1.3; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:8px 0 0; line-height:1.5; opacity:.75; color:${form.colors.text}; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__actions { margin-top:${spacing.gap}px; }`,
    `.upsell-widget__cta { width:100%; border:none; cursor:pointer; transition:opacity .2s; border-radius:${Math.max(8, spacing.borderRadius - 4)}px; padding:10px 16px; background:${form.colors.button}; color:${form.colors.buttonText}; font-size:${form.typography.ctaSize}px; font-weight:600; }`,
    '.upsell-widget__cta:hover { opacity:.9; }',
  ])
}

const generateMinimalCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  border: 1px solid #e2e8f0;', '  box-shadow: none;']),
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:100%; height:${layout.imageHeight}px; object-fit:cover; filter:saturate(.9); }` : '',
    `.upsell-widget__body { padding:${spacing.padding}px; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:600; }`,
    `.upsell-widget__description { margin:6px 0 0; color:${form.colors.text}; opacity:.7; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__cta { margin-top:${spacing.gap}px; width:100%; border:1px solid ${form.colors.border}; background:transparent; color:${form.colors.text}; border-radius:10px; padding:10px 14px; font-size:${form.typography.ctaSize}px; font-weight:600; cursor:pointer; }`,
  ])
}

const generateBoldCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);']),
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:100%; height:${layout.imageHeight}px; object-fit:cover; mix-blend:multiply; opacity:.9; }` : '',
    `.upsell-widget__body { padding:${spacing.padding}px; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:800; text-transform:uppercase; letter-spacing:.02em; }`,
    `.upsell-widget__description { margin:10px 0 0; color:${form.colors.text}; opacity:.88; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__actions { margin-top:${spacing.gap}px; }`,
    `.upsell-widget__cta { width:100%; border:none; cursor:pointer; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:${Math.max(10, spacing.borderRadius - 2)}px; padding:12px 16px; font-size:${form.typography.ctaSize}px; font-weight:700; box-shadow:0 8px 24px rgba(0,0,0,.25); }`,
  ])
}

const generateCompactCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  display:flex; align-items:stretch;']),
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:${layout.imageHeight}px; object-fit:cover; flex-shrink:0; }` : '',
    `.upsell-widget__body { padding:${spacing.padding}px; flex:1; display:flex; flex-direction:column; justify-content:center; gap:8px; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:0; color:${form.colors.text}; opacity:.7; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__cta { align-self:flex-start; border:none; cursor:pointer; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:${Math.max(6, spacing.borderRadius - 4)}px; padding:8px 14px; font-size:${form.typography.ctaSize}px; font-weight:600; }`,
  ])
}

const generateBannerCss = (form: WidgetFormState) => {
  const { spacing } = form
  return css([
    ...baseContainerCss(form, ['  display:flex; align-items:center;']),
    '.upsell-widget__image { width:80px; height:80px; object-fit:cover; flex-shrink:0; margin:12px; border-radius:8px; }',
    `.upsell-widget__body { flex:1; padding:${spacing.padding / 2}px ${spacing.padding}px; }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:4px 0 0; color:${form.colors.text}; opacity:.8; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__actions { padding:${spacing.padding}px; flex-shrink:0; }`,
    `.upsell-widget__cta { border:none; cursor:pointer; white-space:nowrap; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:${Math.max(6, spacing.borderRadius - 4)}px; padding:10px 20px; font-size:${form.typography.ctaSize}px; font-weight:600; }`,
  ])
}

const generateFloatingCss = (form: WidgetFormState) => {
  const { spacing, layout } = form
  return css([
    ...baseContainerCss(form, ['  border: 1px solid rgba(255,255,255,.45);', '  backdrop-filter: blur(8px);']),
    layout.imagePosition !== 'none' ? `.upsell-widget__image { display:block; width:100%; height:${layout.imageHeight}px; object-fit:cover; }` : '',
    `.upsell-widget__body { padding:${spacing.padding}px; background:linear-gradient(180deg, rgba(255,255,255,.2), rgba(255,255,255,.05)); }`,
    `.upsell-widget__headline { margin:0; color:${form.colors.text}; font-size:${form.typography.headlineSize}px; font-weight:${form.typography.headlineWeight}; }`,
    `.upsell-widget__description { margin:8px 0 0; color:${form.colors.text}; opacity:.8; font-size:${form.typography.descriptionSize}px; }`,
    `.upsell-widget__actions { margin-top:${spacing.gap}px; }`,
    `.upsell-widget__cta { width:100%; border:none; cursor:pointer; background:${form.colors.button}; color:${form.colors.buttonText}; border-radius:999px; padding:10px 18px; font-size:${form.typography.ctaSize}px; font-weight:700; }`,
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

function generateClassicHtml(form: WidgetFormState): string {
  const { layout } = form
  const headline = form.headline || 'Título da oferta'
  const description = form.description || 'Descrição da oferta'
  const ctaText = form.cta_text || 'Comprar agora'
  const dismissText = layout.dismissText || 'Não, obrigado'

  const lines: string[] = ['<div class="upsell-widget">']

  if (layout.imagePosition !== 'none' && form.image_url) {
    lines.push(`  <img class="upsell-widget__image" src="${esc(form.image_url)}" alt="Oferta" />`)
  }

  lines.push(
    '  <div class="upsell-widget__body">',
    `    <h3 class="upsell-widget__headline">${esc(headline)}</h3>`,
    `    <p class="upsell-widget__description">${esc(description)}</p>`,
    '    <div class="upsell-widget__actions">',
    `      <button class="upsell-widget__cta">${esc(ctaText)}</button>`,
  )

  if (layout.showDismiss) {
    lines.push(`      <button class="upsell-widget__dismiss">${esc(dismissText)}</button>`)
  }

  lines.push('    </div>', '  </div>', '</div>')
  return lines.join('\n')
}

function generateCompactHtml(form: WidgetFormState): string {
  const headline = form.headline || 'Título'
  const description = form.description || 'Descrição...'
  const ctaText = form.cta_text || 'Comprar agora'

  const lines: string[] = ['<div class="upsell-widget">']

  if (form.layout.imagePosition !== 'none' && form.image_url) {
    lines.push(`  <img class="upsell-widget__image" src="${esc(form.image_url)}" alt="Oferta" />`)
  }

  lines.push(
    '  <div class="upsell-widget__body">',
    `    <h3 class="upsell-widget__headline">${esc(headline)}</h3>`,
    `    <p class="upsell-widget__description">${esc(description)}</p>`,
    `    <button class="upsell-widget__cta">${esc(ctaText)}</button>`,
    '  </div>',
    '</div>',
  )
  return lines.join('\n')
}

function generateBannerHtml(form: WidgetFormState): string {
  const headline = form.headline || 'Título'
  const description = form.description || 'Descrição...'
  const ctaText = form.cta_text || 'Comprar'

  const lines: string[] = ['<div class="upsell-widget">']

  if (form.image_url) {
    lines.push(`  <img class="upsell-widget__image" src="${esc(form.image_url)}" alt="Oferta" />`)
  }

  lines.push(
    '  <div class="upsell-widget__body">',
    `    <h3 class="upsell-widget__headline">${esc(headline)}</h3>`,
    `    <p class="upsell-widget__description">${esc(description)}</p>`,
    '  </div>',
    '  <div class="upsell-widget__actions">',
    `    <button class="upsell-widget__cta">${esc(ctaText)}</button>`,
    '  </div>',
    '</div>',
  )
  return lines.join('\n')
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
