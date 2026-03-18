import { useCallback, useState } from 'react'
import type { Campaign } from '../../../lib/services/campaigns/campaigns.types'
import { DEFAULT_WIDGET_STATE } from '../constants'
import type {
  CardTemplate,
  WidgetColors,
  WidgetFormState,
  WidgetLayout,
  WidgetSpacing,
  WidgetTypography,
} from '../types'
import { decodeSettingsFromCss } from '../utils/widgetSettingsCodec'

const campaignToWidgetState = (campaign: Campaign): WidgetFormState => {
  const saved = decodeSettingsFromCss(campaign.widget_css)

  return {
    ...DEFAULT_WIDGET_STATE,
    name: campaign.name ?? '',
    headline: campaign.headline ?? '',
    description: campaign.description ?? '',
    media_url: campaign.video_url ?? campaign.image_url ?? '',
    cta_text: campaign.cta_text ?? '',
    cta_link: campaign.cta_link ?? '',
    cta_new_tab: campaign.cta_new_tab ?? false,
    widget_css: campaign.widget_css ?? '',
    widget_html: campaign.widget_html ?? '',
    ...(saved && {
      subtitle: saved.subtitle,
      badge: saved.badge,
      media_url: saved.media_url || campaign.video_url || campaign.image_url || '',
      cta_link: saved.cta_link || campaign.cta_link || '',
      cta_new_tab: saved.cta_new_tab,
      colors: saved.colors,
      spacing: saved.spacing,
      typography: saved.typography,
      layout: saved.layout,
      template: saved.template,
    }),
  }
}

export const useWidgetEditor = (campaign: Campaign | null) => {
  const [form, setForm] = useState<WidgetFormState>(
    campaign ? campaignToWidgetState(campaign) : DEFAULT_WIDGET_STATE,
  )
  const [isDirty, setIsDirty] = useState(false)




  const update = useCallback(<K extends keyof WidgetFormState>(
    key: K,
    value: WidgetFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }, [])

  const setColor = useCallback((key: keyof WidgetColors, value: string) => {
    setForm((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }))
    setIsDirty(true)
  }, [])

  const setAllColors = useCallback((colors: Partial<WidgetColors>) => {
    setForm((prev) => ({ ...prev, colors: { ...prev.colors, ...colors } }))
    setIsDirty(true)
  }, [])

  const setSpacing = useCallback(<K extends keyof WidgetSpacing>(key: K, value: WidgetSpacing[K]) => {
    setForm((prev) => ({ ...prev, spacing: { ...prev.spacing, [key]: value } }))
    setIsDirty(true)
  }, [])

  const setTypography = useCallback(<K extends keyof WidgetTypography>(key: K, value: WidgetTypography[K]) => {
    setForm((prev) => ({ ...prev, typography: { ...prev.typography, [key]: value } }))
    setIsDirty(true)
  }, [])

  const setLayout = useCallback(<K extends keyof WidgetLayout>(key: K, value: WidgetLayout[K]) => {
    setForm((prev) => ({ ...prev, layout: { ...prev.layout, [key]: value } }))
    setIsDirty(true)
  }, [])

  const setTemplate = useCallback((template: CardTemplate) => {
    setForm((prev) => {
      const next = { ...prev, template }

      switch (template) {
        case 'minimal':
          next.spacing = { padding: 22, gap: 10, borderRadius: 8 }
          next.layout = { ...prev.layout, shadowIntensity: 'none', borderWidth: 0, imagePosition: 'top' }
          next.typography = { ...prev.typography, headlineSize: 15, headlineWeight: '600', descriptionSize: 12 }
          next.colors = { ...prev.colors, bg: '#ffffff', text: '#334155', button: '#334155', buttonText: '#ffffff', border: '#e2e8f0', accent: '#94a3b8' }
          break
        case 'bold':
          next.spacing = { padding: 30, gap: 20, borderRadius: 22 }
          next.typography = { ...prev.typography, headlineSize: 22, headlineWeight: '800', descriptionSize: 14, ctaSize: 14 }
          next.layout = { ...prev.layout, shadowIntensity: 'xl', borderWidth: 0, imagePosition: 'top' }
          next.colors = { ...prev.colors, bg: '#0f172a', text: '#f8fafc', button: '#f97316', buttonText: '#ffffff', border: '#1e293b', accent: '#fb923c' }
          break
        case 'compact':
          next.spacing = { padding: 14, gap: 10, borderRadius: 12 }
          next.layout = { ...prev.layout, imagePosition: 'left', imageHeight: 100, shadowIntensity: 'md', borderWidth: 1 }
          next.typography = { ...prev.typography, headlineSize: 14, descriptionSize: 12, ctaSize: 12 }
          next.colors = { ...prev.colors, bg: '#f8fafc', text: '#1e293b', button: '#2563eb', buttonText: '#ffffff', border: '#cbd5e1', accent: '#60a5fa' }
          break
        case 'banner':
          next.spacing = { padding: 18, gap: 14, borderRadius: 10 }
          next.layout = { ...prev.layout, imagePosition: 'left', imageHeight: 120, shadowIntensity: 'sm', borderWidth: 1 }
          next.typography = { ...prev.typography, headlineSize: 18, descriptionSize: 12, ctaSize: 13 }
          next.colors = { ...prev.colors, bg: '#fff7ed', text: '#7c2d12', button: '#ea580c', buttonText: '#ffffff', border: '#fed7aa', accent: '#fb923c' }
          break
        case 'floating':
          next.spacing = { padding: 26, gap: 14, borderRadius: 24 }
          next.layout = { ...prev.layout, shadowIntensity: 'xl', borderWidth: 0, imagePosition: 'top' }
          next.typography = { ...prev.typography, headlineSize: 17, headlineWeight: '700' }
          next.colors = { ...prev.colors, bg: '#ecfeff', text: '#134e4a', button: '#0d9488', buttonText: '#ffffff', border: '#99f6e4', accent: '#2dd4bf' }
          break
        default:
          next.spacing = { padding: 24, gap: 16, borderRadius: 16 }
          next.layout = { ...prev.layout, shadowIntensity: 'lg', borderWidth: 1, imagePosition: 'top' }
          next.typography = { ...prev.typography, headlineSize: 16, headlineWeight: '700', descriptionSize: 13, ctaSize: 13 }
          next.colors = { ...prev.colors, bg: '#ffffff', text: '#1f2937', button: '#2563eb', buttonText: '#ffffff', border: '#e2e8f0', accent: '#3b82f6' }
          break
      }

      return next
    })
    setIsDirty(true)
  }, [])

  const markClean = useCallback(() => setIsDirty(false), [])

  return {
    form,
    isDirty,
    update,
    setColor,
    setAllColors,
    setSpacing,
    setTypography,
    setLayout,
    setTemplate,
    markClean,
  }
}
