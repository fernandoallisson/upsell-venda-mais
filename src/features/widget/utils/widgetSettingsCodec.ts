import { DEFAULT_WIDGET_STATE } from '../constants'
import type {
  CardTemplate,
  WidgetColors,
  WidgetFormState,
  WidgetLayout,
  WidgetSpacing,
  WidgetTypography,
} from '../types'

const SETTINGS_PREFIX = '/* @widget-settings '
const SETTINGS_SUFFIX = ' */'

type PersistedSettings = {
  colors: WidgetColors
  spacing: WidgetSpacing
  typography: WidgetTypography
  layout: WidgetLayout
  template: CardTemplate
}

export const encodeSettingsIntoCss = (form: WidgetFormState, css: string): string => {
  const settings: PersistedSettings = {
    colors: form.colors,
    spacing: form.spacing,
    typography: form.typography,
    layout: form.layout,
    template: form.template,
  }

  return `${SETTINGS_PREFIX}${JSON.stringify(settings)}${SETTINGS_SUFFIX}\n${css}`
}

const isValidColors = (v: unknown): v is WidgetColors =>
  typeof v === 'object' && v !== null &&
  typeof (v as Record<string, unknown>).bg === 'string' &&
  typeof (v as Record<string, unknown>).text === 'string' &&
  typeof (v as Record<string, unknown>).button === 'string' &&
  typeof (v as Record<string, unknown>).buttonText === 'string'

const isValidSpacing = (v: unknown): v is WidgetSpacing =>
  typeof v === 'object' && v !== null &&
  typeof (v as Record<string, unknown>).padding === 'number' &&
  typeof (v as Record<string, unknown>).gap === 'number' &&
  typeof (v as Record<string, unknown>).borderRadius === 'number'

const isValidTypography = (v: unknown): v is WidgetTypography =>
  typeof v === 'object' && v !== null &&
  typeof (v as Record<string, unknown>).headlineSize === 'number' &&
  typeof (v as Record<string, unknown>).descriptionSize === 'number'

const isValidLayout = (v: unknown): v is WidgetLayout =>
  typeof v === 'object' && v !== null &&
  typeof (v as Record<string, unknown>).imagePosition === 'string' &&
  typeof (v as Record<string, unknown>).imageHeight === 'number'

const VALID_TEMPLATES: CardTemplate[] = ['classic', 'minimal', 'bold', 'compact', 'banner', 'floating']

export const decodeSettingsFromCss = (cssRaw: string | null | undefined): PersistedSettings | null => {
  if (!cssRaw) return null

  const firstLine = cssRaw.split('\n')[0]
  if (!firstLine.startsWith(SETTINGS_PREFIX) || !firstLine.endsWith(SETTINGS_SUFFIX)) {
    return null
  }

  try {
    const jsonStr = firstLine.slice(SETTINGS_PREFIX.length, -SETTINGS_SUFFIX.length)
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>

    if (
      !isValidColors(parsed.colors) ||
      !isValidSpacing(parsed.spacing) ||
      !isValidTypography(parsed.typography) ||
      !isValidLayout(parsed.layout) ||
      !VALID_TEMPLATES.includes(parsed.template as CardTemplate)
    ) {
      return null
    }

    return {
      colors: { ...DEFAULT_WIDGET_STATE.colors, ...(parsed.colors as WidgetColors) },
      spacing: { ...DEFAULT_WIDGET_STATE.spacing, ...(parsed.spacing as WidgetSpacing) },
      typography: { ...DEFAULT_WIDGET_STATE.typography, ...(parsed.typography as WidgetTypography) },
      layout: { ...DEFAULT_WIDGET_STATE.layout, ...(parsed.layout as WidgetLayout) },
      template: parsed.template as CardTemplate,
    }
  } catch {
    return null
  }
}

export const stripSettingsFromCss = (cssRaw: string): string => {
  const firstLine = cssRaw.split('\n')[0]
  if (firstLine.startsWith(SETTINGS_PREFIX) && firstLine.endsWith(SETTINGS_SUFFIX)) {
    return cssRaw.slice(firstLine.length + 1)
  }
  return cssRaw
}
