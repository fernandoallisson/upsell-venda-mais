import { SHADOW_MAP } from '../constants'
import type { WidgetFormState } from '../types'

const esc = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const css = (lines: string[]) => lines.filter(Boolean).join('\n')

function baseContainerCss(form: WidgetFormState, extra: string[] = []): string[] {
  const { colors, spacing, layout } = form
  const shadow = SHADOW_MAP[layout.shadowIntensity] ?? 'none'

  const rules = [
    `  background-color: ${colors.bg};`,
    `  border-radius: ${spacing.borderRadius}px;`,
    layout.borderWidth > 0 ? `  border: ${layout.borderWidth}px solid ${colors.border};` : '',
    shadow !== 'none' ? `  box-shadow: ${shadow};` : '',
    '  overflow: hidden;',
    '  font-family: inherit;',
    ...extra,
  ]

  return ['.upsell-widget {', ...rules.filter(Boolean), '}']
}

function headlineCss(form: WidgetFormState): string[] {
  const { colors, typography } = form
  return [
    '.upsell-widget__headline {',
    `  font-size: ${typography.headlineSize}px;`,
    `  font-weight: ${typography.headlineWeight};`,
    '  line-height: 1.3;',
    `  color: ${colors.text};`,
    '  margin: 0;',
    '}',
  ]
}

function descriptionCss(form: WidgetFormState, marginTop = 8): string[] {
  const { colors, typography } = form
  return [
    '.upsell-widget__description {',
    `  font-size: ${typography.descriptionSize}px;`,
    `  font-weight: ${typography.descriptionWeight};`,
    '  line-height: 1.5;',
    `  color: ${colors.text};`,
    '  opacity: 0.75;',
    `  margin: ${marginTop}px 0 0 0;`,
    '}',
  ]
}

function ctaCss(form: WidgetFormState, opts: { fullWidth?: boolean; padding?: string } = {}): string[] {
  const { colors, spacing, typography } = form
  const btnRadius = Math.max(8, spacing.borderRadius - 4)
  const { fullWidth = true, padding: pad = '10px 16px' } = opts

  return [
    '.upsell-widget__cta {',
    `  background-color: ${colors.button};`,
    `  color: ${colors.buttonText};`,
    `  font-size: ${typography.ctaSize}px;`,
    '  font-weight: 600;',
    `  border-radius: ${btnRadius}px;`,
    `  padding: ${pad};`,
    fullWidth ? '  width: 100%;' : '',
    '  border: none;',
    '  cursor: pointer;',
    '  transition: opacity 0.2s;',
    '}',
    '',
    '.upsell-widget__cta:hover {',
    '  opacity: 0.9;',
    '}',
  ].filter(Boolean)
}

function dismissCss(form: WidgetFormState): string[] {
  if (!form.layout.showDismiss) return []
  return [
    '.upsell-widget__dismiss {',
    `  color: ${form.colors.text};`,
    '  opacity: 0.4;',
    '  font-size: 12px;',
    '  width: 100%;',
    '  background: none;',
    '  border: none;',
    '  cursor: pointer;',
    '  padding: 6px 0;',
    '  margin-top: 4px;',
    '}',
    '',
    '.upsell-widget__dismiss:hover {',
    '  opacity: 0.6;',
    '}',
  ]
}

function generateClassicCss(form: WidgetFormState): string {
  const { spacing, layout } = form
  const hasImage = layout.imagePosition !== 'none'

  return css([
    ...baseContainerCss(form),
    '',
    ...(hasImage
      ? [
          '.upsell-widget__image {',
          '  display: block;',
          '  width: 100%;',
          `  height: ${layout.imageHeight}px;`,
          '  object-fit: cover;',
          '}',
          '',
        ]
      : []),
    '.upsell-widget__body {',
    `  padding: ${spacing.padding}px;`,
    '}',
    '',
    ...headlineCss(form),
    '',
    ...descriptionCss(form),
    '',
    '.upsell-widget__actions {',
    `  margin-top: ${spacing.gap}px;`,
    '}',
    '',
    ...ctaCss(form),
    '',
    ...dismissCss(form),
  ])
}

