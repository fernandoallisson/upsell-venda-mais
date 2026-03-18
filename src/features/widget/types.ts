export type WidgetColors = {
  bg: string
  text: string
  button: string
  buttonText: string
  border: string
  shadow: string
  accent: string
}

export type WidgetSpacing = {
  padding: number
  gap: number
  borderRadius: number
}

export type WidgetTypography = {
  headlineSize: number
  descriptionSize: number
  ctaSize: number
  headlineWeight: string
  descriptionWeight: string
}

export type WidgetLayout = {
  imagePosition: 'top' | 'left' | 'right' | 'none'
  imageHeight: number
  showDismiss: boolean
  shadowIntensity: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  borderWidth: number
}

export type CardTemplate = 'classic' | 'minimal' | 'bold' | 'compact' | 'banner' | 'floating'

export type WidgetFormState = {
  name: string
  headline: string
  subtitle: string
  description: string
  badge: string
  media_url: string
  cta_text: string
  cta_link: string
  cta_new_tab: boolean
  colors: WidgetColors
  spacing: WidgetSpacing
  typography: WidgetTypography
  layout: WidgetLayout
  template: CardTemplate
  widget_css: string
  widget_html: string
}
