import type {
  CreateWidgetPayload,
  UpdateWidgetPayload,
  WidgetConfig,
  WidgetFormPayload,
  UpdateWidgetFormPayload,
} from './widgets.types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const serializeWidgetConfig = (config: WidgetConfig): WidgetConfig => (config && typeof config === 'object' ? config : {})

export const parseWidgetConfig = (config: unknown, fallback: WidgetConfig = {}): WidgetConfig => {
  if (typeof config === 'string') {
    try {
      const parsed = JSON.parse(config)
      return isRecord(parsed) ? parsed : fallback
    } catch {
      return fallback
    }
  }

  if (isRecord(config)) {
    return config
  }

  return fallback
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