function generateCompactCss(form: WidgetFormState): string {
  const { spacing, layout } = form
  const btnRadius = Math.max(6, spacing.borderRadius - 4)
  const hasImage = layout.imagePosition !== 'none'

  return css([
    ...baseContainerCss(form, [
      '  display: flex;',
      '  align-items: stretch;',
    ]),
    '',
    ...(hasImage
      ? [
          '.upsell-widget__image {',
          '  display: block;',
          `  width: ${layout.imageHeight}px;`,
          '  object-fit: cover;',
          '  flex-shrink: 0;',
          '}',
          '',
        ]
      : []),
    '.upsell-widget__body {',
    `  padding: ${spacing.padding}px;`,
    '  flex: 1;',
    '  display: flex;',
    '  flex-direction: column;',
    '  justify-content: center;',
    '  gap: 8px;',
    '}',
    '',
    ...headlineCss(form),
    '',
    `.upsell-widget__description {`,
    `  font-size: ${form.typography.descriptionSize}px;`,
    `  color: ${form.colors.text};`,
    '  opacity: 0.7;',
    '  line-height: 1.4;',
    '  margin: 0;',
    '}',
    '',
    '.upsell-widget__cta {',
    `  background-color: ${form.colors.button};`,
    `  color: ${form.colors.buttonText};`,
    `  font-size: ${form.typography.ctaSize}px;`,
    '  font-weight: 600;',
    `  border-radius: ${btnRadius}px;`,
    '  padding: 8px 14px;',
    '  border: none;',
    '  cursor: pointer;',
    '  align-self: flex-start;',
    '  transition: opacity 0.2s;',
    '}',
    '',
    '.upsell-widget__cta:hover {',
    '  opacity: 0.9;',
    '}',
  ])
}

function generateBannerCss(form: WidgetFormState): string {
  const { spacing } = form
  const btnRadius = Math.max(6, spacing.borderRadius - 4)

  return css([
    ...baseContainerCss(form, [
      '  display: flex;',
      '  align-items: center;',
    ]),
    '',
    '.upsell-widget__image {',
    '  width: 80px;',
    '  height: 80px;',
    '  object-fit: cover;',
    '  flex-shrink: 0;',
    '  margin: 12px;',
    '  border-radius: 8px;',
    '}',
    '',
    '.upsell-widget__body {',
    '  flex: 1;',
    `  padding: ${spacing.padding / 2}px ${spacing.padding}px;`,
    '}',
    '',
    ...headlineCss(form),
    '',
    `.upsell-widget__description {`,
    `  font-size: ${form.typography.descriptionSize}px;`,
    `  color: ${form.colors.text};`,
    '  opacity: 0.7;',
    '  line-height: 1.4;',
    '  margin: 4px 0 0 0;',
    '}',
    '',
    '.upsell-widget__actions {',
    `  padding: ${spacing.padding}px;`,
    '  flex-shrink: 0;',
    '}',
    '',
    '.upsell-widget__cta {',
    `  background-color: ${form.colors.button};`,
    `  color: ${form.colors.buttonText};`,
    `  font-size: ${form.typography.ctaSize}px;`,
    '  font-weight: 600;',
    `  border-radius: ${btnRadius}px;`,
    '  padding: 10px 20px;',
    '  border: none;',
    '  cursor: pointer;',
    '  white-space: nowrap;',
    '  transition: opacity 0.2s;',
    '}',
    '',
    '.upsell-widget__cta:hover {',
    '  opacity: 0.9;',
    '}',
  ])
}

export const generateWidgetCss = (form: WidgetFormState): string => {
  switch (form.template) {
    case 'compact':
    case 'minimal':
      return generateCompactCss(form)
    case 'banner':
      return generateBannerCss(form)
    case 'bold':
    case 'floating':
    case 'classic':
    default:
      return generateClassicCss(form)
  }
}

function generateClassicHtml(form: WidgetFormState): string {
  const { layout } = form
  const headline = form.headline || 'Titulo da oferta'
  const description = form.description || 'Descricao da oferta'
  const ctaText = form.cta_text || 'Comprar Agora'
  const dismissText = layout.dismissText || 'Nao, obrigado'

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
  const { layout } = form
  const headline = form.headline || 'Titulo'
  const description = form.description || 'Descricao...'
  const ctaText = form.cta_text || 'Comprar Agora'

  const lines: string[] = ['<div class="upsell-widget">']

  if (layout.imagePosition !== 'none' && form.image_url) {
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
  const headline = form.headline || 'Titulo'
  const description = form.description || 'Descricao...'
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
