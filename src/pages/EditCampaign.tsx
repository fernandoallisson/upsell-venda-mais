import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  HelpCircle,
  Loader2,
  Maximize2,
  Save,
  X,
} from 'lucide-react'
import { ApiError } from '../lib/api'
import {
  getCampaignById,
  updateCampaign,
} from '../lib/services/campaigns/campaigns.service'
import type { Campaign } from '../lib/services/campaigns/campaigns.types'
import { useEditCampaignForm } from '../features/campaigns/edit/hooks/useEditCampaignForm'
import { buildCampaignPayload } from '../features/campaigns/create/utils'
import BasicInfoSection from '../features/campaigns/create/sections/BasicInfoSection'
import ContentSection from '../features/campaigns/create/sections/ContentSection'
import ScheduleSection from '../features/campaigns/create/sections/ScheduleSection'
import FrequencySection from '../features/campaigns/create/sections/FrequencySection'
import VisualSection from '../features/campaigns/create/sections/VisualSection'
import PreviewPanel from '../features/campaigns/create/sections/PreviewPanel'

const EditCampaign = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loadStatus, setLoadStatus] = useState<'loading' | 'error' | 'idle'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      navigate('/upsell/campanhas')
      return
    }

    const campaignId = Number(id)
    if (Number.isNaN(campaignId)) {
      navigate('/upsell/campanhas')
      return
    }

    const fetchCampaign = async () => {
      setLoadStatus('loading')
      setLoadError(null)
      try {
        const details = await getCampaignById(campaignId)
        const asCampaign: Campaign = {
          id: details.campaign.id,
          name: details.campaign.name,
          priority: details.campaign.priority,
          is_active: details.campaign.is_active,
          start_date: details.campaign.start_date,
          end_date: details.campaign.end_date,
          deleted_at: null,
          created_at: '',
          updated_at: '',
        }
        setCampaign(asCampaign)
        setLoadStatus('idle')
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao carregar campanha.'
        setLoadError(message)
        setLoadStatus('error')
      }
    }

    fetchCampaign()
  }, [id, navigate])

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
  } = useEditCampaignForm(campaign)

  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showFullPreview, setShowFullPreview] = useState(false)

  const isValid = form.name.trim().length > 0

  const handleSave = async () => {
    if (!isValid || !campaign) return
    setSaveStatus('loading')
    setSaveError(null)

    try {
      const payload = buildCampaignPayload(form)
      await updateCampaign(campaign.id, payload)
      setSaveStatus('idle')
      navigate('/upsell/campanhas')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao salvar campanha.'
      setSaveError(message)
      setSaveStatus('error')
    }
  }

  if (loadStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando campanha...
        </div>
      </div>
    )
  }

  if (loadStatus === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-rose-700">Erro ao carregar campanha</p>
          <p className="mt-1 text-sm text-rose-600">{loadError}</p>
          <button
            type="button"
            onClick={() => navigate('/upsell/campanhas')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </div>
    )
  }

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
              <h1 className="text-base font-bold text-slate-900">
                Editar Campanha
              </h1>
              <p className="text-xs text-slate-500">
                {campaign?.name ?? 'Carregando...'}
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
              {saveStatus === 'loading' ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>

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

export default EditCampaign
