import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardPage from '../../components/layout/DashboardPage'
import WidgetBuilderForm from '../../features/widgets/components/WidgetBuilderForm'
import { ApiError } from '../../lib/api'
import { getWidgetById, updateWidget, WidgetValidationError } from '../../lib/services/widgets/widgets.service'
import type { WidgetFormPayload, Widget, WidgetApiValidationErrors } from '../../types/widget'

const WidgetEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [widget, setWidget] = useState<Widget | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<WidgetApiValidationErrors>({})

  const fetchWidget = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)

    try {
      const data = await getWidgetById(id)
      setWidget(data)
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null
      if (apiError?.status === 404) {
        setError('Widget não encontrado.')
      } else {
        setError(apiError?.message ?? 'Erro ao carregar widget')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchWidget()
  }, [fetchWidget])

  const handleSubmit = async (payload: WidgetFormPayload) => {
    if (!id) return
    setSubmitting(true)
    setError(null)
    setValidationErrors({})

    try {
      const updated = await updateWidget(id, payload)
      setWidget(updated)
      navigate(`/widget/${updated.id}`, { state: { success: 'Widget atualizado com sucesso.' } })
    } catch (err) {
      if (err instanceof WidgetValidationError) {
        setValidationErrors(err.errors)
        setError(err.message)
      } else {
        const apiError = err instanceof ApiError ? err : null
        if (apiError?.status === 404) {
          setError('Widget não encontrado.')
        } else {
          setError(apiError?.message ?? 'Erro ao atualizar widget')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardPage title="Editar Widget" subtitle="Personalize o template visual do widget">
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm text-slate-500">Carregando widget...</span>
          </div>
        </div>
      ) : widget ? (
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <svg className="h-5 w-5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          <WidgetBuilderForm
            initialValue={widget}
            submitting={submitting}
            submitLabel="Salvar alterações"
            apiErrors={validationErrors}
            onSubmit={handleSubmit}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <svg className="h-5 w-5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span>{error ?? 'Widget não encontrado.'}</span>
        </div>
      )}
    </DashboardPage>
  )
}

export default WidgetEditPage
