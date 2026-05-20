import { htmlWidgetTemplates } from './htmlWidgetTemplates'
import type {
  HtmlWidgetEditableField,
  HtmlWidgetTemplate,
  HtmlWidgetTemplateConfig,
  HtmlWidgetTemplateContent,
} from './htmlWidgetTemplateTypes'

const esc = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const replaceFirstTagContent = (html: string, tag: string, value?: string) => {
  if (!value?.trim()) return html
  return html.replace(new RegExp(`(<${tag}[^>]*>)([\\s\\S]*?)(<\\/${tag}>)`, 'i'), `$1${esc(value.trim())}$3`)
}

const replaceFirstClassContent = (html: string, className: string, value?: string) => {
  if (!value?.trim()) return html
  return html.replace(
    new RegExp(`(<[^>]+class="[^"]*\\b${className}\\b[^"]*"[^>]*>)([\\s\\S]*?)(<\\/[^>]+>)`, 'i'),
    `$1${esc(value.trim())}$3`,
  )
}

const replaceActionText = (html: string, selectorClass: string, value?: string) => {
  if (!value?.trim()) return html
  return html.replace(
    new RegExp(`(<(?:a|button)[^>]+class="[^"]*\\b${selectorClass}\\b[^"]*"[^>]*>)([\\s\\S]*?)(<\\/(?:a|button)>)`, 'gi'),
    `$1${esc(value.trim())}$3`,
  )
}

const ensureAcceptHook = (html: string) => {
  if (/\bitu-accept\b/.test(html)) return html
  return html.replace(
    /<(a|button)([^>]*class=")([^"]*)("[^>]*)>/i,
    (_match, tag: string, beforeClass: string, className: string, afterClass: string) =>
      `<${tag}${beforeClass}${className} itu-accept${afterClass}>`,
  )
}

const applyCtaAttrs = (html: string, content: HtmlWidgetTemplateContent) => {
  const href = content.ctaLink?.trim()
  if (!href) return html
  const targetAttrs = content.ctaNewTab ? ' target="_blank" rel="noopener noreferrer"' : ''

  return html.replace(
    /<a([^>]*class="[^"]*\bitu-accept\b[^"]*"[^>]*)href="[^"]*"/gi,
    `<a$1href="${esc(href)}"${targetAttrs}`,
  )
}

export const getHtmlWidgetTemplateById = (templateId: string | null | undefined) =>
  htmlWidgetTemplates.find((template) => template.id === templateId) ?? null

export const isHtmlWidgetTemplateConfig = (
  attributes: unknown,
): attributes is HtmlWidgetTemplateConfig =>
  typeof attributes === 'object' &&
  attributes !== null &&
  !Array.isArray(attributes) &&
  (attributes as Record<string, unknown>).widgetEngine === 'html-template' &&
  typeof (attributes as Record<string, unknown>).templateId === 'string'

const friendlyClassNames: Record<string, string> = {
  title: 'Titulo',
  subtitle: 'Subtitulo',
  sub: 'Subtitulo',
  desc: 'Descricao',
  text: 'Texto',
  quote: 'Depoimento',
  badge: 'Selo',
  tag: 'Selo',
  price: 'Preco',
  old: 'Preco antigo',
  new: 'Preco novo',
  amount: 'Valor',
  amt: 'Valor',
  button: 'Botao',
  btn: 'Botao',
  note: 'Nota',
  safe: 'Seguranca',
  label: 'Rotulo',
  name: 'Nome',
  meta: 'Meta',
}

const getDocumentParser = () => {
  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') return null
  return new window.DOMParser()
}

const isElementNode = (node: Node): node is Element => node.nodeType === Node.ELEMENT_NODE

const isTextNode = (node: Node): node is Text => node.nodeType === Node.TEXT_NODE

const cleanText = (value: string) => value.replace(/\s+/g, ' ').trim()

const getElementGroup = (element: Element) => {
  const classes = Array.from(element.classList)
  const friendly = classes.find((className) => friendlyClassNames[className])
  if (friendly) return friendlyClassNames[friendly]

  const classHint = classes[0]?.replace(/[-_]+/g, ' ')
  if (classHint) return classHint.charAt(0).toUpperCase() + classHint.slice(1)

  return element.tagName.toLowerCase()
}

const getElementLabel = (element: Element, fallback: string) => {
  const group = getElementGroup(element)
  const text = cleanText(fallback)
  return text ? `${group}: ${text.slice(0, 42)}` : group
}

const parseTemplateBody = (html: string) => {
  const parser = getDocumentParser()
  if (!parser) return null
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html')
  return doc.body
}

const walkElements = (root: Element, callback: (element: Element) => void) => {
  callback(root)
  Array.from(root.children).forEach((child) => walkElements(child, callback))
}

