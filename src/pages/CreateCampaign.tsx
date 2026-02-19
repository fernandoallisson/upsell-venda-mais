import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Code2,
  HelpCircle,
  Loader2,
  Maximize2,
  Save,
  X,
} from 'lucide-react'
import { ApiError } from '../lib/api'
import { createCampaign } from '../lib/services/campaigns/campaigns.service'
import { useCreateCampaignForm } from '../features/campaigns/create/hooks/useCreateCampaignForm'
import { buildCampaignPayload } from '../features/campaigns/create/utils'
import BasicInfoSection from '../features/campaigns/create/sections/BasicInfoSection'
import ContentSection from '../features/campaigns/create/sections/ContentSection'
import ScheduleSection from '../features/campaigns/create/sections/ScheduleSection'
import FrequencySection from '../features/campaigns/create/sections/FrequencySection'
import VisualSection from '../features/campaigns/create/sections/VisualSection'
import PreviewPanel from '../features/campaigns/create/sections/PreviewPanel'

const CreateCampaign = () => {
  const navigate = useNavigate()
  const {
    form,
    set,
    segments,
    resourcesLoading,
    toggleDisplayLocation,
    toggleSegment,
    toggleDay,
    toggleHour,
    setAllHours,
    clearHours,
    setColors,
    setColor,
  } = useCreateCampaignForm()

  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showJson, setShowJson] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)

  const isValid = form.name.trim().length > 0

  const handleSave = async () => {
    if (!isValid) return
    setSaveStatus('loading')
    setSaveError(null)

    try {
      const payload = buildCampaignPayload(form)
      await createCampaign(payload)
      setSaveStatus('idle')
      navigate('/upsell/campanhas')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar campanha.'
      setSaveError(message)
      setSaveStatus('loading')
      setSaveStatus('error')
    }
  }

  const jsonPayload = buildCampaignPayload(form)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/upsell/campanhas')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">Nova Campanha</h1>
              <p className="text-xs text-slate-500">
                Crie e visualize sua campanha de upsell em tempo real
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() =>
              window.open('https://docs.vendamais.top/campanhas', '_blank')
            }
          >
            <HelpCircle className="h-4 w-4" />
            Como criar uma campanha?
          </button>
        </div>
      </div>

      {resourcesLoading && (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando recursos...
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <BasicInfoSection
              form={form}
              segments={segments}
              onSet={set}
              onToggleLocation={toggleDisplayLocation}
              onToggleSegment={toggleSegment}
            />
            <ContentSection form={form} onSet={set} />
          </div>

          <div className="space-y-6">
            <ScheduleSection
              form={form}
              onSet={set}
              onToggleDay={toggleDay}
              onToggleHour={toggleHour}
              onSelectAllHours={setAllHours}
              onClearHours={clearHours}
            />
            <FrequencySection form={form} onSet={set} />
            <VisualSection
              form={form}
              onSetColors={setColors}
              onSetColor={setColor}
            />
            <PreviewPanel form={form} />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
          <div>
            {saveStatus === 'error' && saveError && (
              <p className="text-sm font-medium text-rose-600">{saveError}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowJson(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Code2 className="h-4 w-4" />
              Ver JSON
            </button>

            <button
              type="button"
              onClick={() => setShowFullPreview(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Maximize2 className="h-4 w-4" />
              Preview Full
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid || saveStatus === 'loading'}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveStatus === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveStatus === 'loading' ? 'Salvando...' : 'Salvar Campanha'}
            </button>
          </div>
        </div>
      </div>

      {showJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-800">
                  Payload JSON
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowJson(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-emerald-400 overflow-x-auto">
                {JSON.stringify(jsonPayload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {showFullPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4">
          <div className="relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setShowFullPreview(false)}
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-slate-50"
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
            <PreviewPanel form={form} fullscreen />
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateCampaign
