import { useState } from 'react'
import {
  CreditCard,
  PackageCheck,
  ShoppingBag,
  ShoppingCart,
  Check,
  ChevronDown,
  Globe,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import type { Segment } from '../../../../lib/services/segments/segments.types'
import { DISPLAY_LOCATIONS } from '../constants'
import type { CampaignFormState } from '../types'
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
  onSet: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void
  onToggleLocation: (key: string) => void
  onToggleSegment: (id: number) => void
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
  onSet,
  onToggleLocation,
  onToggleSegment,
}: Props) => {
  const [segmentOpen, setSegmentOpen] = useState(false)

  const selectedSegmentNames = form.segment_ids
    .map((id) => segments.find((s) => s.id === id)?.name)
    .filter(Boolean)

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
                      Nenhum segmento disponivel.
                    </p>
                  ) : (
                    segments.map((seg) => {
                      const selected = form.segment_ids.includes(seg.id)
                      return (
                        <button
                          key={seg.id}
                          type="button"
                          onClick={() => onToggleSegment(seg.id)}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                            selected
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                              selected
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-slate-300'
                            }`}
                          >
                            {selected && (
                              <Check className="h-2.5 w-2.5 text-white" />
                            )}
                          </span>
                          {seg.name}
                        </button>
                      )
                    })
                  )}
                </div>
                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={() => setSegmentOpen(false)}
                    className="w-full rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
          {form.segment_ids.length === 0 && (
            <p className="text-xs text-slate-400">
              Todos os visitantes serao alcancados
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">
            Domínios Permitidos
          </span>
          <DomainInput
            domains={form.domains}
            onSet={(domains) => onSet('domains', domains)}
          />
          {form.domains.length === 0 && (
            <p className="text-xs text-slate-400">
              Todos os domínios serão aceitos
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">
            Local de Exibição
          </span>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DISPLAY_LOCATIONS.map((loc) => {
              const isSelected = form.display_locations.includes(loc.key)
              return (
                <button
                  key={loc.key}
                  type="button"
                  onClick={() => onToggleLocation(loc.key)}
                  className={`relative flex flex-col gap-2 rounded-xl border p-3.5 text-left transition ${
                    isSelected
                      ? 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  )}
                  <span
                    className={`${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {LOCATION_ICONS[loc.icon]}
                  </span>
                  <div>
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        isSelected ? 'text-emerald-800' : 'text-slate-700'
                      }`}
                    >
                      {loc.label}
                    </p>
                    <p
                      className={`mt-0.5 text-xs ${
                        isSelected ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {loc.widgetType}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}

export default BasicInfoSection