const walkTextNodes = (root: Element, callback: (textNode: Text, parent: Element) => void) => {
  Array.from(root.childNodes).forEach((node) => {
    if (isTextNode(node) && node.parentElement) {
      callback(node, node.parentElement)
      return
    }
    if (isElementNode(node)) walkTextNodes(node, callback)
  })
}

const getElementPath = (element: Element) => {
  const parts: number[] = []
  let current: Element | null = element

  while (current?.parentElement && current.parentElement.tagName.toLowerCase() !== 'body') {
    const siblings = Array.from(current.parentElement.children)
    parts.unshift(siblings.indexOf(current))
    current = current.parentElement
  }

  if (current?.parentElement?.tagName.toLowerCase() === 'body') {
    parts.unshift(Array.from(current.parentElement.children).indexOf(current))
  }

  return parts.join('-')
}

const getTextNodePath = (textNode: Text) => {
  const parent = textNode.parentElement
  if (!parent) return ''
  const childIndex = Array.from(parent.childNodes).indexOf(textNode)
  return `${getElementPath(parent)}-text-${childIndex}`
}

const getElementStableId = (element: Element) => `el:${getElementPath(element)}`

const getTextStableId = (textNode: Text) => `text:${getTextNodePath(textNode)}`

const getHrefStableId = (element: Element) => `href:${getElementPath(element)}`

export const getHtmlWidgetTemplateEditableFields = (template: HtmlWidgetTemplate): HtmlWidgetEditableField[] => {
  const body = parseTemplateBody(template.html)
  if (!body) return []

  const fields: HtmlWidgetEditableField[] = []
  let urlIndex = 0

  walkTextNodes(body, (textNode, parent) => {
    const value = cleanText(textNode.textContent ?? '')
    if (!value) return

    fields.push({
      id: getTextStableId(textNode),
      label: getElementLabel(parent, value),
      group: getElementGroup(parent),
      type: value.length > 80 ? 'long-text' : 'text',
      defaultValue: value,
    })
  })

  walkElements(body, (element) => {
    if (element.tagName.toLowerCase() !== 'a') return
    const href = element.getAttribute('href')
    if (!href) return

    urlIndex += 1
    const text = cleanText(element.textContent ?? '')
    fields.push({
      id: getHrefStableId(element),
      label: `Link: ${text.slice(0, 42) || `CTA ${urlIndex}`}`,
      group: 'Links',
      type: 'url',
      defaultValue: href,
    })
  })

  return fields
}

export const buildHtmlWidgetTemplateConfig = (
  template: HtmlWidgetTemplate,
  contentOverrides: HtmlWidgetTemplateContent = {},
  fieldOverrides: Record<string, string> = {},
  hiddenElementIds: string[] = [],
): HtmlWidgetTemplateConfig => ({
  widgetEngine: 'html-template',
  templateId: template.id,
  templateCategory: template.category,
  supportsScript: template.supportsScript,
  visibleFields: template.visibleFields,
  contentOverrides,
  fieldOverrides,
  hiddenElementIds,
})

const applyDetailedFieldOverrides = (
  html: string,
  fieldOverrides: Record<string, string> | undefined,
) => {
  if (!fieldOverrides || Object.keys(fieldOverrides).length === 0) return html
  const body = parseTemplateBody(html)
  if (!body) return html

  let textIndex = 0
  let urlIndex = 0

  walkTextNodes(body, (textNode) => {
    const value = cleanText(textNode.textContent ?? '')
    if (!value) return

    textIndex += 1
    const override = fieldOverrides[getTextStableId(textNode)] ?? fieldOverrides[`text:${textIndex}`]
    if (override !== undefined) textNode.textContent = override
  })

  walkElements(body, (element) => {
    if (element.tagName.toLowerCase() !== 'a') return
    if (!element.hasAttribute('href')) return

    urlIndex += 1
    const override = fieldOverrides[getHrefStableId(element)] ?? fieldOverrides[`href:${urlIndex}`]
    if (override !== undefined) element.setAttribute('href', override)
  })

  return body.innerHTML
}

const applyHiddenElements = (html: string, hiddenElementIds: string[] = []) => {
  if (hiddenElementIds.length === 0) return html
  const body = parseTemplateBody(html)
  if (!body) return html
  const hidden = new Set(hiddenElementIds)
  let elementIndex = 0
  const elementsToRemove: Element[] = []

  walkElements(body, (element) => {
    if (element === body) return
    elementIndex += 1
    if (hidden.has(getElementStableId(element)) || hidden.has(`el:${elementIndex}`)) {
      elementsToRemove.push(element)
    }
  })

  elementsToRemove.forEach((element) => element.remove())

  return body.innerHTML
}

