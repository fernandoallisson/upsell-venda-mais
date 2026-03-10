import { useCallback, useEffect, useState } from 'react'
import {
  Loader2,
  Paintbrush,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import { ApiError } from '../lib/api'
import { getCampaigns } from '../lib/services/campaigns/campaigns.service'
import type { Campaign } from '../lib/services/campaigns/campaigns.types'
import WidgetEditor from '../features/widget/components/WidgetEditor'

const Widget = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCampaigns(1)
      setCampaigns(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar campanhas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  if (editingCampaign) {
    return (
      <DashboardPage title="Widget" subtitle="Personalizar widget da campanha" containerClassName="max-w-6xl">
        <WidgetEditor
          campaign={editingCampaign}
          onBack={() => setEditingCampaign(null)}
          onSaved={fetchCampaigns}
        />
      </DashboardPage>
    )
  }

  return (
    <DashboardPage title="Widget" subtitle="Personalize os widgets das suas campanhas">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Selecione uma campanha para personalizar seu widget visual
            </p>
          </div>
          <button
            type="button"
            onClick={fetchCampaigns}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Sparkles className="h-8 w-8 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700">Nenhuma campanha encontrada</p>
            <p className="mt-1 text-sm text-slate-400">
              Crie uma campanha para comecar a personalizar widgets.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                type="button"
                onClick={() => setEditingCampaign(campaign)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition">
                      {campaign.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Prioridade {campaign.priority}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      campaign.is_active
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {campaign.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                {campaign.headline && (
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2">
                    {campaign.headline}
                  </p>
                )}

                {campaign.display_locations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {campaign.display_locations.map((loc) => (
                      <span
                        key={loc}
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600"
                      >
                        {loc.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
                  <Paintbrush className="h-3.5 w-3.5" />
                  Personalizar widget
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardPage>
  )
}

export default Widget
