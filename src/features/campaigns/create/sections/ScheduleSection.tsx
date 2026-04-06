import { DAYS_OF_WEEK, HOURS_OF_DAY } from '../constants'
import type { CampaignFormState } from '../types'

type Props = {
  form: CampaignFormState
  onSet: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void
  onToggleDay: (day: number) => void
  onToggleHour: (hour: number) => void
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
  <div className="space-y-4">
    {/* Date range */}
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">Início</label>
        <input
          type="date"
          value={form.start_date}
          onChange={(e) => onSet('start_date', e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
        />
        <input
          type="time"
          value={form.start_time}
          onChange={(e) => onSet('start_time', e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">Término</label>
        <input
          type="date"
          value={form.end_date}
          onChange={(e) => onSet('end_date', e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
        />
        <input
          type="time"
          value={form.end_time}
          onChange={(e) => onSet('end_time', e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
        />
      </div>
    </div>

    {/* Days of week */}
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

    {/* Active hours */}
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">Horas Ativas</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAllHours}
            className="text-[11px] font-medium text-blue-600 transition hover:text-blue-700"
          >
            Todas
          </button>
          <span className="text-slate-200">|</span>
          <button
            type="button"
            onClick={onClearHours}
            className="text-[11px] font-medium text-slate-400 transition hover:text-slate-600"
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
              className={`rounded-md py-1 text-[10px] font-medium transition ${
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
      <p className="text-[10px] text-slate-400">
        {form.active_hours.length}/24 horas ativas
      </p>
    </div>
  </div>
)

export default ScheduleSection
