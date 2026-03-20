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
    <DashboardPage title="Editar Widget" subtitle="Edite o template visual do widget">
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">Carregando widget...</div>
      ) : widget ? (
        <div className="space-y-4">
          {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <WidgetBuilderForm
            initialValue={widget}
            submitting={submitting}
            submitLabel="Salvar alterações"
            apiErrors={validationErrors}
            onSubmit={handleSubmit}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error ?? 'Widget não encontrado.'}</div>
      )}
    </DashboardPage>
  )
}

export default WidgetEditPage
