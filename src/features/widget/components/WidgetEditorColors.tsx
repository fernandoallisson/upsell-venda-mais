import { Palette } from 'lucide-react'
import { COLOR_THEMES } from '../constants'
import type { WidgetColors } from '../types'

type ColorFieldConfig = {
  key: keyof WidgetColors
  label: string
}

const COLOR_FIELDS: ColorFieldConfig[] = [
  { key: 'bg', label: 'Fundo' },
  { key: 'text', label: 'Texto' },
  { key: 'button', label: 'Botão' },
  { key: 'buttonText', label: 'Texto do Botão' },
  { key: 'border', label: 'Borda' },
  { key: 'accent', label: 'Destaque' },
]

type Props = {
  colors: WidgetColors
  onSetColor: (key: keyof WidgetColors, value: string) => void
  onSetAllColors: (colors: Partial<WidgetColors>) => void
}

const WidgetEditorColors = ({ colors, onSetColor, onSetAllColors }: Props) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2">
      <Palette className="h-4 w-4 text-slate-400" />
      <p className="text-sm font-semibold text-slate-700">Cores</p>
    </div>

    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500">Temas</p>
      <div className="flex flex-wrap gap-2">
        {COLOR_THEMES.map((theme) => (
          <button
            key={theme.name}
            type="button"
            onClick={() => onSetAllColors(theme.colors)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span
              className="h-3 w-3 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: theme.swatch }}
            />
            {theme.name}
          </button>
        ))}
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      {COLOR_FIELDS.map((field) => (
        <label key={field.key} className="block space-y-1">
          <span className="text-xs text-slate-500">{field.label}</span>
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200">
              <input
                type="color"
                value={colors[field.key]}
                onChange={(e) => onSetColor(field.key, e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0 opacity-0"
              />
              <span
                className="block h-full w-full rounded-lg"
                style={{ backgroundColor: colors[field.key] }}
              />
            </div>
            <input
              type="text"
              value={colors[field.key]}
              onChange={(e) => {
                const val = e.target.value
                if (/^#[0-9a-fA-F]{0,6}$/.test(val) || /^rgba?\(/.test(val)) {
                  onSetColor(field.key, val)
                }
              }}
              maxLength={25}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs text-slate-700 outline-none transition focus:border-blue-300"
            />
          </div>
        </label>
      ))}
    </div>
  </div>
)

export default WidgetEditorColors
