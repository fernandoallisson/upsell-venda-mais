import type { CampaignFormColors, CampaignFormState, DisplayLocationMeta } from './types'

export const DISPLAY_LOCATIONS: DisplayLocationMeta[] = [
  {
    key: 'product_page',
    label: 'Pagina do Produto',
    widgetType: 'Widget Modal',
    description: 'Widget modal exibido na pagina do produto. Ideal para cross-sell e produtos relacionados.',
    icon: 'ShoppingBag',
  },
  {
    key: 'side_cart',
    label: 'Carrinho Lateral',
    widgetType: 'Div Inline',
    description: 'Bloco inline exibido no carrinho lateral. Excelente para ofertas de ultimo momento.',
    icon: 'ShoppingCart',
  },
  {
    key: 'cart_page',
    label: 'Pagina de Carrinho',
    widgetType: 'Widget Modal',
    description: 'Widget modal exibido na pagina do carrinho. Alta intenção de compra.',
    icon: 'ShoppingCart',
  },
  {
    key: 'pre_checkout',
    label: 'Pre-Checkout',
    widgetType: 'Div Inline',
    description: 'Bloco inline exibido antes do checkout. Momento critico de decisão.',
    icon: 'CreditCard',
  },
  {
    key: 'post_purchase',
    label: 'Pos-Compra',
    widgetType: 'Widget Modal',
    description: 'Widget modal exibido apos a compra. Perfeito para order bumps e produtos complementares.',
    icon: 'PackageCheck',
  },
]

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sab' },
]

export const HOURS_OF_DAY: { value: number; label: string }[] = Array.from(
  { length: 24 },
  (_, i) => ({ value: i, label: `${String(i).padStart(2, '0')}h` }),
)

export type ColorPresetKey =
  | 'Roxo'
  | 'Azul'
  | 'Verde'
  | 'Laranja'
  | 'Rosa'
  | 'Dark'
  | 'Vermelho'
  | 'Teal'

export const COLOR_PRESETS: Record<ColorPresetKey, CampaignFormColors> = {
  Roxo: { bg: '#ffffff', text: '#1f2937', button: '#7c3aed', buttonText: '#ffffff' },
  Azul: { bg: '#ffffff', text: '#1f2937', button: '#2563eb', buttonText: '#ffffff' },
  Verde: { bg: '#ffffff', text: '#1f2937', button: '#16a34a', buttonText: '#ffffff' },
  Laranja: { bg: '#fff7ed', text: '#1f2937', button: '#ea580c', buttonText: '#ffffff' },
  Rosa: { bg: '#ffffff', text: '#1f2937', button: '#ec4899', buttonText: '#ffffff' },
  Dark: { bg: '#1f2937', text: '#f9fafb', button: '#374151', buttonText: '#f9fafb' },
  Vermelho: { bg: '#ffffff', text: '#1f2937', button: '#dc2626', buttonText: '#ffffff' },
  Teal: { bg: '#f0fdfa', text: '#134e4a', button: '#0d9488', buttonText: '#ffffff' },
}

export const DEFAULT_FORM_STATE: CampaignFormState = {
  name: '',
  is_active: true,
  segment_ids: [],
  display_locations: [],
  priority: 10,

  headline: '',
  description: '',
  image_url: '',
  video_url: '',
  cta_text: '',
  cta_link: '',
  cta_new_tab: true,

  start_date: '',
  start_time: '00:00',
  end_date: '',
  end_time: '23:59',
  active_days: [0, 1, 2, 3, 4, 5, 6],
  active_hours: Array.from({ length: 24 }, (_, i) => i),
  domains: [],

  cooldown_minutes: 5,
  max_per_session: 3,
  max_per_day: 10,
  max_total: 100,
  block_after_conversion_days: 30,

  widget_css: '',
  widget_html: '',
  colors: { bg: '#ffffff', text: '#1f2937', button: '#2563eb', buttonText: '#ffffff' },
}
