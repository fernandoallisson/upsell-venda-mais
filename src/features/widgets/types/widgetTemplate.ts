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

export const variantOptions = ['modern', 'minimal', 'premium', 'promotional', 'glass', 'bold'] as const
export const mediaTypeOptions = ['image', 'video', 'none'] as const
export const shadowOptions = ['none', 'sm', 'md', 'lg'] as const

export type WidgetLayout = (typeof layoutOptions)[number]
export type WidgetVariant = (typeof variantOptions)[number]
export type MediaType = (typeof mediaTypeOptions)[number]
export type ShadowSize = (typeof shadowOptions)[number]

export type WidgetVisualConfig = {
  layout: WidgetLayout
  variant: WidgetVariant
  mediaType: MediaType
  showTitle: boolean
  showSubtitle: boolean
  showDescription: boolean
  showButton: boolean
  showComplementaryText: boolean
  showBadge: boolean
  showMedia: boolean
  buttonFullWidth: boolean
  mediaClickableCta: boolean
  width: number
  minHeight: number
  mediaSize: number
  backgroundColor: string
  textColor: string
  buttonColor: string
  borderColor: string
  borderRadius: number
  shadow: ShadowSize
  padding: number
}

export const MOCK_WIDGET_CONTENT = {
  title: 'Oferta especial',
  subtitle: 'Oferta por tempo limitado',
  description: 'Aproveite essa condição exclusiva para turbinar seu ticket médio.',
  buttonText: 'Comprar agora',
  rejectText: 'Não, obrigado',
  badgeText: '20% OFF',
  extraText: 'Frete grátis para todo Brasil',
}

/** Dimension constraints — keep widgets compact and responsive */
export const WIDGET_LIMITS = {
  width: { min: 280, max: 680 },
  minHeight: { min: 80, max: 360 },
  mediaSize: { min: 20, max: 100 },
  borderRadius: { min: 0, max: 28 },
  padding: { min: 0, max: 32 },
} as const

export const defaultWidgetVisualConfig: WidgetVisualConfig = {
  layout: 'media-left',
  variant: 'modern',
  mediaType: 'image',
  showTitle: true,
  showSubtitle: true,
  showDescription: true,
  showButton: true,
  showComplementaryText: true,
  showBadge: true,
  showMedia: true,
  buttonFullWidth: false,
  mediaClickableCta: false,
  width: 520,
  minHeight: 220,
  mediaSize: 40,
  backgroundColor: '#ffffff',
  textColor: '#0f172a',
  buttonColor: '#2563eb',
  borderColor: '#cbd5e1',
  borderRadius: 16,
  shadow: 'md',
  padding: 20,
}

export const layoutLabels: Record<WidgetLayout, string> = {
  'media-left': 'Mídia à esquerda',
  'media-right': 'Mídia à direita',
  'media-top': 'Mídia acima do conteúdo',
  'media-bottom': 'Mídia abaixo do conteúdo',
  'text-only': 'Somente texto',
  'image-only': 'Somente imagem',
  'image-button': 'Imagem + CTA destacado',
  'video-text': 'Vídeo + texto',
  'video-button': 'Vídeo + CTA forte',
  'card-horizontal': 'Card horizontal',
  'card-vertical': 'Card vertical',
  banner: 'Banner promocional',
  modal: 'Modal centralizado',
  toast: 'Toast compacto',
  'promo-block': 'Bloco promocional',
}
