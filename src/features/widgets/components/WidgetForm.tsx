import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { CreateWidgetPayload, Widget, WidgetApiValidationErrors } from '../../../types/widget'

type WidgetFormProps = {
  initialValue?: Widget
  submitting: boolean
  submitLabel: string
  apiErrors?: WidgetApiValidationErrors
  onSubmit: (payload: CreateWidgetPayload) => Promise<void>
}

const WidgetForm = ({ initialValue, submitting, submitLabel, apiErrors, onSubmit }: WidgetFormProps) => {
  const [title, setTitle] = useState(initialValue?.title ?? '')
  const [config, setConfig] = useState(() => JSON.stringify(initialValue?.config ?? {}, null, 2))
  const [html, setHtml] = useState(initialValue?.html ?? '')
  const [css, setCss] = useState(initialValue?.css ?? '')
  const [isActive, setIsActive] = useState(initialValue?.is_active ?? true)
  const [localError, setLocalError] = useState<string | null>(null)

  const fieldErrors = useMemo(() => apiErrors ?? {}, [apiErrors])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLocalError(null)

    if (!title.trim() || !html.trim() || !css.trim() || !config.trim()) {
      setLocalError('Preencha todos os campos obrigatórios.')
      return
    }

    let parsedConfig: Record<string, unknown>
    try {
      const parsed = JSON.parse(config)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setLocalError('O campo config deve ser um objeto JSON válido.')
        return
      }
      parsedConfig = parsed
    } catch {
      setLocalError('O campo config deve conter JSON válido.')
      return
    }

    await onSubmit({
      title: title.trim(),
      config: parsedConfig,
      html,
      css,
      is_active: isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      {localError ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{localError}</div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Título *</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400"
          placeholder="Widget de Promoção"
        />
        {fieldErrors.title?.[0] ? <p className="mt-1 text-xs text-rose-600">{fieldErrors.title[0]}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Config (JSON) *</label>
        <textarea
          value={config}
          onChange={(event) => setConfig(event.target.value)}
          rows={8}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-xs outline-none transition focus:border-blue-400"
        />
        {fieldErrors.config?.[0] ? <p className="mt-1 text-xs text-rose-600">{fieldErrors.config[0]}</p> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">HTML *</label>
          <textarea
            value={html}
            onChange={(event) => setHtml(event.target.value)}
            rows={10}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-xs outline-none transition focus:border-blue-400"
          />
          {fieldErrors.html?.[0] ? <p className="mt-1 text-xs text-rose-600">{fieldErrors.html[0]}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">CSS *</label>
          <textarea
            value={css}
            onChange={(event) => setCss(event.target.value)}
            rows={10}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-xs outline-none transition focus:border-blue-400"
          />
          {fieldErrors.css?.[0] ? <p className="mt-1 text-xs text-rose-600">{fieldErrors.css[0]}</p> : null}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
        Widget ativo
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? 'Salvando...' : submitLabel}
      </button>
    </form>
  )
}

export default WidgetForm
