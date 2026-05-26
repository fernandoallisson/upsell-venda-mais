import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Copy,
  Pencil,
  RefreshCcw,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import WorkspaceTabs from '../components/layout/WorkspaceTabs'
import { ApiError } from '../lib/api'
import {
  deleteApiKey,
  getApiKeyById,
  regeneratePublicKey,
  regenerateSecretKey,
  toggleApiKeyActive,
} from '../lib/services/api-keys/api-keys.service'
import type { ApiKey } from '../lib/services/api-keys/api-keys.types'

const TYPE_LABELS: Record<string, string> = {
  pre_checkout: 'Pré-Checkout',
  post_purchase: 'Pós-Compra',
  cart_drawer: 'Cart Drawer',
  widget: 'Widget',
  webhook: 'Webhook',
  integration: 'Integração',
}

const TYPE_COLORS: Record<string, string> = {
  pre_checkout: 'bg-blue-50 text-blue-700 border-blue-200',
  post_purchase: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cart_drawer: 'bg-amber-50 text-amber-700 border-amber-200',
  widget: 'bg-blue-50 text-blue-700 border-blue-200',
  webhook: 'bg-slate-50 text-slate-700 border-slate-200',
  integration: 'bg-teal-50 text-teal-700 border-teal-200',
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        copied
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  )
}