export const getHtmlWidgetTemplateHideableElements = (
  template: HtmlWidgetTemplate,
  content: HtmlWidgetTemplateContent = {},
  fieldOverrides: Record<string, string> = {},
) => {
  let html = ensureAcceptHook(template.html)
  html = applyDetailedFieldOverrides(html, fieldOverrides)
  html = applySimpleContentOverrides(html, content)
  const body = parseTemplateBody(html)
  if (!body) return []

  const result: Array<{ id: string; label: string }> = []
  walkElements(body, (element) => {
    if (element === body) return
    const text = cleanText(element.textContent ?? '')
    const label = text ? `${getElementGroup(element)}: ${text.slice(0, 48)}` : getElementGroup(element)
    result.push({ id: getElementStableId(element), label })
  })

  return result
}

const applySimpleContentOverrides = (
  html: string,
  content: HtmlWidgetTemplateContent,
) => {
  let next = html

  next = replaceFirstTagContent(next, 'h1', content.title)
  next = replaceFirstTagContent(next, 'h2', content.title)
  next = replaceFirstTagContent(next, 'h3', content.title)
  next = replaceFirstClassContent(next, 'plan-title', content.title)
  next = replaceFirstClassContent(next, 'card-name', content.title)
  next = replaceFirstClassContent(next, 'prize-desc', content.description)
  next = replaceFirstClassContent(next, 'desc', content.description)
  next = replaceFirstClassContent(next, 'sub', content.subtitle || content.description)
  next = replaceFirstClassContent(next, 'badge', content.badgeText)
  next = replaceFirstClassContent(next, 'tag', content.badgeText)
  next = replaceFirstClassContent(next, 'note', content.extraText)
  next = replaceFirstClassContent(next, 'safe', content.extraText)
  next = replaceActionText(next, 'itu-accept', content.buttonText)
  next = replaceActionText(next, 'itu-reject', content.rejectText)
  next = applyCtaAttrs(next, content)

  return next
}

export const generateHtmlWidgetTemplateHtml = (
  template: HtmlWidgetTemplate,
  content: HtmlWidgetTemplateContent = {},
  fieldOverrides: Record<string, string> = {},
  hiddenElementIds: string[] = [],
) => {
  let html = template.html

  html = ensureAcceptHook(html)
  html = applyDetailedFieldOverrides(html, fieldOverrides)
  html = applySimpleContentOverrides(html, content)
  html = applyHiddenElements(html, hiddenElementIds)

  if (!template.js.trim()) return html
  return `${html}\n<script>\n${template.js}\n</script>`
}

export const generateHtmlWidgetTemplateEditablePreviewHtml = (
  template: HtmlWidgetTemplate,
  content: HtmlWidgetTemplateContent = {},
  fieldOverrides: Record<string, string> = {},
  hiddenElementIds: string[] = [],
) => {
  let html = ensureAcceptHook(template.html)
  html = applyDetailedFieldOverrides(html, fieldOverrides)
  html = applySimpleContentOverrides(html, content)

  const body = parseTemplateBody(html)
  if (!body) return html

  let textIndex = 0
  walkElements(body, (element) => {
    if (element === body) return
    element.setAttribute('data-hide-element-id', getElementStableId(element))
  })

  walkTextNodes(body, (textNode) => {
    const value = cleanText(textNode.textContent ?? '')
    if (!value) return

    textIndex += 1
    const span = body.ownerDocument.createElement('span')
    span.setAttribute('data-edit-field-id', getTextStableId(textNode))
    span.setAttribute('data-edit-legacy-field-id', `text:${textIndex}`)
    span.setAttribute('contenteditable', 'true')
    span.setAttribute('spellcheck', 'false')
    span.textContent = textNode.textContent ?? ''
    textNode.replaceWith(span)
  })

  const hidden = new Set(hiddenElementIds)
  const elementsToRemove: Element[] = []
  let legacyElementIndex = 0
  walkElements(body, (element) => {
    if (element === body) return
    legacyElementIndex += 1
    if (hidden.has(getElementStableId(element)) || hidden.has(`el:${legacyElementIndex}`)) {
      elementsToRemove.push(element)
    }
  })
  elementsToRemove.forEach((element) => element.remove())

  const editableHtml = body.innerHTML
  if (!template.js.trim()) return editableHtml
  return `${editableHtml}\n<script>\n${template.js}\n</script>`
}

const stripTemplatePageCss = (css: string) =>
  css
    .replace(/(^|})\s*html\s*,\s*body\s*\{[^{}]*\}/gi, '$1')
    .replace(/(^|})\s*body\s*\{[^{}]*\}/gi, '$1')

