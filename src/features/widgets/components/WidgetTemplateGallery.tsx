import { useState } from 'react'
import { Sparkles, Zap, Gift, Bell, FileText, LayoutGrid, ChevronRight } from 'lucide-react'
import type { WidgetVisualConfig } from '../types/widgetTemplate'
import {
  widgetPresetTemplates,
  presetCategories,
  getPresetsByCategory,
  type PresetCategoryFilter,
  type WidgetPresetTemplate,
} from '../utils/widgetPresetTemplates'
import WidgetRenderer from './WidgetRenderer'

type Props = {
  onSelect: (config: WidgetVisualConfig) => void
  onSkip: () => void
}

const categoryIcons: Record<PresetCategoryFilter, typeof Sparkles> = {
  all: LayoutGrid,
  conversion: Zap,
  engagement: Sparkles,
  promotion: Gift,
  notification: Bell,
  content: FileText,
}

const WidgetTemplateGallery = ({ onSelect, onSkip }: Props) => {
  const [activeCategory, setActiveCategory] = useState<PresetCategoryFilter>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filtered = getPresetsByCategory(activeCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Escolha um modelo para começar</h2>
          <p className="mt-1 text-sm text-slate-500">
            Selecione um template pré-configurado e personalize depois, ou comece do zero.
          </p>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Começar do zero
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {presetCategories.map((cat) => {
          const Icon = categoryIcons[cat.id]
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
              {!isActive && (
                <span className="ml-0.5 text-slate-400">
                  {cat.id === 'all' ? widgetPresetTemplates.length : getPresetsByCategory(cat.id).length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Template Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((preset) => (
          <TemplateCard
            key={preset.id}
            preset={preset}
            isHovered={hoveredId === preset.id}
            onHover={() => setHoveredId(preset.id)}
            onLeave={() => setHoveredId(null)}
            onSelect={() => onSelect(preset.config)}
          />
        ))}
      </div>
    </div>
  )
}

type CardProps = {
  preset: WidgetPresetTemplate
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}

const categoryColorMap: Record<WidgetPresetTemplate['category'], string> = {
  conversion: 'bg-emerald-50 text-emerald-700',
  engagement: 'bg-violet-50 text-violet-700',
  promotion: 'bg-amber-50 text-amber-700',
  notification: 'bg-sky-50 text-sky-700',
  content: 'bg-slate-100 text-slate-600',
}

const categoryLabelMap: Record<WidgetPresetTemplate['category'], string> = {
  conversion: 'Conversão',
  engagement: 'Engajamento',
  promotion: 'Promoção',
  notification: 'Notificação',
  content: 'Conteúdo',
}

const TemplateCard = ({ preset, isHovered, onHover, onLeave, onSelect }: CardProps) => (
  <button
    type="button"
    onClick={onSelect}
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
      isHovered
        ? 'border-blue-300 bg-white shadow-lg shadow-blue-600/10 ring-2 ring-blue-100'
        : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
    }`}
  >
    {/* Preview area */}
    <div className="relative overflow-hidden bg-slate-50 px-4 pb-3 pt-4">
      <div className="pointer-events-none mx-auto" style={{ transform: 'scale(0.58)', transformOrigin: 'top center', maxHeight: 180, overflow: 'hidden' }}>
        <WidgetRenderer config={preset.config} mode="thumbnail" />
      </div>
      {/* Hover overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-blue-600/5 backdrop-blur-[1px] transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30">
          Usar este modelo
        </span>
      </div>
    </div>

    {/* Info */}
    <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-slate-900">{preset.name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColorMap[preset.category]}`}>
          {categoryLabelMap[preset.category]}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-slate-500">{preset.description}</p>
    </div>
  </button>
)

export default WidgetTemplateGallery
