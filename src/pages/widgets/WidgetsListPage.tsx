import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Pencil, Plus, RefreshCcw, RotateCcw, Trash2 } from 'lucide-react'
import DashboardPage from '../../components/layout/DashboardPage'
import WidgetFilters from '../../features/widgets/components/WidgetFilters'
import WidgetCardPreview from '../../features/widgets/components/WidgetCardPreview'
import WidgetStatusBadge from '../../features/widgets/components/WidgetStatusBadge'
import { ApiError, invalidateApiCache } from '../../lib/api'
import { API_CACHE_TAGS } from '../../lib/services/cacheTags'
import { deleteWidget, getWidgets, restoreWidget } from '../../lib/services/widgets/widgets.service'
import type { Widget, WidgetListParams, WidgetListResponse } from '../../types/widget'

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('pt-BR')
}

const WidgetsListPage = () => {
  const navigate = useNavigate()
  const [response, setResponse] = useState<WidgetListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [sort, setSort] = useState<NonNullable<WidgetListParams['sort']>>('created_at')
  const [order, setOrder] = useState<NonNullable<WidgetListParams['order']>>('desc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(3)

  const fetchWidgets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getWidgets({
        page,
        per_page: perPage,
        search: search.trim() || undefined,
        sort,
        order,
        is_active: status === 'all' ? undefined : status === 'active',
      })
      setResponse(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao listar widgets')
    } finally {
      setLoading(false)
    }
  }, [order, page, perPage, search, sort, status])

  useEffect(() => {
    fetchWidgets()
  }, [fetchWidgets])

  const handleDelete = async (widget: Widget) => {
    if (!window.confirm(`Deseja realmente deletar o widget "${widget.title}"?`)) return

    try {
      await deleteWidget(widget.id)
      setSuccess('Widget deletado com sucesso.')
      fetchWidgets()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao deletar widget')
    }
  }

  const handleRestore = async (widget: Widget) => {
    try {
      await restoreWidget(widget.id)
      setSuccess('Widget restaurado com sucesso.')
      fetchWidgets()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao restaurar widget')
    }
  }

  const items = response?.data ?? []
  const meta = response?.meta

  return (
    <DashboardPage title="Biblioteca de Widgets" subtitle="Gerencie templates visuais reutilizáveis para campanhas" containerClassName="viewport-workspace widgets-list-page max-w-7xl">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => {
            invalidateApiCache([API_CACHE_TAGS.widgets])
            fetchWidgets()
          }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            <RefreshCcw className="h-4 w-4" /> Atualizar
          </button>

          <button type="button" onClick={() => navigate('/widget/novo')} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Novo template
          </button>
        </div>

        <WidgetFilters
          search={search}
          status={status}
          sort={sort}
          order={order}
          perPage={perPage}
          onSearchChange={(value) => {
            setPage(1)
            setSearch(value)
          }}
          onStatusChange={(value) => {
            setPage(1)
            setStatus(value)
          }}
          onSortChange={setSort}
          onOrderChange={setOrder}
          onPerPageChange={(value) => {
            setPage(1)
            setPerPage(value)
          }}
        />

        {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {success ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">Carregando widgets...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">Nenhum widget encontrado.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {items.slice(0, 3).map((widget) => {
              return (
                <div key={widget.id} className={`widget-list-card rounded-2xl border bg-white p-4 ${widget.deleted_at ? 'border-rose-200' : 'border-slate-200'}`}>
                  <WidgetCardPreview widget={widget} />
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{widget.title}</h3>
                      </div>
                      <WidgetStatusBadge active={widget.is_active} />
                    </div>
                    <p className="text-xs text-slate-500">Atualizado em {formatDate(widget.updated_at || widget.created_at)}</p>
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
                      <Link to={`/widget/${widget.id}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><Eye className="h-4 w-4" /></Link>
                      <Link to={`/widget/${widget.id}/editar`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><Pencil className="h-4 w-4" /></Link>
                      {widget.deleted_at ? (
                        <button type="button" onClick={() => handleRestore(widget)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"><RotateCcw className="h-4 w-4" /></button>
                      ) : (
                        <button type="button" onClick={() => handleDelete(widget)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {meta ? (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <p>Página {meta.current_page} de {meta.last_page} • {meta.total} itens</p>
            <div className="flex gap-2">
              <button type="button" disabled={meta.current_page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50">Anterior</button>
              <button type="button" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50">Próxima</button>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardPage>
  )
}

export default WidgetsListPage
