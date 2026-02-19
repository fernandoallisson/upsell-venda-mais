import { Calendar } from 'lucide-react'
import { DAYS_OF_WEEK, HOURS_OF_DAY } from '../constants'
import type { CampaignFormState } from '../types'

type Props = {
  form: CampaignFormState
  onSet: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void
  onToggleDay: (day: string) => void
  onToggleHour: (hour: string) => void
  onSelectAllHours: () => void
  onClearHours: () => void
}

const ScheduleSection = ({
  form,
  onSet,
  onToggleDay,
  onToggleHour,
  onSelectAllHours,
  onClearHours,
}: Props) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-center gap-2">
      <Calendar className="h-4 w-4 text-slate-400" />
      <p className="text-sm font-semibold text-slate-800">Periodo de Exibicao</p>
    </div>

    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">
            Inicio
          </label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => onSet('start_date', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
          />
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => onSet('start_time', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">
            Termino
          </label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => onSet('end_date', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
          />
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => onSet('end_time', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600">Dias da Semana</p>
        <div className="flex gap-1.5">
          {DAYS_OF_WEEK.map((day) => {
            const active = form.active_days.includes(day.value)
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => onToggleDay(day.value)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {day.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-600">Horas Ativas</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSelectAllHours}
              className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
            >
              Selecionar todas
            </button>
            <span className="text-slate-200">|</span>
            <button
              type="button"
              onClick={onClearHours}
              className="text-xs font-medium text-slate-400 transition hover:text-slate-600"
            >
              Limpar
            </button>
          </div>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {HOURS_OF_DAY.map((hour) => {
            const active = form.active_hours.includes(hour.value)
            return (
              <button
                key={hour.value}
                type="button"
                onClick={() => onToggleHour(hour.value)}
                className={`rounded-lg py-1.5 text-xs font-medium transition ${
                  active
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {hour.label}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-400">
          {form.active_hours.length} de 24 horas ativas
        </p>
      </div>
    </div>
  </section>
)

export default ScheduleSection