const SecretKeyModal = ({
  secretKey,
  onClose,
}: {
  secretKey: string
  onClose: () => void
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(secretKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="font-semibold text-slate-900">Nova Chave Secreta</h3>
          <p className="text-xs text-amber-600 mt-0.5">Guarde agora! Esta chave não será exibida novamente.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-xl bg-slate-900 p-4">
            <code className="text-sm text-emerald-400 break-all">{secretKey}</code>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`w-full rounded-xl py-2.5 text-sm font-semibold transition ${
              copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {copied ? 'Copiado!' : 'Copiar Chave Secreta'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Entendi, fechar
          </button>
        </div>
      </div>
    </div>
  )
}

const DeleteConfirmModal = ({
  loading,
  onConfirm,
  onClose,
}: {
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
    <div
      className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
        <Trash2 className="h-6 w-6 text-rose-500" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-slate-900">Remover chave de API</h3>
      <p className="mb-6 text-sm text-slate-500">
        Tem certeza? Esta ação não pode ser desfeita e quebrará integrações que usam essa chave.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {loading ? 'Removendo...' : 'Remover'}
        </button>
      </div>
    </div>
  </div>
)

const ViewApiKey = () => {
  const [detailView, setDetailView] = useState<'summary' | 'credentials' | 'script' | 'actions'>('summary')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState<ApiKey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [regenPublicLoading, setRegenPublicLoading] = useState(false)
  const [regenSecretLoading, setRegenSecretLoading] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)

  const fetchApiKey = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getApiKeyById(Number(id))
      setApiKey(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar chave de API')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchApiKey()
  }, [fetchApiKey])

  const handleToggle = async () => {
    if (!apiKey) return
    setTogglingActive(true)
    try {
      const updated = await toggleApiKeyActive(apiKey.id)
      setApiKey(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao alterar status')
    } finally {
      setTogglingActive(false)
    }
  }

  const handleRegenPublic = async () => {
    if (!apiKey) return
    setRegenPublicLoading(true)
    try {
      const updated = await regeneratePublicKey(apiKey.id)
      setApiKey(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao regenerar chave pública')
    } finally {
      setRegenPublicLoading(false)
    }
  }

  const handleRegenSecret = async () => {
    if (!apiKey) return
    setRegenSecretLoading(true)
    try {
      const result = await regenerateSecretKey(apiKey.id)
      setApiKey(result)
      if (result.secret_key) {
        setSecretKey(result.secret_key)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao regenerar chave secreta')
    } finally {
      setRegenSecretLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!apiKey) return
    setDeleteLoading(true)
    try {
      await deleteApiKey(apiKey.id)
      navigate('/tokens')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao remover chave')
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardPage title="Chave de API" subtitle="Carregando...">
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
        </div>
      </DashboardPage>
    )
  }

  if (error && !apiKey) {
    return (
      <DashboardPage title="Chave de API" subtitle="Erro ao carregar">
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      </DashboardPage>
    )
  }

  if (!apiKey) return null

  const script = `<script src="https://cdn.jsdelivr.net/gh/leo-lizi/it-upsell-sdk@0.0.1-beta/upsell.js" data-key="${apiKey.public_key}" data-api-base="https://vitor-api.vendamais.top/api" data-trigger="${apiKey.type}" data-debug="false"></script>`

  return (
    <DashboardPage
      title={apiKey.name}
      subtitle="Detalhes da chave de API"
      containerClassName="viewport-workspace api-key-details max-w-7xl"
    >
      <div className="mb-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate('/tokens')}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          type="button"
          onClick={() => navigate(`/tokens/${apiKey.id}/editar`)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <WorkspaceTabs
        value={detailView}
        onChange={setDetailView}
        tabs={[
          { value: 'summary', label: 'Resumo' },
          { value: 'credentials', label: 'Credenciais' },
          { value: 'script', label: 'Script' },
          { value: 'actions', label: 'Ações' },
        ]}
      />
      <div className="grid gap-4 md:min-h-0 md:flex-1 md:grid-cols-2">
        <div className="space-y-4">
          <div className={`desktop-workspace-panel ${detailView === 'summary' ? 'is-active' : ''} rounded-2xl border border-slate-200 bg-white p-6 space-y-4`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Informações Gerais</h2>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                disabled={togglingActive}
                className="flex items-center gap-1.5 text-sm transition disabled:opacity-60"
              >
                {apiKey.is_active ? (
                  <>
                    <ToggleRight className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium text-emerald-600">Ativo</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-500">Inativo</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Tipo de Gatilho</span>
                <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${TYPE_COLORS[apiKey.type] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                  {TYPE_LABELS[apiKey.type] ?? apiKey.type}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Rate Limit</span>
                <span className="font-medium text-slate-900">{apiKey.rate_limit != null ? `${apiKey.rate_limit} req/hora` : '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Criada em</span>
                <span className="text-slate-700">{formatDate(apiKey.created_at)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Último uso</span>
                <span className="text-slate-700">{formatDate(apiKey.last_used_at)}</span>
              </div>
            </div>

            {apiKey.allowed_origins.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-600">Origens Permitidas</p>
                <div className="flex flex-wrap gap-1.5">
                  {apiKey.allowed_origins.map((origin) => (
                    <span
                      key={origin}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                    >
                      {origin}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={`desktop-workspace-panel ${detailView === 'credentials' ? 'is-active' : ''} rounded-2xl border border-slate-200 bg-white p-6 space-y-4`}>
            <h2 className="text-sm font-semibold text-slate-900">Chaves de Acesso</h2>

            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-slate-600">Chave Pública</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 break-all">
                    {apiKey.public_key}
                  </code>
                  <CopyButton value={apiKey.public_key} />
                </div>
                <button
                  type="button"
                  onClick={handleRegenPublic}
                  disabled={regenPublicLoading}
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700 disabled:opacity-60"
                >
                  <RefreshCcw className={`h-3.5 w-3.5 ${regenPublicLoading ? 'animate-spin' : ''}`} />
                  {regenPublicLoading ? 'Regenerando...' : 'Regenerar chave pública'}
                </button>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="mb-1.5 text-xs font-semibold text-slate-600">Chave Secreta</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-400 break-all">
                    ••••••••••••••••••••••••••••••••
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleRegenSecret}
                  disabled={regenSecretLoading}
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700 disabled:opacity-60"
                >
                  <RefreshCcw className={`h-3.5 w-3.5 ${regenSecretLoading ? 'animate-spin' : ''}`} />
                  {regenSecretLoading ? 'Regenerando...' : 'Regenerar chave secreta'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`desktop-workspace-panel ${detailView === 'script' ? 'is-active' : ''} rounded-2xl border border-slate-200 bg-white p-6`}>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Script de Incorporação</h2>
            <p className="mb-3 text-xs text-slate-500">
              Cole este script no &lt;head&gt; ou antes do &lt;/body&gt; do seu site.
            </p>
            <pre className="overflow-hidden rounded-xl bg-slate-900 p-4 text-xs text-emerald-400 whitespace-pre-wrap break-all">
              {script}
            </pre>
            <div className="mt-3 flex justify-end">
              <CopyButton value={script} />
            </div>
          </div>

          <div className={`desktop-workspace-panel ${detailView === 'actions' ? 'is-active' : ''} rounded-2xl border border-rose-100 bg-white p-6`}>
            <h2 className="mb-1 text-sm font-semibold text-rose-700">Zona de Perigo</h2>
            <p className="mb-4 text-xs text-slate-500">
              Ao remover esta chave, todas as integrações que a utilizam serão quebradas imediatamente.
            </p>
            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              className="flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              Remover Chave de API
            </button>
          </div>
        </div>
      </div>

      {secretKey && (
        <SecretKeyModal secretKey={secretKey} onClose={() => setSecretKey(null)} />
      )}

      {deleteModal && (
        <DeleteConfirmModal
          loading={deleteLoading}
          onConfirm={handleDelete}
          onClose={() => setDeleteModal(false)}
        />
      )}
    </DashboardPage>
  )
}

export default ViewApiKey
