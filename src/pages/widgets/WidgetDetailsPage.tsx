import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError } from '../../lib/api'
import DashboardPage from '../../components/layout/DashboardPage'
import WidgetStatusBadge from '../../features/widgets/components/WidgetStatusBadge'
import WidgetHtmlPreview from '../../features/widgets/components/WidgetHtmlPreview'
import { getWidgetById, getWidgetBySlug, restoreWidget } from '../../lib/services/widgets/widgets.service'
import type { Widget } from '../../types/widget'

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('pt-BR')
}

const WidgetDetailsPage = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>()
  const location = useLocation()
  const stateSuccess = useMemo(() => {
    if (typeof location.state === 'object' && location.state !== null && 'success' in location.state) return String(location.state.success)
    return null
  }, [location.state])

  const [widget, setWidget] = useState<Widget | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(stateSuccess)

  const fetchWidget = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = slug ? await getWidgetBySlug(slug) : await getWidgetById(Number(id))
      setWidget(data)
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null
      setError(apiError?.status === 404 ? 'Widget não encontrado.' : apiError?.message ?? 'Erro ao carregar detalhes do widget')
    } finally {
      setLoading(false)
    }
  }, [id, slug])

  useEffect(() => {
    fetchWidget()
  }, [fetchWidget])

  const handleRestore = async () => {
    if (!widget) return
    try {
      const restored = await restoreWidget(widget.id)
      setWidget(restored)
      setSuccess('Widget restaurado com sucesso.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao restaurar widget')
    }
  }

  return (
    <DashboardPage title="Detalhes do Widget" subtitle="Template visual, metadados e saída técnica gerada automaticamente">
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">Carregando...</div>
      ) : widget ? (
        <div className="space-y-4">
          {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {success ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{widget.title}</h2>
                  <p className="text-sm text-slate-500">Slug: {widget.slug || '—'}</p>
                </div>
                <WidgetStatusBadge active={widget.is_active} />
              </div>
              <WidgetHtmlPreview html={widget.html} css={widget.css} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <dl className="grid gap-2 text-sm text-slate-700">
                <div><dt className="font-semibold text-slate-500">Criado em</dt><dd>{formatDate(widget.created_at)}</dd></div>
                <div><dt className="font-semibold text-slate-500">Atualizado em</dt><dd>{formatDate(widget.updated_at)}</dd></div>
              </dl>
              <div>
                <p className="mb-1 text-sm font-semibold text-slate-700">Config visual (JSON)</p>
                <pre className="max-h-64 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-emerald-400">{JSON.stringify(widget.config, null, 2)}</pre>
              </div>
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">Aba técnica (HTML/CSS gerados)</summary>
                <div className="mt-3 grid gap-4">
                  <pre className="max-h-40 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-blue-300">{widget.html}</pre>
                  <pre className="max-h-40 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-fuchsia-300">{widget.css}</pre>
                </div>
              </details>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link to={`/widget/${widget.id}/editar`} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Editar</Link>
                <Link to="/widget" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Voltar para lista</Link>
                {widget.deleted_at ? (
                  <button type="button" onClick={handleRestore} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">Restaurar widget</button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error ?? 'Widget não encontrado.'}</div>
      )}
    </DashboardPage>
  )
}

export default WidgetDetailsPage
