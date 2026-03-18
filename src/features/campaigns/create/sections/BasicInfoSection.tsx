import { useMemo, useState } from 'react'
import {
  CreditCard,
  PackageCheck,
  ShoppingBag,
  ShoppingCart,
  Check,
  ChevronDown,
  Globe,
  LayoutTemplate,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import type { Segment } from '../../../../lib/services/segments/segments.types'
import type { Widget } from '../../../../types/widget'
import WidgetHtmlPreview from '../../../widgets/components/WidgetHtmlPreview'
import { DISPLAY_LOCATIONS, RENDER_TYPE_OPTIONS } from '../constants'
import type { CampaignFormState, DisplayRenderType } from '../types'
import CollapsibleSection from '../../../../components/layout/CollapsibleSection'

const LOCATION_ICONS: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBag className="h-5 w-5" />,
  ShoppingCart: <ShoppingCart className="h-5 w-5" />,
  CreditCard: <CreditCard className="h-5 w-5" />,
  PackageCheck: <PackageCheck className="h-5 w-5" />,
}

type Props = {
  form: CampaignFormState
  segments: Segment[]
  widgetPresets: Widget[]
  widgetPresetsLoading: boolean
  onSet: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void
  onToggleLocation: (key: string) => void
  onToggleSegment: (id: number) => void
  onSelectWidgetPreset: (widgetId: number) => void
  onSetWidgetRenderType: (renderType: DisplayRenderType) => void
}

const DomainInput = ({
  domains,
  onSet,
}: {
  domains: string[]
  onSet: (domains: string[]) => void
}) => {
  const [input, setInput] = useState('')

  const addDomain = () => {
    const trimmed = input.trim()
    if (!trimmed || domains.includes(trimmed)) return
    onSet([...domains, trimmed])
    setInput('')
  }

  const removeDomain = (domain: string) => {
    onSet(domains.filter((d) => d !== domain))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDomain() } }}
            placeholder="loja.com.br ou https://loja.com"
            className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300"
          />
        </div>
        <button
          type="button"
          onClick={addDomain}
          className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </button>
      </div>
      {domains.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {domains.map((domain) => (
            <span
              key={domain}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
            >
              {domain}
              <button
                type="button"
                onClick={() => removeDomain(domain)}
                className="text-slate-400 transition hover:text-rose-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

const BasicInfoSection = ({
  form,
  segments,
  widgetPresets,
  widgetPresetsLoading,
  onSet,
  onToggleLocation,
  onToggleSegment,
  onSelectWidgetPreset,
  onSetWidgetRenderType,
}: Props) => {
  const [segmentOpen, setSegmentOpen] = useState(false)

  const selectedSegmentNames = form.segment_ids
    .map((id) => segments.find((s) => s.id === id)?.name)
    .filter(Boolean)

  const selectedWidgetPreset = useMemo(
    () => widgetPresets.find((widget) => widget.id === form.widget_preset_id) ?? null,
    [form.widget_preset_id, widgetPresets],
  )

  return (
    <CollapsibleSection number={1} title="Informações Básicas" defaultOpen={true}>
      <div className="space-y-5">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">
            Nome da Campanha <span className="text-rose-500">*</span>
          </span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onSet('name', e.target.value)}
            placeholder="Ex: Black Friday 2026"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">Status</span>
            <select
              value={form.is_active ? 'active' : 'inactive'}
              onChange={(e) => onSet('is_active', e.target.value === 'active')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-300"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Prioridade
            </span>
            <input
              type="number"
              min={0}
              value={form.priority}
              onChange={(e) => onSet('priority', Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-300"
            />
            <p className="text-xs text-slate-400">Maior valor = mais prioritario</p>
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">
            Preset do Widget <span className="text-rose-500">*</span>
          </span>
          <select
            value={form.widget_preset_id ? String(form.widget_preset_id) : ''}
            onChange={(e) => onSelectWidgetPreset(Number(e.target.value))}
            disabled={widgetPresetsLoading || widgetPresets.length === 0}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 focus:border-blue-300"
          >
            <option value="">
              {widgetPresetsLoading ? 'Carregando presets...' : 'Selecione um preset existente'}
            </option>
            {widgetPresets.map((widget) => (
              <option key={widget.id} value={widget.id}>
                {widget.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400">
            O HTML e CSS do widget selecionado serão copiados para a campanha no salvamento.
          </p>
        </label>

        {selectedWidgetPreset && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedWidgetPreset.title}</p>
                <p className="text-xs text-slate-500">Preset selecionado para inicializar a campanha.</p>
              </div>
            </div>
            <WidgetHtmlPreview html={selectedWidgetPreset.html} css={selectedWidgetPreset.css} compact />
          </div>
        )}

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Segmentação</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSegmentOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition hover:border-slate-300"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                {selectedSegmentNames.length === 0 ? (
                  <span className="text-slate-400">Selecione os segmentos</span>
                ) : (
                  <span className="font-medium">
                    {selectedSegmentNames.slice(0, 2).join(', ')}
                    {selectedSegmentNames.length > 2
                      ? ` +${selectedSegmentNames.length - 2}`
                      : ''}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  segmentOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {segmentOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="max-h-52 overflow-y-auto p-1">
                  {segments.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-slate-400">
                      Nenhum segmento disponível.
                    </p>
                  ) : (
                    segments.map((segment) => {
                      const active = form.segment_ids.includes(segment.id)
                      return (
                        <button
                          key={segment.id}
                          type="button"
                          onClick={() => onToggleSegment(segment.id)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                            active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{segment.name}</span>
                          {active && <Check className="h-4 w-4" />}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-600">Locais de Exibição</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {DISPLAY_LOCATIONS.map((location) => {
              const active = form.display_locations.includes(location.key)
              return (
                <button
                  key={location.key}
                  type="button"
                  onClick={() => onToggleLocation(location.key)}
                  className={`rounded-xl border p-3 text-left transition ${
                    active
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {LOCATION_ICONS[location.icon]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{location.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{location.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Tipo de Exibição</span>
          <select
            value={form.widget_render_type ?? ''}
            onChange={(e) => onSetWidgetRenderType(e.target.value as DisplayRenderType)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-300"
          >
            <option value="">Selecione o tipo de exibição</option>
            {RENDER_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Domínios permitidos</span>
          <DomainInput domains={form.domains} onSet={(domains) => onSet('domains', domains)} />
        </div>
      </div>
    </CollapsibleSection>
  )
}

export default BasicInfoSection
