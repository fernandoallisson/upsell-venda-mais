import type { MediaType } from '../types/widgetTemplate'

export const htmlWidgetTemplateCategoryOptions = [
  'botoes',
  'hero',
  'oferta',
  'popup',
  'contador',
  'premios',
  'depoimentos',
] as const

export type HtmlWidgetTemplateCategory = (typeof htmlWidgetTemplateCategoryOptions)[number]

export type HtmlWidgetVisibleFields = {
  showTitle: boolean
  showSubtitle: boolean
  showDescription: boolean
  showButton: boolean
  showComplementaryText: boolean
  showBadge: boolean
  showMedia: boolean
  mediaType: MediaType
}

export type HtmlWidgetTemplate = {
  id: string
  name: string
  description: string
  category: HtmlWidgetTemplateCategory
  categoryLabel: string
  html: string
  css: string
  js: string
  supportsScript: boolean
  visibleFields: HtmlWidgetVisibleFields
}

export type HtmlWidgetTemplateConfig = {
  widgetEngine: 'html-template'
  templateId: string
  templateCategory: HtmlWidgetTemplateCategory
  supportsScript: boolean
  visibleFields: HtmlWidgetVisibleFields
  contentOverrides?: HtmlWidgetTemplateContent
  fieldOverrides?: Record<string, string>
  hiddenElementIds?: string[]
}

export type HtmlWidgetTemplateContent = {
  title?: string
  subtitle?: string
  description?: string
  buttonText?: string
  rejectText?: string
  badgeText?: string
  extraText?: string
  ctaLink?: string
  ctaNewTab?: boolean
}

export type HtmlWidgetEditableField = {
  id: string
  label: string
  group: string
  type: 'text' | 'long-text' | 'url'
  defaultValue: string
}
