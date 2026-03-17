import type { WidgetVariant } from '../types/widgetTemplate'

export type StyleVariantDefinition = {
  id: WidgetVariant
  cardClass: string
  titleClass: string
  bodyClass: string
  buttonClass: string
  badgeClass: string
}

export const styleVariantDefinitions: Record<WidgetVariant, StyleVariantDefinition> = {
  modern: {
    id: 'modern',
    cardClass: 'bg-white',
    titleClass: 'font-bold tracking-tight',
    bodyClass: 'text-slate-600',
    buttonClass: 'rounded-xl font-semibold',
    badgeClass: 'rounded-full',
  },
  minimal: {
    id: 'minimal',
    cardClass: 'bg-white',
    titleClass: 'font-semibold tracking-tight',
    bodyClass: 'text-slate-500',
    buttonClass: 'rounded-md font-medium',
    badgeClass: 'rounded-md',
  },
  premium: {
    id: 'premium',
    cardClass: 'bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900',
    titleClass: 'font-semibold tracking-wide',
    bodyClass: 'text-slate-200',
    buttonClass: 'rounded-full font-semibold uppercase tracking-wide',
    badgeClass: 'rounded-full uppercase tracking-wide',
  },
  promotional: {
    id: 'promotional',
    cardClass: 'bg-gradient-to-r from-amber-50 to-rose-50',
    titleClass: 'font-extrabold uppercase',
    bodyClass: 'text-slate-700',
    buttonClass: 'rounded-lg font-extrabold uppercase',
    badgeClass: 'rounded-lg uppercase font-black',
  },
  glass: {
    id: 'glass',
    cardClass: 'bg-white/20 backdrop-blur-xl',
    titleClass: 'font-semibold',
    bodyClass: 'text-white/90',
    buttonClass: 'rounded-xl font-semibold backdrop-blur',
    badgeClass: 'rounded-full backdrop-blur',
  },
  bold: {
    id: 'bold',
    cardClass: 'bg-slate-900',
    titleClass: 'font-black uppercase tracking-wide',
    bodyClass: 'text-slate-100',
    buttonClass: 'rounded-none font-black uppercase tracking-wider',
    badgeClass: 'rounded-none font-black uppercase',
  },
}
