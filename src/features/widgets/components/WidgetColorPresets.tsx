import { useState } from 'react'
import { Check, Palette } from 'lucide-react'

type ColorScheme = {
  id: string
  name: string
  bg: string
  text: string
  button: string
  border: string
}

const colorSchemes: ColorScheme[] = [
  { id: 'light-blue', name: 'Azul Claro', bg: '#ffffff', text: '#0f172a', button: '#2563eb', border: '#e2e8f0' },
  { id: 'light-green', name: 'Verde Claro', bg: '#ffffff', text: '#0f172a', button: '#16a34a', border: '#e2e8f0' },
  { id: 'light-purple', name: 'Roxo Claro', bg: '#ffffff', text: '#0f172a', button: '#7c3aed', border: '#e2e8f0' },
  { id: 'light-rose', name: 'Rosa Claro', bg: '#ffffff', text: '#0f172a', button: '#e11d48', border: '#e2e8f0' },
  { id: 'light-amber', name: 'Âmbar Claro', bg: '#fffbeb', text: '#78350f', button: '#d97706', border: '#fde68a' },
  { id: 'dark-modern', name: 'Escuro Moderno', bg: '#0f172a', text: '#f1f5f9', button: '#3b82f6', border: '#1e293b' },
  { id: 'dark-gold', name: 'Escuro Dourado', bg: '#020617', text: '#f1f5f9', button: '#f59e0b', border: '#1e293b' },
  { id: 'dark-red', name: 'Escuro Vermelho', bg: '#0f172a', text: '#f8fafc', button: '#ef4444', border: '#1e293b' },
  { id: 'warm-promo', name: 'Promoção Quente', bg: '#fef3c7', text: '#78350f', button: '#dc2626', border: '#fbbf24' },
  { id: 'soft-violet', name: 'Violeta Suave', bg: '#f5f3ff', text: '#3b0764', button: '#6d28d9', border: '#ddd6fe' },
  { id: 'ocean', name: 'Oceano', bg: '#ecfeff', text: '#164e63', button: '#0891b2', border: '#a5f3fc' },
  { id: 'slate-neutral', name: 'Neutro', bg: '#f8fafc', text: '#334155', button: '#475569', border: '#e2e8f0' },
]

type Props = {
  currentBg: string
  currentText: string
  currentButton: string
  currentBorder: string
  onApply: (scheme: { bg: string; text: string; button: string; border: string }) => void
  onChangeColor: (key: 'backgroundColor' | 'textColor' | 'buttonColor' | 'borderColor', value: string) => void
}

const WidgetColorPresets = ({ currentBg, currentText, currentButton, currentBorder, onApply, onChangeColor }: Props) => {
  const [showCustom, setShowCustom] = useState(false)

  const isActive = (s: ColorScheme) => s.bg === currentBg && s.text === currentText && s.button === currentButton && s.border === currentBorder

  return (
    <div className="space-y-4">
      {/* Preset Swatches */}
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Paletas prontas</p>
        <div className="grid grid-cols-4 gap-2">
          {colorSchemes.map((scheme) => {
            const active = isActive(scheme)
            return (
              <button
                key={scheme.id}
                type="button"
                onClick={() => onApply({ bg: scheme.bg, text: scheme.text, button: scheme.button, border: scheme.border })}
                title={scheme.name}
                className={`group relative flex h-10 overflow-hidden rounded-lg border-2 transition-all ${
                  active ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex-1" style={{ backgroundColor: scheme.bg }} />
                <div className="w-3" style={{ backgroundColor: scheme.button }} />
                <div className="w-2" style={{ backgroundColor: scheme.text }} />
                {active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Colors Toggle */}
      <button
        type="button"
        onClick={() => setShowCustom(!showCustom)}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
      >
        <Palette className="h-3.5 w-3.5" />
        {showCustom ? 'Ocultar cores personalizadas' : 'Personalizar cores manualmente'}
      </button>

      {/* Custom Color Inputs */}
      {showCustom && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <ColorInput label="Fundo" value={currentBg} onChange={(v) => onChangeColor('backgroundColor', v)} />
          <ColorInput label="Texto" value={currentText} onChange={(v) => onChangeColor('textColor', v)} />
          <ColorInput label="Botão" value={currentButton} onChange={(v) => onChangeColor('buttonColor', v)} />
          <ColorInput label="Borda" value={currentBorder} onChange={(v) => onChangeColor('borderColor', v)} />
        </div>
      )}
    </div>
  )
}

const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="flex items-center gap-2">
    <div className="relative">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
      <div className="h-8 w-8 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: value }} />
    </div>
    <div className="min-w-0 flex-1">
      <span className="block text-[11px] font-medium text-slate-500">{label}</span>
      <span className="block text-xs font-mono text-slate-700">{value}</span>
    </div>
  </label>
)

export default WidgetColorPresets
