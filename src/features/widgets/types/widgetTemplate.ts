export const layoutOptions = [
  'media-left',
  'media-right',
  'media-top',
  'media-bottom',
  'text-only',
  'image-only',
  'image-button',
  'video-text',
  'video-button',
  'card-horizontal',
  'card-vertical',
  'banner',
  'modal',
  'toast',
  'promo-block',
] as const

export const variantOptions = ['modern', 'minimal', 'premium', 'promotional'] as const
export const mediaTypeOptions = ['image', 'video', 'none'] as const
export const mediaPositionOptions = ['left', 'right', 'top', 'bottom'] as const
export const alignmentOptions = ['left', 'center', 'right'] as const
export const shadowOptions = ['none', 'sm', 'md', 'lg'] as const

export type WidgetLayout = (typeof layoutOptions)[number]
export type WidgetVariant = (typeof variantOptions)[number]
export type MediaType = (typeof mediaTypeOptions)[number]
export type MediaPosition = (typeof mediaPositionOptions)[number]
export type WidgetAlignment = (typeof alignmentOptions)[number]
export type ShadowSize = (typeof shadowOptions)[number]

export type WidgetVisualConfig = {
  layout: WidgetLayout
  variant: WidgetVariant
  mediaType: MediaType
  mediaPosition: MediaPosition
  title: string
  description: string
  buttonText: string
  buttonLink: string
  showButton: boolean
  showBadge: boolean
  badgeText: string
  backgroundColor: string
  textColor: string
  buttonColor: string
  borderColor: string
  borderRadius: number
  shadow: ShadowSize
  padding: number
  opacity: number
  glass: boolean
  alignment: WidgetAlignment
  mediaWidth: number
  contentWidth: number
  width: number
  minHeight: number
  subtitle: string
  highlightTitle: boolean
  ctaPosition: 'left' | 'center' | 'right'
  showDescription: boolean
  margin: number
  mediaUrl: string
  extraText: string
  showComplementaryText: boolean
  isActive: boolean
}

export const defaultWidgetVisualConfig: WidgetVisualConfig = {
  layout: 'media-left',
  variant: 'modern',
  mediaType: 'image',
  mediaPosition: 'left',
  title: 'Oferta especial',
  description: 'Aproveite essa condição exclusiva para turbinar seu ticket médio.',
  buttonText: 'Comprar agora',
  buttonLink: 'https://',
  showButton: true,
  showBadge: true,
  badgeText: '20% OFF',
  backgroundColor: '#111827',
  textColor: '#ffffff',
  buttonColor: '#2563eb',
  borderColor: '#334155',
  borderRadius: 16,
  shadow: 'md',
  padding: 24,
  opacity: 100,
  glass: false,
  alignment: 'left',
  mediaWidth: 40,
  contentWidth: 60,
  width: 520,
  minHeight: 220,
  subtitle: 'Oferta por tempo limitado',
  highlightTitle: true,
  ctaPosition: 'left',
  showDescription: true,
  margin: 0,
  mediaUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80',
  extraText: 'Frete grátis para todo Brasil',
  showComplementaryText: true,
  isActive: true,
}
