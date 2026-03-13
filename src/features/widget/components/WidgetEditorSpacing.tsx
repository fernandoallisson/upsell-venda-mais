import { Ruler } from 'lucide-react'
import { FONT_WEIGHT_OPTIONS } from '../constants'
import type { WidgetLayout, WidgetSpacing, WidgetTypography } from '../types'

type Props = {
  spacing: WidgetSpacing
  typography: WidgetTypography
  layout: WidgetLayout
  onSetSpacing: <K extends keyof WidgetSpacing>(key: K, value: WidgetSpacing[K]) => void
  onSetTypography: <K extends keyof WidgetTypography>(key: K, value: WidgetTypography[K]) => void
  onSetLayout: <K extends keyof WidgetLayout>(key: K, value: WidgetLayout[K]) => void
}

const RangeField = ({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (v: number) => void
}) => (
  <label className="block space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-700">{value}{suffix ?? 'px'}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step ?? 1}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
    />
  </label>
)

const shadowOptions: Array<{ value: string; label: string }> = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'sm', label: 'Suave' },
  { value: 'md', label: 'Média' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'Extra' },
]

const imagePositionOptions: Array<{ value: string; label: string }> = [
  { value: 'top', label: 'Topo' },
  { value: 'left', label: 'Esquerda' },
  { value: 'right', label: 'Direita' },
  { value: 'none', label: 'Sem imagem' },
]

const WidgetEditorSpacing = ({
  spacing,
  typography,
  layout,
  onSetSpacing,
  onSetTypography,
  onSetLayout,
}: Props) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2">
      <Ruler className="h-4 w-4 text-slate-400" />
      <p className="text-sm font-semibold text-slate-700">Layout e Espaçamento</p>
    </div>

    <div className="space-y-4">
      <RangeField label="Padding" value={spacing.padding} min={8} max={48} onChange={(v) => onSetSpacing('padding', v)} />
      <RangeField label="Espaço entre elementos" value={spacing.gap} min={4} max={32} onChange={(v) => onSetSpacing('gap', v)} />
      <RangeField label="Borda arredondada" value={spacing.borderRadius} min={0} max={32} onChange={(v) => onSetSpacing('borderRadius', v)} />
      <RangeField label="Espessura da borda" value={layout.borderWidth} min={0} max={4} onChange={(v) => onSetLayout('borderWidth', v)} />
    </div>

    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500">Sombra</p>
      <div className="flex flex-wrap gap-2">
        {shadowOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSetLayout('shadowIntensity', opt.value as WidgetLayout['shadowIntensity'])}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              layout.shadowIntensity === opt.value
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>

    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500">Posição da Imagem</p>
      <div className="flex flex-wrap gap-2">
        {imagePositionOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSetLayout('imagePosition', opt.value as WidgetLayout['imagePosition'])}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              layout.imagePosition === opt.value
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {layout.imagePosition !== 'none' && (
        <RangeField
          label={layout.imagePosition === 'top' ? 'Altura da imagem' : 'Largura da imagem'}
          value={layout.imageHeight}
          min={60}
          max={300}
          onChange={(v) => onSetLayout('imageHeight', v)}
        />
      )}
    </div>

    <div className="space-y-4">
      <p className="text-xs font-semibold text-slate-500">Tipografia</p>
      <RangeField label="Tamanho do título" value={typography.headlineSize} min={12} max={32} onChange={(v) => onSetTypography('headlineSize', v)} />
      <div className="space-y-1.5">
        <span className="text-xs text-slate-500">Peso do título</span>
        <select
          value={typography.headlineWeight}
          onChange={(e) => onSetTypography('headlineWeight', e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-300"
        >
          {FONT_WEIGHT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <RangeField label="Tamanho da descrição" value={typography.descriptionSize} min={10} max={20} onChange={(v) => onSetTypography('descriptionSize', v)} />
      <RangeField label="Tamanho do botão" value={typography.ctaSize} min={10} max={20} onChange={(v) => onSetTypography('ctaSize', v)} />
    </div>

    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-between">
        <span className="text-xs text-slate-500">Mostrar botão de recusar</span>
        <div
          className={`relative h-5 w-9 rounded-full transition ${layout.showDismiss ? 'bg-blue-500' : 'bg-slate-200'}`}
          onClick={() => onSetLayout('showDismiss', !layout.showDismiss)}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              layout.showDismiss ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </div>
      </label>
      {layout.showDismiss && (
        <label className="block space-y-1.5">
          <span className="text-xs text-slate-500">Texto do botão recusar</span>
          <input
            type="text"
            value={layout.dismissText}
            onChange={(e) => onSetLayout('dismissText', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-300"
          />
        </label>
      )}
    </div>
  </div>
)

export default WidgetEditorSpacing
