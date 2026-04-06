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
    <DashboardPage
      title="Novo Widget"
      subtitle="Escolha um modelo ou comece do zero para criar seu widget"
    >
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
