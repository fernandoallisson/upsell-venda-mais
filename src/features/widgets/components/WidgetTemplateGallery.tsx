import { useMemo, useState } from 'react'
import { Sparkles, Zap, Gift, Bell, FileText, LayoutGrid, ChevronRight, Code2 } from 'lucide-react'
import type { WidgetVisualConfig } from '../types/widgetTemplate'
import {
  widgetPresetTemplates,
  presetCategories,
  type WidgetPresetTemplate,
} from '../utils/widgetPresetTemplates'
import { htmlWidgetTemplateCategories, htmlWidgetTemplates } from '../utils/htmlWidgetTemplates'
import type { HtmlWidgetTemplate } from '../utils/htmlWidgetTemplateTypes'
import { generateHtmlWidgetTemplateCss, generateHtmlWidgetTemplateHtml } from '../utils/htmlWidgetTemplateGenerator'
import WidgetRenderer from './WidgetRenderer'
import WidgetHtmlPreview from './WidgetHtmlPreview'

export type WidgetTemplateSelection =
  | { kind: 'visual'; name: string; config: WidgetVisualConfig }
  | { kind: 'html'; name: string; template: HtmlWidgetTemplate }

type Props = {
  onSelect: (selection: WidgetTemplateSelection) => void
  onSkip: () => void
}

type GalleryFilter =
  | 'all'
  | WidgetPresetTemplate['category']
  | 'html-all'
  | HtmlWidgetTemplate['category']

const categoryIcons: Record<string, typeof Sparkles> = {
  all: LayoutGrid,
  conversion: Zap,
  engagement: Sparkles,
  promotion: Gift,
  notification: Bell,
  content: FileText,
  'html-all': Code2,
  botoes: Zap,
  hero: LayoutGrid,
  oferta: Gift,
  popup: Bell,
  contador: Sparkles,
  premios: Gift,
  depoimentos: FileText,
}

const WidgetTemplateGallery = ({ onSelect, onSkip }: Props) => {
  const [activeCategory, setActiveCategory] = useState<GalleryFilter>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const filters = useMemo(
    () => [
      ...presetCategories,
      ...htmlWidgetTemplateCategories,
    ] as Array<{ id: GalleryFilter; label: string }>,
    [],
  )

  const visualTemplates = activeCategory === 'all'
    ? widgetPresetTemplates
    : ['conversion', 'engagement', 'promotion', 'notification', 'content'].includes(activeCategory)
      ? widgetPresetTemplates.filter((preset) => preset.category === activeCategory)
      : []

  const htmlTemplates = activeCategory === 'all' || activeCategory === 'html-all'
    ? htmlWidgetTemplates
    : ['botoes', 'hero', 'oferta', 'popup', 'contador', 'premios', 'depoimentos'].includes(activeCategory)
      ? htmlWidgetTemplates.filter((template) => template.category === activeCategory)
      : []
  const templates = [
    ...visualTemplates.map((template) => ({ kind: 'visual' as const, template })),
    ...htmlTemplates.map((template) => ({ kind: 'html' as const, template })),
  ]
  const pageSize = 3
  const lastPage = Math.max(1, Math.ceil(templates.length / pageSize))
  const currentPage = Math.min(page, lastPage - 1)
  const visibleTemplates = templates.slice(currentPage * pageSize, currentPage * pageSize + pageSize)

  const countByFilter = (filter: GalleryFilter) => {
    if (filter === 'all') return widgetPresetTemplates.length + htmlWidgetTemplates.length
    if (filter === 'html-all') return htmlWidgetTemplates.length
    if (['conversion', 'engagement', 'promotion', 'notification', 'content'].includes(filter)) {
      return widgetPresetTemplates.filter((preset) => preset.category === filter).length
    }
    return htmlWidgetTemplates.filter((template) => template.category === filter).length
  }

  return (
    <div className="widget-template-gallery space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Escolha um modelo para começar</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use modelos editáveis ou HTML preservado da biblioteca de componentes.
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

      <div className="flex flex-wrap gap-2">
        {filters.map((cat) => {
          const Icon = categoryIcons[cat.id] ?? Sparkles
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id)
                setPage(0)
              }}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
              {!isActive && <span className="ml-0.5 text-slate-400">{countByFilter(cat.id)}</span>}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {visibleTemplates.map((item) =>
          item.kind === 'visual' ? (
            <VisualTemplateCard
              key={`visual-${item.template.id}`}
              preset={item.template}
              isHovered={hoveredId === `visual-${item.template.id}`}
              onHover={() => setHoveredId(`visual-${item.template.id}`)}
              onLeave={() => setHoveredId(null)}
              onSelect={() => onSelect({ kind: 'visual', name: item.template.name, config: item.template.config })}
            />
          ) : (
            <HtmlTemplateCard
              key={`html-${item.template.id}`}
              template={item.template}
              isHovered={hoveredId === `html-${item.template.id}`}
              onHover={() => setHoveredId(`html-${item.template.id}`)}
              onLeave={() => setHoveredId(null)}
              onSelect={() => onSelect({ kind: 'html', name: item.template.name, template: item.template })}
            />
          ),
        )}
      </div>

      {templates.length > pageSize ? (
        <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
          <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">
            Anterior
          </button>
          <span>{currentPage + 1} / {lastPage}</span>
          <button type="button" disabled={currentPage + 1 >= lastPage} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">
            Proximo
          </button>
        </div>
      ) : null}
    </div>
  )
}

