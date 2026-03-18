export type CampaignFormColors = {
  bg: string
  text: string
  button: string
  buttonText: string
}

export type CampaignFormState = {
  name: string
  is_active: boolean
  segment_ids: number[]
  display_locations: string[]
  display_location_rules: CampaignDisplayLocation[]
  widget_render_type: DisplayRenderType | null
  priority: number

  headline: string
  description: string
  image_url: string
  video_url: string
  cta_text: string
  cta_link: string
  cta_new_tab: boolean

  start_date: string
  start_time: string
  end_date: string
  end_time: string
  active_days: number[]
  active_hours: number[]
  domains: string[]

  cooldown_minutes: number
  max_per_session: number
  max_per_day: number
  max_total: number
  block_after_conversion_days: number

  widget_preset_id: number | null
  widget_css: string
  widget_html: string
  colors: CampaignFormColors
}

export type DisplayRenderType = 'widget_modal' | 'div_inline'

export type CampaignDisplayLocation = {
  location: string
  render_type: DisplayRenderType
}

export type DisplayLocationMeta = {
  key: string
  label: string
  description: string
  icon: string
}
