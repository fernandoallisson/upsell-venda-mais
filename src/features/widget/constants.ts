import type { CardTemplate, WidgetColors, WidgetFormState } from './types'

export const DEFAULT_WIDGET_COLORS: WidgetColors = {
  bg: '#ffffff',
  text: '#1f2937',
  button: '#2563eb',
  buttonText: '#ffffff',
  border: '#e2e8f0',
  shadow: 'rgba(0,0,0,0.08)',
  accent: '#3b82f6',
}

export const DEFAULT_WIDGET_STATE: WidgetFormState = {
  headline: '',
  description: '',
  image_url: '',
  cta_text: '',
  colors: DEFAULT_WIDGET_COLORS,
  spacing: {
    padding: 24,
    gap: 16,
    borderRadius: 16,
  },
  typography: {
    headlineSize: 16,
    descriptionSize: 13,
    ctaSize: 13,
    headlineWeight: '700',
    descriptionWeight: '400',
  },
  layout: {
    imagePosition: 'top',
    imageHeight: 160,
    showDismiss: true,
    dismissText: 'Nao, obrigado',
    shadowIntensity: 'lg',
    borderWidth: 1,
  },
  template: 'classic',
  widget_css: '',
  widget_html: '',
}

export const CARD_TEMPLATES: Array<{ key: CardTemplate; label: string; description: string }> = [
  { key: 'classic', label: 'Classico', description: 'Card padrao com imagem, titulo, descricao e botao' },
  { key: 'minimal', label: 'Minimalista', description: 'Design limpo, sem bordas, foco no conteudo' },
  { key: 'bold', label: 'Destaque', description: 'Cores vibrantes, tipografia grande, alto impacto' },
  { key: 'compact', label: 'Compacto', description: 'Layout horizontal, ideal para barras e banners' },
  { key: 'banner', label: 'Banner', description: 'Faixa horizontal de tela cheia com CTA lateral' },
  { key: 'floating', label: 'Flutuante', description: 'Card flutuante com sombra elevada e borda arredondada' },
]

export const COLOR_THEMES: Array<{
  name: string
  swatch: string
  colors: Partial<WidgetColors>
}> = [
  { name: 'Azul', swatch: '#2563eb', colors: { bg: '#ffffff', text: '#1f2937', button: '#2563eb', buttonText: '#ffffff', border: '#dbeafe', accent: '#3b82f6' } },
  { name: 'Verde', swatch: '#16a34a', colors: { bg: '#ffffff', text: '#1f2937', button: '#16a34a', buttonText: '#ffffff', border: '#dcfce7', accent: '#22c55e' } },
  { name: 'Laranja', swatch: '#ea580c', colors: { bg: '#fff7ed', text: '#1f2937', button: '#ea580c', buttonText: '#ffffff', border: '#fed7aa', accent: '#f97316' } },
  { name: 'Teal', swatch: '#0d9488', colors: { bg: '#f0fdfa', text: '#134e4a', button: '#0d9488', buttonText: '#ffffff', border: '#99f6e4', accent: '#14b8a6' } },
  { name: 'Dark', swatch: '#1f2937', colors: { bg: '#1f2937', text: '#f9fafb', button: '#374151', buttonText: '#f9fafb', border: '#374151', accent: '#6b7280' } },
  { name: 'Vermelho', swatch: '#dc2626', colors: { bg: '#ffffff', text: '#1f2937', button: '#dc2626', buttonText: '#ffffff', border: '#fecaca', accent: '#ef4444' } },
  { name: 'Rosa', swatch: '#ec4899', colors: { bg: '#fdf2f8', text: '#1f2937', button: '#ec4899', buttonText: '#ffffff', border: '#fbcfe8', accent: '#f472b6' } },
  { name: 'Slate', swatch: '#475569', colors: { bg: '#f8fafc', text: '#1e293b', button: '#475569', buttonText: '#ffffff', border: '#cbd5e1', accent: '#64748b' } },
]

export const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
}

export const FONT_WEIGHT_OPTIONS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
]
