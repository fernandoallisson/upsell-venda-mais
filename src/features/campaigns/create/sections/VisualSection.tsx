import { Info, Palette } from 'lucide-react'
import { DISPLAY_LOCATIONS, COLOR_PRESETS, type ColorPresetKey } from '../constants'
import type { CampaignFormColors, CampaignFormState } from '../types'
import CollapsibleSection from '../../../../components/layout/CollapsibleSection'

type Props = {
  form: CampaignFormState
  onSetColors: (colors: CampaignFormColors) => void
  onSetColor: (key: keyof CampaignFormColors, value: string) => void
}

type ColorFieldConfig = {
  key: keyof CampaignFormColors
  label: string
}

const COLOR_FIELDS: ColorFieldConfig[] = [
  { key: 'bg', label: 'Fundo' },
  { key: 'text', label: 'Texto' },
  { key: 'button', label: 'Botao' },
  { key: 'buttonText', label: 'Texto do Botao' },
]

const PRESET_COLORS: Record<ColorPresetKey, string> = {
  Roxo: '#7c3aed',
  Azul: '#2563eb',
  Verde: '#16a34a',
  Laranja: '#ea580c',
  Rosa: '#ec4899',
  Dark: '#1f2937',
  Vermelho: '#dc2626',
  Teal: '#0d9488',
}

const VisualSection = ({ form, onSetColors, onSetColor }: Props) => {
  const firstLocation = DISPLAY_LOCATIONS.find((loc) =>
    form.display_locations.includes(loc.key),
  )

  const badgeLabel = form.widget_render_type === 'div_inline' ? 'Div Inline' : form.widget_render_type === 'widget_modal' ? 'Widget Modal' : null

  const badge = badgeLabel ? (
    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
      {badgeLabel}
    </span>
  ) : undefined

  return (
    <CollapsibleSection
      icon={<Palette className="h-4 w-4" />}
      title="Personalização Visual"
      badge={badge}
      defaultOpen={true}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">Presets de Cores</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(COLOR_PRESETS) as ColorPresetKey[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onSetColors(COLOR_PRESETS[preset])}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span
                  className="h-3 w-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: PRESET_COLORS[preset] }}
                />
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-600">Cores Personalizadas</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {COLOR_FIELDS.map((field) => (
              <label key={field.key} className="block space-y-1">
                <span className="text-xs text-slate-500">{field.label}</span>
                <div className="flex items-center gap-2">
                  <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200">
                    <input
                      type="color"
                      value={form.colors[field.key]}
                      onChange={(e) => onSetColor(field.key, e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0 opacity-0"
                    />
                    <span
                      className="block h-full w-full rounded-lg"
                      style={{ backgroundColor: form.colors[field.key] }}
                    />
                  </div>
                  <input
                    type="text"
                    value={form.colors[field.key]}
                    onChange={(e) => {
                      const val = e.target.value
                      if (/^#[0-9a-fA-F]{0,6}$/.test(val)) onSetColor(field.key, val)
                    }}
                    maxLength={7}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm text-slate-700 outline-none transition focus:border-blue-300"
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        {firstLocation && (
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
            <div>
              <p className="text-xs font-semibold text-blue-800">
                {firstLocation.label}
              </p>
              <p className="mt-0.5 text-xs text-blue-600">
                {firstLocation.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}

export default VisualSection
