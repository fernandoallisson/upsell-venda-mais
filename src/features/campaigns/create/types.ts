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

  widget_css: string
  widget_html: string
  colors: CampaignFormColors
}

export type DisplayLocationMeta = {
  key: string
  label: string
  widgetType: 'Widget Modal' | 'Div Inline'
  description: string
  icon: string
}
