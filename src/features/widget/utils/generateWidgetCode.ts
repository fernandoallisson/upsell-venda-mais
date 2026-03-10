import { SHADOW_MAP } from '../constants'
import type { WidgetFormState } from '../types'

const escape = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const generateWidgetCss = (form: WidgetFormState): string => {
  const { colors, spacing, typography, layout } = form
  const shadow = SHADOW_MAP[layout.shadowIntensity] ?? 'none'
  const isHorizontal = layout.imagePosition === 'left' || layout.imagePosition === 'right'
  const btnRadius = Math.max(8, spacing.borderRadius - 4)

  const lines: string[] = [
    '.upsell-widget {',
    `  background-color: ${colors.bg};`,
    `  color: ${colors.text};`,
    `  border-radius: ${spacing.borderRadius}px;`,
  ]

  if (layout.borderWidth > 0) {
    lines.push(`  border: ${layout.borderWidth}px solid ${colors.border};`)
  }

  if (shadow !== 'none') {
    lines.push(`  box-shadow: ${shadow};`)
  }

  lines.push(
    '  overflow: hidden;',
    '  font-family: inherit;',
  )

  if (isHorizontal) {
    lines.push('  display: flex;', '  align-items: stretch;')
    if (layout.imagePosition === 'right') {
      lines.push('  flex-direction: row-reverse;')
    }
  }

  lines.push('}', '')

  if (layout.imagePosition !== 'none') {
    lines.push('.upsell-widget__image {')
    lines.push('  display: block;')
    lines.push('  object-fit: cover;')
    if (isHorizontal) {
      lines.push(`  width: ${layout.imageHeight}px;`)
      lines.push('  flex-shrink: 0;')
    } else {
      lines.push('  width: 100%;')
      lines.push(`  height: ${layout.imageHeight}px;`)
    }
    lines.push('}', '')
  }

  lines.push(
    '.upsell-widget__body {',
    `  padding: ${spacing.padding}px;`,
  )
  if (isHorizontal) {
    lines.push('  flex: 1;', '  display: flex;', '  flex-direction: column;', '  justify-content: center;')
  }
  lines.push('}', '')

  lines.push(
    '.upsell-widget__headline {',
    `  font-size: ${typography.headlineSize}px;`,
    `  font-weight: ${typography.headlineWeight};`,
    '  line-height: 1.3;',
    `  color: ${colors.text};`,
    '  margin: 0;',
    '}',
    '',
  )

  lines.push(
    '.upsell-widget__description {',
    `  font-size: ${typography.descriptionSize}px;`,
    `  font-weight: ${typography.descriptionWeight};`,
    '  line-height: 1.5;',
    `  color: ${colors.text};`,
    '  opacity: 0.75;',
    '  margin: 8px 0 0 0;',
    '}',
    '',
  )

  lines.push(
    '.upsell-widget__actions {',
    `  margin-top: ${spacing.gap}px;`,
    '}',
    '',
  )

  lines.push(
    '.upsell-widget__cta {',
    `  background-color: ${colors.button};`,
    `  color: ${colors.buttonText};`,
    `  font-size: ${typography.ctaSize}px;`,
    '  font-weight: 600;',
    `  border-radius: ${btnRadius}px;`,
    '  padding: 10px 16px;',
    '  width: 100%;',
    '  border: none;',
    '  cursor: pointer;',
    '  transition: opacity 0.2s;',
    '}',
    '',
    '.upsell-widget__cta:hover {',
    '  opacity: 0.9;',
    '}',
    '',
  )

  if (layout.showDismiss) {
    lines.push(
      '.upsell-widget__dismiss {',
      `  color: ${colors.text};`,
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
      '',
    )
  }

  return lines.join('\n')
}

export const generateWidgetHtml = (form: WidgetFormState): string => {
  const { layout } = form
  const headline = form.headline || 'Titulo da oferta'
  const description = form.description || 'Descricao da oferta'
  const ctaText = form.cta_text || 'Comprar Agora'
  const dismissText = layout.dismissText || 'Nao, obrigado'

  const lines: string[] = ['<div class="upsell-widget">']

  if (layout.imagePosition !== 'none' && form.image_url) {
    lines.push(`  <img class="upsell-widget__image" src="${escape(form.image_url)}" alt="Oferta" />`)
  }

  lines.push(
    '  <div class="upsell-widget__body">',
    `    <h3 class="upsell-widget__headline">${escape(headline)}</h3>`,
    `    <p class="upsell-widget__description">${escape(description)}</p>`,
    '    <div class="upsell-widget__actions">',
    `      <button class="upsell-widget__cta">${escape(ctaText)}</button>`,
  )

  if (layout.showDismiss) {
    lines.push(`      <button class="upsell-widget__dismiss">${escape(dismissText)}</button>`)
  }

  lines.push(
    '    </div>',
    '  </div>',
    '</div>',
  )

  return lines.join('\n')
}
