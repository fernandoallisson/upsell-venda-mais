import type { CSSProperties } from 'react'
import { layoutPresetDefinitions } from './layoutPresetDefinitions'
import { styleVariantDefinitions } from './styleVariantDefinitions'
import type { WidgetVisualConfig } from '../types/widgetTemplate'

export type WidgetRenderMode = 'full' | 'preview' | 'thumbnail'

const shadowMap: Record<WidgetVisualConfig['shadow'], string> = {
  none: 'none',
  sm: '0 2px 10px rgba(15,23,42,.12)',
  md: '0 10px 28px rgba(15,23,42,.18)',
  lg: '0 18px 44px rgba(15,23,42,.28)',
}

export const getWidgetLayoutDefinition = (layout: WidgetVisualConfig['layout']) => layoutPresetDefinitions[layout]
export const getWidgetVariantDefinition = (variant: WidgetVisualConfig['variant']) => styleVariantDefinitions[variant]

export const getWidgetComputedStyles = (
  config: WidgetVisualConfig,
  mode: WidgetRenderMode,
  viewport: 'desktop' | 'mobile' = 'desktop',
): {
  surfaceStyle: CSSProperties
  mediaStyle: CSSProperties
  buttonStyle: CSSProperties
} => {
  const compact = mode === 'thumbnail'
  const minHeight = compact ? Math.max(96, Math.round(config.minHeight * 0.52)) : config.layout === 'toast' ? 110 : config.minHeight

  const responsivePreview = mode !== 'full'

  const surfaceStyle: CSSProperties = {
    width: responsivePreview ? '100%' : `${config.width}px`,
    maxWidth: responsivePreview ? `${config.width}px` : `${config.width}px`,
    minHeight,
    margin: '0 auto',
    borderRadius: config.layout === 'banner' ? 999 : config.borderRadius,
    border: `1px solid ${config.borderColor}`,
    boxShadow: shadowMap[config.shadow],
    padding:
      config.layout === 'toast'
        ? Math.max(14, Math.round(config.padding * 0.65))
        : compact
          ? Math.min(config.padding, 14)
          : config.padding,
    background:
      config.variant === 'glass'
        ? 'linear-gradient(135deg, rgba(56,189,248,.25), rgba(99,102,241,.25))'
        : config.backgroundColor,
    color: config.textColor,
  }

  const mediaStyle: CSSProperties = {
    width: layoutPresetDefinitions[config.layout].supportsMediaSize
      ? viewport === 'mobile'
        ? `${Math.min(58, Math.max(32, config.mediaSize))}%`
        : `${Math.min(60, Math.max(20, config.mediaSize))}%`
      : '100%',
    minHeight: compact ? 80 : config.layout === 'toast' ? 72 : 140,
    borderRadius: Math.max(config.borderRadius - 4, 10),
  }

  const buttonStyle: CSSProperties = {
    backgroundColor: config.buttonColor,
    width: config.buttonFullWidth ? '100%' : 'fit-content',
  }

  return { surfaceStyle, mediaStyle, buttonStyle }
}
