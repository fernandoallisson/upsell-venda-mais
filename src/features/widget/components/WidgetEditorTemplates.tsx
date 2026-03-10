import { LayoutGrid } from 'lucide-react'
import { CARD_TEMPLATES } from '../constants'
import type { CardTemplate } from '../types'

type Props = {
  selected: CardTemplate
  onSelect: (template: CardTemplate) => void
}

const WidgetEditorTemplates = ({ selected, onSelect }: Props) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <LayoutGrid className="h-4 w-4 text-slate-400" />
      <p className="text-sm font-semibold text-slate-700">Modelo de Card</p>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      {CARD_TEMPLATES.map((tpl) => (
        <button
          key={tpl.key}
          type="button"
          onClick={() => onSelect(tpl.key)}
          className={`rounded-xl border p-4 text-left transition ${
            selected === tpl.key
              ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <p className={`text-sm font-semibold ${selected === tpl.key ? 'text-blue-700' : 'text-slate-800'}`}>
            {tpl.label}
          </p>
          <p className={`mt-1 text-xs ${selected === tpl.key ? 'text-blue-600' : 'text-slate-500'}`}>
            {tpl.description}
          </p>
        </button>
      ))}
    </div>
  </div>
)

export default WidgetEditorTemplates
