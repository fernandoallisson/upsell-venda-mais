import { useCallback, useEffect, useState } from 'react'
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
    image_url: campaign.image_url ?? '',
    cta_text: campaign.cta_text ?? '',
    widget_css: campaign.widget_css ?? '',
    widget_html: campaign.widget_html ?? '',
    ...(saved && {
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

  useEffect(() => {
    if (campaign) {
      setForm(campaignToWidgetState(campaign))
      setIsDirty(false)
    }
  }, [campaign])

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
          next.spacing = { padding: 24, gap: 12, borderRadius: 8 }
          next.layout = { ...prev.layout, shadowIntensity: 'none', borderWidth: 0, imagePosition: 'top' }
          break
        case 'bold':
          next.spacing = { padding: 32, gap: 20, borderRadius: 20 }
          next.typography = { ...prev.typography, headlineSize: 20, headlineWeight: '800' }
          next.layout = { ...prev.layout, shadowIntensity: 'xl', borderWidth: 0, imagePosition: 'top' }
          break
        case 'compact':
          next.spacing = { padding: 16, gap: 12, borderRadius: 12 }
          next.layout = { ...prev.layout, imagePosition: 'left', imageHeight: 100, shadowIntensity: 'md', borderWidth: 1 }
          next.typography = { ...prev.typography, headlineSize: 14, descriptionSize: 12 }
          break
        case 'banner':
          next.spacing = { padding: 20, gap: 16, borderRadius: 12 }
          next.layout = { ...prev.layout, imagePosition: 'left', imageHeight: 120, shadowIntensity: 'sm', borderWidth: 1 }
          break
        case 'floating':
          next.spacing = { padding: 24, gap: 16, borderRadius: 24 }
          next.layout = { ...prev.layout, shadowIntensity: 'xl', borderWidth: 0, imagePosition: 'top' }
          break
        default:
          next.spacing = { padding: 24, gap: 16, borderRadius: 16 }
          next.layout = { ...prev.layout, shadowIntensity: 'lg', borderWidth: 1, imagePosition: 'top' }
          next.typography = { ...prev.typography, headlineSize: 16, headlineWeight: '700' }
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
