import type { WidgetLayout } from '../types/widgetTemplate'

export type LayoutPresetDefinition = {
  id: WidgetLayout
  description: string
  forceMediaType?: 'image' | 'video' | 'none'
  supportsMediaSize: boolean
  containerClass: string
}

export const layoutPresetDefinitions: Record<WidgetLayout, LayoutPresetDefinition> = {
  'media-left': { id: 'media-left', description: 'Mídia em coluna lateral esquerda e conteúdo à direita.', supportsMediaSize: true, containerClass: 'md:flex-row' },
  'media-right': { id: 'media-right', description: 'Mídia em coluna lateral direita e conteúdo à esquerda.', supportsMediaSize: true, containerClass: 'md:flex-row-reverse' },
  'media-top': { id: 'media-top', description: 'Mídia no topo e conteúdo empilhado abaixo.', supportsMediaSize: true, containerClass: 'flex-col' },
  'media-bottom': { id: 'media-bottom', description: 'Conteúdo no topo e mídia abaixo.', supportsMediaSize: true, containerClass: 'flex-col-reverse' },
  'text-only': { id: 'text-only', description: 'Somente texto, sem bloco reservado para mídia.', forceMediaType: 'none', supportsMediaSize: false, containerClass: 'flex-col' },
  'image-only': { id: 'image-only', description: 'Imagem dominante com foco visual.', forceMediaType: 'image', supportsMediaSize: false, containerClass: 'flex-col' },
  'image-button': { id: 'image-button', description: 'Imagem dominante com CTA sobreposto ou destacado.', forceMediaType: 'image', supportsMediaSize: false, containerClass: 'flex-col' },
  'video-text': { id: 'video-text', description: 'Vídeo em destaque com bloco textual de suporte.', forceMediaType: 'video', supportsMediaSize: true, containerClass: 'flex-col' },
  'video-button': { id: 'video-button', description: 'Vídeo com foco em ação e botão forte.', forceMediaType: 'video', supportsMediaSize: true, containerClass: 'flex-col' },
  'card-horizontal': { id: 'card-horizontal', description: 'Card largo em linha, separando mídia e conteúdo.', supportsMediaSize: true, containerClass: 'md:flex-row' },
  'card-vertical': { id: 'card-vertical', description: 'Card empilhado para leitura vertical.', supportsMediaSize: true, containerClass: 'flex-col' },
  banner: { id: 'banner', description: 'Faixa horizontal promocional com hierarquia compacta.', supportsMediaSize: true, containerClass: 'md:flex-row items-center' },
  modal: { id: 'modal', description: 'Composição visual de modal centralizado.', supportsMediaSize: true, containerClass: 'flex-col' },
  toast: { id: 'toast', description: 'Bloco compacto de canto com informação essencial.', supportsMediaSize: true, containerClass: 'flex-row items-center' },
  'promo-block': { id: 'promo-block', description: 'Bloco comercial chamativo com destaque de oferta.', supportsMediaSize: true, containerClass: 'md:flex-row' },
}

export const isMediaApplicable = (layout: WidgetLayout) => layoutPresetDefinitions[layout].forceMediaType !== 'none' && layout !== 'text-only'
