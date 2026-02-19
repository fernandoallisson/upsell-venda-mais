import { Repeat } from 'lucide-react'
import type { CampaignFormState } from '../types'
import CollapsibleSection from '../../../../components/layout/CollapsibleSection'

type Props = {
  form: CampaignFormState
  onSet: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void
}

type FieldConfig = {
  key: keyof CampaignFormState
  label: string
  hint: string
}

const FREQUENCY_FIELDS: FieldConfig[] = [
  { key: 'cooldown_minutes', label: 'Cooldown (min)', hint: 'Intervalo entre exibicoes' },
  { key: 'max_per_session', label: 'Max por Sessao', hint: 'Exibicoes por sessao' },
  { key: 'max_per_day', label: 'Max por Dia', hint: 'Exibicoes por dia' },
  { key: 'max_total', label: 'Max Total', hint: 'Total de exibicoes' },
  {
    key: 'block_after_conversion_days',
    label: 'Bloquear apos conversao (dias)',
    hint: 'Dias sem exibir apos compra',
  },
]

const FrequencySection = ({ form, onSet }: Props) => (
  <CollapsibleSection
    icon={<Repeat className="h-4 w-4" />}
    title="Frequência"
    defaultOpen={true}
  >
    <div className="grid gap-4 sm:grid-cols-2">
      {FREQUENCY_FIELDS.map((field) => (
        <label key={field.key} className="block space-y-1">
          <span className="text-xs font-semibold text-slate-600">
            {field.label}
          </span>
          <input
            type="number"
            min={0}
            value={form[field.key] as number}
            onChange={(e) =>
              onSet(field.key, Number(e.target.value) as CampaignFormState[typeof field.key])
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
          />
          <p className="text-xs text-slate-400">{field.hint}</p>
        </label>
      ))}
    </div>
  </CollapsibleSection>
)

export default FrequencySection
