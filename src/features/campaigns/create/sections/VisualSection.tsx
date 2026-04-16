import { Info, Palette } from 'lucide-react'
import { DISPLAY_LOCATIONS, COLOR_PRESETS, type ColorPresetKey } from '../constants'
import type { CampaignFormColors, CampaignFormState } from '../types'

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
  { key: 'button', label: 'Botão' },
  { key: 'buttonText', label: 'Texto do Botão' },
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

  return (
    <div className="space-y-4">
      {/* Color Presets */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="h-3.5 w-3.5 text-slate-400" />
          <p className="text-xs font-semibold text-slate-600">Paleta de Cores</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(COLOR_PRESETS) as ColorPresetKey[]).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onSetColors(COLOR_PRESETS[preset])}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
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

      {/* Custom Colors */}
      <div className="grid grid-cols-2 gap-2">
        {COLOR_FIELDS.map((field) => (
          <label key={field.key} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="color"
                value={form.colors[field.key]}
                onChange={(e) => onSetColor(field.key, e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div
                className="h-7 w-7 rounded-md border border-slate-200 shadow-sm"
                style={{ backgroundColor: form.colors[field.key] }}
              />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-medium text-slate-500">{field.label}</span>
              <span className="block font-mono text-[10px] text-slate-600">{form.colors[field.key]}</span>
            </div>
          </label>
        ))}
      </div>

      {firstLocation && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
          <div>
            <p className="text-[11px] font-semibold text-blue-800">
              {firstLocation.label}
            </p>
            <p className="mt-0.5 text-[10px] text-blue-600">
              {firstLocation.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisualSection
