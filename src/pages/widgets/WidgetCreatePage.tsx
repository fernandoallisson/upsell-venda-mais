import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardPage from '../../components/layout/DashboardPage'
import WidgetBuilderForm from '../../features/widgets/components/WidgetBuilderForm'
import { ApiError } from '../../lib/api'
import { createWidget, WidgetValidationError } from '../../lib/services/widgets/widgets.service'
import type { WidgetFormPayload, WidgetApiValidationErrors } from '../../types/widget'

const WidgetCreatePage = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<WidgetApiValidationErrors>({})

  const handleSubmit = async (payload: WidgetFormPayload) => {
    setSubmitting(true)
    setError(null)
    setValidationErrors({})

    try {
      const widget = await createWidget(payload)
      navigate(`/widget/${widget.id}`, { state: { success: 'Widget criado com sucesso.' } })
    } catch (err) {
      if (err instanceof WidgetValidationError) {
        setValidationErrors(err.errors)
        setError(err.message)
      } else {
        setError(err instanceof ApiError ? err.message : 'Erro ao criar widget')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardPage title="Novo Widget" subtitle="Crie templates visuais reutilizáveis para campanhas">
      <div className="space-y-4">
        {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <WidgetBuilderForm
          submitting={submitting}
          submitLabel="Criar widget"
          apiErrors={validationErrors}
          onSubmit={handleSubmit}
        />
      </div>
    </DashboardPage>
  )
}

export default WidgetCreatePage