type VisualCardProps = {
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

const VisualTemplateCard = ({ preset, isHovered, onHover, onLeave, onSelect }: VisualCardProps) => (
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
    <div className="widget-template-thumbnail relative overflow-hidden bg-slate-50 px-4 pb-3 pt-4">
      <div className="pointer-events-none mx-auto" style={{ transform: 'scale(0.58)', transformOrigin: 'top center', maxHeight: 180, overflow: 'hidden' }}>
        <WidgetRenderer config={preset.config} mode="thumbnail" />
      </div>
      <HoverOverlay visible={isHovered} />
    </div>
    <CardInfo
      name={preset.name}
      description={preset.description}
      badge={categoryLabelMap[preset.category]}
      badgeClass={categoryColorMap[preset.category]}
    />
  </button>
)

type HtmlCardProps = {
  template: HtmlWidgetTemplate
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}

const HtmlTemplateCard = ({ template, isHovered, onHover, onLeave, onSelect }: HtmlCardProps) => (
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
    <div className="widget-template-thumbnail relative overflow-hidden bg-slate-950 p-3">
      <div className="pointer-events-none h-[180px] overflow-hidden rounded-xl bg-white">
        <WidgetHtmlPreview
          html={generateHtmlWidgetTemplateHtml(template)}
          css={generateHtmlWidgetTemplateCss(template)}
          compact
          allowScripts={template.supportsScript}
        />
      </div>
      <HoverOverlay visible={isHovered} />
    </div>
    <CardInfo
      name={template.name}
      description={template.description}
      badge={template.categoryLabel}
      badgeClass="bg-slate-900 text-white"
    />
  </button>
)

const HoverOverlay = ({ visible }: { visible: boolean }) => (
  <div
    className={`absolute inset-0 flex items-center justify-center bg-blue-600/5 backdrop-blur-[1px] transition-opacity duration-200 ${
      visible ? 'opacity-100' : 'opacity-0'
    }`}
  >
    <span className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30">
      Usar este modelo
    </span>
  </div>
)

const CardInfo = ({
  name,
  description,
  badge,
  badgeClass,
}: {
  name: string
  description: string
  badge: string
  badgeClass: string
}) => (
  <div className="widget-template-info flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3">
    <div className="flex items-center gap-2">
      <h3 className="min-w-0 truncate text-sm font-bold text-slate-900">{name}</h3>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
        {badge}
      </span>
    </div>
    <p className="text-xs leading-relaxed text-slate-500">{description}</p>
  </div>
)

export default WidgetTemplateGallery
