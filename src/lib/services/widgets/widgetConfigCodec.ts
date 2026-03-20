import type {
  CreateWidgetPayload,
  UpdateWidgetPayload,
  WidgetConfig,
  WidgetFormPayload,
  UpdateWidgetFormPayload,
} from './widgets.types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const slugify = (value: string): string => value
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const buildConfig = (config: unknown, fallback: WidgetConfig): WidgetConfig => {
  if (!isRecord(config)) return fallback

  const name = typeof config.name === 'string' && config.name.trim() ? config.name.trim() : fallback.name
  const slug = typeof config.slug === 'string' && config.slug.trim() ? config.slug.trim() : slugify(name) || fallback.slug
  const attributes = isRecord(config.attributes)
    ? config.attributes
    : Object.fromEntries(Object.entries(config).filter(([key]) => !['name', 'slug', 'attributes'].includes(key)))

  return { name, slug, attributes }
}

export const serializeWidgetConfig = (config: WidgetConfig): WidgetConfig => ({
  name: typeof config?.name === 'string' && config.name.trim() ? config.name.trim() : 'Widget padrão',
  slug: typeof config?.slug === 'string' && config.slug.trim() ? config.slug.trim() : slugify(typeof config?.name === 'string' ? config.name : 'widget-padrao'),
  attributes: isRecord(config?.attributes) ? config.attributes : {},
})

export const parseWidgetConfig = (config: unknown, fallback: WidgetConfig = { name: 'Widget padrão', slug: 'widget-padrao', attributes: {} }): WidgetConfig => {
  if (typeof config === 'string') {
    try {
      const parsed = JSON.parse(config)
      return buildConfig(parsed, fallback)
    } catch {
      return fallback
    }
  }

  return buildConfig(config, fallback)
}

export const toCreateWidgetPayload = (payload: WidgetFormPayload): CreateWidgetPayload => ({
  ...payload,
  config: serializeWidgetConfig(payload.config),
})

export const toUpdateWidgetPayload = (payload: UpdateWidgetFormPayload): UpdateWidgetPayload => {
  const { config, ...rest } = payload

  return {
    ...rest,
    ...(config !== undefined ? { config: serializeWidgetConfig(config) } : {}),
  }
}