const getUpsellMaxWidth = (template: HtmlWidgetTemplate) => {
  const byCategory: Record<HtmlWidgetTemplate['category'], number> = {
    botoes: 520,
    hero: 560,
    oferta: 440,
    popup: 420,
    contador: 520,
    premios: 400,
    depoimentos: 460,
  }

  if (template.id === 'banner-topo') return 600
  if (template.category === 'hero' && template.id.includes('contador')) return 540
  return byCategory[template.category]
}

const getUpsellFitCss = (template: HtmlWidgetTemplate) => {
  const maxWidth = getUpsellMaxWidth(template)

  return `

/* Ajuste de encaixe: estes modelos sao cards/banners de upsell, nao paginas inteiras. */
.hero,
.overlay,
.banner,
.popup,
.card,
.offer-box,
.showcase,
.cd-section,
.vagas-box,
.progress-card,
.prize-card,
.dep-card,
.testimonials,
.urgency-wrap,
.flash-banner,
.btn-group,
.btn-pair,
.row {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  max-width: ${maxWidth}px !important;
}

.hero,
.overlay,
.banner,
.popup,
.card,
.offer-box,
.showcase,
.cd-section,
.vagas-box,
.progress-card,
.prize-card,
.dep-card,
.testimonials,
.urgency-wrap,
.flash-banner {
  width: min(100%, ${maxWidth}px) !important;
  min-height: 0 !important;
  height: auto !important;
}

.hero {
  align-items: center !important;
  border-radius: 20px !important;
  overflow: hidden !important;
  padding: 24px 20px !important;
}

.hero::before {
  pointer-events: none !important;
}

.hero-inner,
.inner {
  max-width: 100% !important;
}

.overlay {
  position: relative !important;
  inset: auto !important;
  z-index: auto !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  background: transparent !important;
  backdrop-filter: none !important;
}

.popup {
  max-height: none !important;
  border-radius: 18px !important;
}

.banner,
.flash-banner {
  position: relative !important;
  inset: auto !important;
  border: 1px solid rgba(108, 99, 255, .28) !important;
  border-radius: 16px !important;
  padding: 14px 16px !important;
  flex-wrap: wrap !important;
}

.banner .left,
.banner .right {
  min-width: 0 !important;
}

.card,
.offer-box,
.showcase,
.cd-section,
.vagas-box,
.progress-card,
.prize-card,
.dep-card,
.testimonials {
  border-radius: 18px !important;
}

.card-header,
.popup-header,
.popup-bar {
  padding: 18px !important;
}

.card-body,
.popup-body,
.body,
.offer-body {
  padding: 18px !important;
}

.hero h1 {
  font-size: clamp(1.55rem, 4vw, 2.35rem) !important;
  margin-bottom: .85rem !important;
}

.hero .sub,
.sub {
  margin-bottom: 1.2rem !important;
}

.stats {
  gap: 1rem !important;
  margin-top: 1.5rem !important;
}

.stat-n,
.value,
.amt,
.amount {
  font-size: clamp(1.45rem, 6vw, 2.1rem) !important;
}

.big-num {
  font-size: clamp(3rem, 12vw, 4rem) !important;
}

.countdown {
  flex-wrap: wrap !important;
  gap: .5rem !important;
}

.cd-box,
.cd {
  min-width: 58px !important;
  padding: 10px 12px !important;
}

.cd-num,
.cd-n {
  font-size: clamp(1.45rem, 7vw, 2.15rem) !important;
}

.cd-sep {
  font-size: 1.5rem !important;
  padding-bottom: 12px !important;
}

.plans,
.grid,
.prizes-list {
  max-width: 100% !important;
}

.plans,
.grid {
  gap: 12px !important;
}

.btn-cta,
.btn-urgency,
.btn-main,
.btn-sec,
.btn,
.bp,
.plan-btn {
  max-width: 100% !important;
  white-space: normal !important;
  text-align: center !important;
}

.glow {
  max-width: 260px !important;
  max-height: 260px !important;
}

@media (max-width: 520px) {
  .hero,
  .banner,
  .popup,
  .card,
  .offer-box,
  .showcase,
  .cd-section,
  .vagas-box,
  .progress-card,
  .prize-card,
  .dep-card,
  .testimonials,
  .urgency-wrap,
  .flash-banner {
    width: 100% !important;
  }

  .hero {
    padding: 20px 16px !important;
  }

  .banner {
    align-items: flex-start !important;
  }

  .banner .right {
    width: 100% !important;
    justify-content: space-between !important;
    gap: .5rem !important;
  }

  .body {
    flex-direction: column !important;
  }

  .stats .divider,
  .countdown .cd-sep {
    display: none !important;
  }

  .cd-box,
  .cd {
    min-width: 54px !important;
    padding: 9px 10px !important;
  }
}
`
}

export const generateHtmlWidgetTemplateCss = (template: HtmlWidgetTemplate) =>
  `${stripTemplatePageCss(template.css)}${getUpsellFitCss(template)}`
