import { useCallback, useEffect, useState } from 'react'
import { getDisplayLocations } from '../../../../lib/services/campaigns/campaigns.service'
import { getSegments } from '../../../../lib/services/segments/segments.service'
import type { Segment } from '../../../../lib/services/segments/segments.types'
import type { DisplayLocationsResponse } from '../../../../lib/services/campaigns/campaigns.types'
import type { Campaign } from '../../../../lib/services/campaigns/campaigns.types'
import { DEFAULT_FORM_STATE } from '../../create/constants'
import type { CampaignFormColors, CampaignFormState, DisplayRenderType } from '../../create/types'

const toDateInputValue = (value: string | null) => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

const buildLocationRules = (locations: string[], renderType: DisplayRenderType | null) => {
  if (!renderType) return []
  return locations.map((location) => ({ location, render_type: renderType }))
}

const campaignToFormState = (campaign: Campaign): CampaignFormState => ({
  ...DEFAULT_FORM_STATE,
  name: campaign.name,
  is_active: campaign.is_active,
  priority: campaign.priority,
  display_locations: campaign.display_locations ?? [],
  widget_render_type: (campaign.display_locations?.length ?? 0) > 0 ? 'widget_modal' : null,
  segment_ids: campaign.segment_ids ?? [],
  domains: campaign.domains ?? [],
  headline: campaign.headline ?? '',
  description: campaign.description ?? '',
  image_url: campaign.image_url ?? '',
  video_url: campaign.video_url ?? '',
  cta_text: campaign.cta_text ?? '',
  cta_link: campaign.cta_link ?? '',
  cta_new_tab: campaign.cta_new_tab,
  start_date: toDateInputValue(campaign.start_date),
  start_time: campaign.start_time ?? '00:00',
  end_date: toDateInputValue(campaign.end_date),
  end_time: campaign.end_time ?? '23:59',
  active_days: campaign.active_days && campaign.active_days.length > 0 ? campaign.active_days : DEFAULT_FORM_STATE.active_days,
  active_hours: campaign.active_hours && campaign.active_hours.length > 0 ? campaign.active_hours : DEFAULT_FORM_STATE.active_hours,
  cooldown_minutes: campaign.cooldown_minutes || DEFAULT_FORM_STATE.cooldown_minutes,
  max_per_session: campaign.max_per_session || DEFAULT_FORM_STATE.max_per_session,
  max_per_day: campaign.max_per_day || DEFAULT_FORM_STATE.max_per_day,
  max_total: campaign.max_total || DEFAULT_FORM_STATE.max_total,
  block_after_conversion_days: campaign.block_after_conversion_days || DEFAULT_FORM_STATE.block_after_conversion_days,
  widget_css: campaign.widget_css ?? '',
  widget_html: campaign.widget_html ?? '',
  display_location_rules: buildLocationRules(
    campaign.display_locations ?? [],
    (campaign.display_locations?.length ?? 0) > 0 ? 'widget_modal' : null,
  ),
})

export const useEditCampaignForm = (campaign: Campaign | null) => {
  const [form, setForm] = useState<CampaignFormState>(
    campaign ? campaignToFormState(campaign) : DEFAULT_FORM_STATE,
  )
  const [segments, setSegments] = useState<Segment[]>([])
  const [displayLocationsMap, setDisplayLocationsMap] = useState<DisplayLocationsResponse>({})
  const [resourcesLoading, setResourcesLoading] = useState(true)

  useEffect(() => {
    if (campaign) {
      setForm(campaignToFormState(campaign))
    }
  }, [campaign])

  useEffect(() => {
    let cancelled = false

    const loadResources = async () => {
      setResourcesLoading(true)
      try {
        const [locationsData, segmentsData] = await Promise.allSettled([
          getDisplayLocations(),
          getSegments(1),
        ])

        if (cancelled) return

        if (locationsData.status === 'fulfilled') {
          setDisplayLocationsMap(locationsData.value)
        }
        if (segmentsData.status === 'fulfilled') {
          setSegments(segmentsData.value.data)
        }
      } finally {
        if (!cancelled) setResourcesLoading(false)
      }
    }

    loadResources()
    return () => {
      cancelled = true
    }
  }, [])

  const set = useCallback(<K extends keyof CampaignFormState>(
    key: K,
    value: CampaignFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const toggleDisplayLocation = useCallback((key: string) => {
    setForm((prev) => {
      const display_locations = prev.display_locations.includes(key)
        ? prev.display_locations.filter((k) => k !== key)
        : [...prev.display_locations, key]

      return {
        ...prev,
        display_locations,
        display_location_rules: buildLocationRules(display_locations, prev.widget_render_type),
      }
    })
  }, [])

  const setWidgetRenderType = useCallback((renderType: DisplayRenderType) => {
    setForm((prev) => ({
      ...prev,
      widget_render_type: renderType,
      display_location_rules: buildLocationRules(prev.display_locations, renderType),
    }))
  }, [])

  const toggleSegment = useCallback((id: number) => {
    setForm((prev) => ({
      ...prev,
      segment_ids: prev.segment_ids.includes(id)
        ? prev.segment_ids.filter((s) => s !== id)
        : [...prev.segment_ids, id],
    }))
  }, [])

  const toggleDay = useCallback((day: number) => {
    setForm((prev) => ({
      ...prev,
      active_days: prev.active_days.includes(day)
        ? prev.active_days.filter((d) => d !== day)
        : [...prev.active_days, day],
    }))
  }, [])

  const toggleHour = useCallback((hour: number) => {
    setForm((prev) => ({
      ...prev,
      active_hours: prev.active_hours.includes(hour)
        ? prev.active_hours.filter((h) => h !== hour)
        : [...prev.active_hours, hour],
    }))
  }, [])

  const setAllHours = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      active_hours: Array.from({ length: 24 }, (_, i) => i),
    }))
  }, [])

  const clearHours = useCallback(() => {
    setForm((prev) => ({ ...prev, active_hours: [] }))
  }, [])

  const setColors = useCallback((colors: CampaignFormColors) => {
    setForm((prev) => ({ ...prev, colors }))
  }, [])

  const setColor = useCallback((key: keyof CampaignFormColors, value: string) => {
    setForm((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }))
  }, [])

  return {
    form,
    set,
    segments,
    displayLocationsMap,
    resourcesLoading,
    toggleDisplayLocation,
    toggleSegment,
    toggleDay,
    toggleHour,
    setAllHours,
    clearHours,
    setColors,
    setColor,
    setWidgetRenderType,
  }
}
