import type { CreateCampaignPayload } from '../../../lib/services/campaigns/campaigns.types'
import type { CampaignFormState } from './types'

const toApiTime = (time: string, fallback: string) => {
  const trimmed = time.trim()
  if (!trimmed) return fallback
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed

  const withSeconds = trimmed.match(/^(\d{2}:\d{2}):\d{2}$/)
  if (withSeconds) return withSeconds[1]

  return fallback
}

export const validateCampaignForm = (form: CampaignFormState): string | null => {
  if (form.display_locations.length > 0 && !form.widget_render_type) {
    return 'Selecione o tipo de exibição da campanha.'
  }

  if (form.display_locations.length > 0 && !form.widget_html.trim()) {
    return 'Informe o Widget HTML para os locais selecionados.'
  }

  if (form.display_locations.length > 0 && !form.widget_css.trim()) {
    return 'Informe o Widget CSS para os locais selecionados.'
  }

  return null
}

export const buildCampaignPayload = (form: CampaignFormState): CreateCampaignPayload => {
  const payload: CreateCampaignPayload = {
    name: form.name,
    is_active: form.is_active,
    priority: form.priority,
  }

  if (form.display_locations.length > 0) payload.display_locations = form.display_locations
  if (form.segment_ids.length > 0) payload.segment_ids = form.segment_ids
  if (form.domains.length > 0) payload.domains = form.domains

  if (form.headline) payload.headline = form.headline
  if (form.description) payload.description = form.description
  if (form.image_url) payload.image_url = form.image_url
  if (form.video_url) payload.video_url = form.video_url
  if (form.cta_text) payload.cta_text = form.cta_text
  if (form.cta_link) payload.cta_link = form.cta_link
  payload.cta_new_tab = form.cta_new_tab

  if (form.start_date) {
    payload.start_date = form.start_date
    payload.start_time = toApiTime(form.start_time, '00:00')
  }
  if (form.end_date) {
    payload.end_date = form.end_date
    payload.end_time = toApiTime(form.end_time, '23:59')
  }

  payload.active_days = form.active_days
  payload.active_hours = form.active_hours

  payload.cooldown_minutes = form.cooldown_minutes
  payload.max_per_session = form.max_per_session
  payload.max_per_day = form.max_per_day
  payload.max_total = form.max_total
  payload.block_after_conversion_days = form.block_after_conversion_days

  if (form.display_locations.length > 0) {
    payload.widget_css = form.widget_css
    payload.widget_html = form.widget_html
  }

  return payload
}
