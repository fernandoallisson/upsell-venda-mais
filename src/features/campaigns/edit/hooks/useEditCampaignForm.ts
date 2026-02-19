import { useCallback, useEffect, useState } from 'react'
import { getDisplayLocations } from '../../../../lib/services/campaigns/campaigns.service'
import { getSegments } from '../../../../lib/services/segments/segments.service'
import type { Segment } from '../../../../lib/services/segments/segments.types'
import type { DisplayLocationsResponse } from '../../../../lib/services/campaigns/campaigns.types'
import type { Campaign } from '../../../../lib/services/campaigns/campaigns.types'
import { DEFAULT_FORM_STATE } from '../../create/constants'
import type { CampaignFormColors, CampaignFormState } from '../../create/types'

const toDateInputValue = (value: string) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

const campaignToFormState = (campaign: Campaign): CampaignFormState => ({
  ...DEFAULT_FORM_STATE,
  name: campaign.name,
  is_active: campaign.is_active,
  priority: campaign.priority,
  start_date: toDateInputValue(campaign.start_date),
  end_date: toDateInputValue(campaign.end_date),
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
    setForm((prev) => ({
      ...prev,
      display_locations: prev.display_locations.includes(key)
        ? prev.display_locations.filter((k) => k !== key)
        : [...prev.display_locations, key],
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

  const toggleDay = useCallback((day: string) => {
    setForm((prev) => ({
      ...prev,
      active_days: prev.active_days.includes(day)
        ? prev.active_days.filter((d) => d !== day)
        : [...prev.active_days, day],
    }))
  }, [])

  const toggleHour = useCallback((hour: string) => {
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
      active_hours: Array.from({ length: 24 }, (_, i) => String(i)),
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
  }
}
