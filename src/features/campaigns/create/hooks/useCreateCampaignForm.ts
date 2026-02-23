import { useCallback, useEffect, useState } from 'react'
import { getDisplayLocations } from '../../../../lib/services/campaigns/campaigns.service'
import { getSegments } from '../../../../lib/services/segments/segments.service'
import type { Segment } from '../../../../lib/services/segments/segments.types'
import type { DisplayLocationsResponse } from '../../../../lib/services/campaigns/campaigns.types'
import { DEFAULT_FORM_STATE } from '../constants'
import type { CampaignFormColors, CampaignFormState } from '../types'

export const useCreateCampaignForm = () => {
  const [form, setForm] = useState<CampaignFormState>(DEFAULT_FORM_STATE)
  const [segments, setSegments] = useState<Segment[]>([])
  const [displayLocationsMap, setDisplayLocationsMap] = useState<DisplayLocationsResponse>({})
  const [resourcesLoading, setResourcesLoading] = useState(true)

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
    return () => { cancelled = true }
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
  }
}
