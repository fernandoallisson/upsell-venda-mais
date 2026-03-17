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
    <DashboardPage title="Detalhes do Widget" subtitle="Visualize as informações e o preview do widget">
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
              {widget.config && typeof widget.config === 'object' ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Personalização</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(widget.config as Record<string, unknown>).backgroundColor ? (
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs">
                        <span className="inline-block h-4 w-4 rounded border border-slate-300" style={{ background: String((widget.config as Record<string, unknown>).backgroundColor) }} />
                        <span className="text-slate-600">Fundo: {String((widget.config as Record<string, unknown>).backgroundColor)}</span>
                      </div>
                    ) : null}
                    {(widget.config as Record<string, unknown>).textColor ? (
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs">
                        <span className="inline-block h-4 w-4 rounded border border-slate-300" style={{ background: String((widget.config as Record<string, unknown>).textColor) }} />
                        <span className="text-slate-600">Texto: {String((widget.config as Record<string, unknown>).textColor)}</span>
                      </div>
                    ) : null}
                    {(widget.config as Record<string, unknown>).buttonColor ? (
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs">
                        <span className="inline-block h-4 w-4 rounded border border-slate-300" style={{ background: String((widget.config as Record<string, unknown>).buttonColor) }} />
                        <span className="text-slate-600">Botão: {String((widget.config as Record<string, unknown>).buttonColor)}</span>
                      </div>
                    ) : null}
                    {(widget.config as Record<string, unknown>).borderColor ? (
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs">
                        <span className="inline-block h-4 w-4 rounded border border-slate-300" style={{ background: String((widget.config as Record<string, unknown>).borderColor) }} />
                        <span className="text-slate-600">Borda: {String((widget.config as Record<string, unknown>).borderColor)}</span>
                      </div>
                    ) : null}
                    {(widget.config as Record<string, unknown>).layout ? (
                      <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">Layout: {String((widget.config as Record<string, unknown>).layout)}</div>
                    ) : null}
                    {(widget.config as Record<string, unknown>).variant ? (
                      <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">Variante: {String((widget.config as Record<string, unknown>).variant)}</div>
                    ) : null}
                    {(widget.config as Record<string, unknown>).width ? (
                      <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">Largura: {String((widget.config as Record<string, unknown>).width)}px</div>
                    ) : null}
                    {(widget.config as Record<string, unknown>).borderRadius !== undefined ? (
                      <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">Arredondamento: {String((widget.config as Record<string, unknown>).borderRadius)}px</div>
                    ) : null}
                  </div>
                </div>
              ) : null}
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
