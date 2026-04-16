import type { CampaignFormState } from '../types'

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
  { key: 'cooldown_minutes', label: 'Cooldown (min)', hint: 'Intervalo entre exibições' },
  { key: 'max_per_session', label: 'Max por Sessão', hint: 'Exibições por sessão' },
  { key: 'max_per_day', label: 'Max por Dia', hint: 'Exibições por dia' },
  { key: 'max_total', label: 'Max Total', hint: 'Total de exibições' },
  {
    key: 'block_after_conversion_days',
    label: 'Bloquear após conversão',
    hint: 'Dias sem exibir após compra',
  },
]

const FrequencySection = ({ form, onSet }: Props) => (
  <div className="grid gap-3 sm:grid-cols-2">
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
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
        />
        <p className="text-[10px] text-slate-400">{field.hint}</p>
      </label>
    ))}
  </div>
)

export default FrequencySection
