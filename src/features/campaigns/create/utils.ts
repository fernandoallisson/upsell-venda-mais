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

  return null
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const buildWidgetTemplate = (form: CampaignFormState) => {
  const title = escapeHtml(form.headline || 'Oferta Especial')
  const description = escapeHtml(form.description || 'Aproveite esta oferta exclusiva por tempo limitado.')
  const ctaText = escapeHtml(form.cta_text || 'Comprar Agora')
  const ctaHref = escapeHtml(form.cta_link || '#')

  const imageHtml = form.image_url
    ? `<img class="upsell-widget__image" src="${escapeHtml(form.image_url)}" alt="Oferta" />`
    : ''

  const target = form.cta_new_tab ? ' target="_blank" rel="noopener noreferrer"' : ''

  const widget_html = `<div class="upsell-widget upsell-widget--${form.widget_render_type ?? 'widget_modal'}">\n  ${imageHtml}\n  <div class="upsell-widget__content">\n    <p class="upsell-widget__title">${title}</p>\n    <p class="upsell-widget__description">${description}</p>\n    <a class="upsell-widget__cta" href="${ctaHref}"${target}>${ctaText}</a>\n  </div>\n</div>`

  const widget_css = `.upsell-widget {\n  overflow: hidden;\n  border-radius: 16px;\n  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);\n  background: ${form.colors.bg};\n  color: ${form.colors.text};\n  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n}\n\n.upsell-widget__image {\n  display: block;\n  width: 100%;\n  max-height: 220px;\n  object-fit: cover;\n}\n\n.upsell-widget__content {\n  padding: 20px;\n}\n\n.upsell-widget__title {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 700;\n  line-height: 1.3;\n}\n\n.upsell-widget__description {\n  margin: 8px 0 0;\n  opacity: 0.8;\n  font-size: 14px;\n  line-height: 1.45;\n}\n\n.upsell-widget__cta {\n  margin-top: 14px;\n  border-radius: 10px;\n  background: ${form.colors.button};\n  color: ${form.colors.buttonText};\n  display: inline-flex;\n  min-height: 40px;\n  padding: 0 16px;\n  align-items: center;\n  justify-content: center;\n  text-decoration: none;\n  font-weight: 600;\n  font-size: 13px;\n}`

  return { widget_html, widget_css }
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
    const { widget_html, widget_css } = buildWidgetTemplate(form)
    payload.widget_css = widget_css
    payload.widget_html = widget_html
  }

  return payload
}
