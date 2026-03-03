import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Code,
  Eye,
  Globe,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Webhook,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import { ApiError } from '../lib/api'
import {
  createApiKey,
  deleteApiKey,
  getApiKeys,
  toggleApiKeyActive,
} from '../lib/services/api-keys/api-keys.service'
import type { ApiKey } from '../lib/services/api-keys/api-keys.types'

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

const ScriptModal = ({
  apiKey,
  onClose,
}: {
  apiKey: ApiKey
  onClose: () => void
}) => {
  const [copied, setCopied] = useState(false)
  const script = `<script src="https://cdn.jsdelivr.net/gh/leo-lizi/it-upsell-sdk@0.0.1-beta/upsell.js" data-key="${apiKey.public_key}" data-api-base="https://vitor-api.vendamais.top/api" data-trigger="${apiKey.type}" data-debug="false"><\/script>`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="font-semibold text-slate-900">Script de Incorporação</p>
            <p className="text-xs text-slate-500">{apiKey.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-emerald-400 whitespace-pre-wrap break-all">
            {script}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {copied ? 'Copiado!' : 'Copiar Script'}
          </button>
        </div>
      </div>
    </div>
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
          <h3 className="font-semibold text-slate-900">Chave Secreta Gerada</h3>
          <p className="text-xs text-amber-600 mt-0.5">
            Guarde agora! Esta chave não será exibida novamente.
          </p>
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
  apiKey,
  loading,
  onConfirm,
  onClose,
}: {
  apiKey: ApiKey
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
        <Trash2 className="h-6 w-6 text-rose-500" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-slate-900">Remover Widget</h3>
      <p className="mb-6 text-sm text-slate-500">
        Tem certeza que deseja remover <strong>{apiKey.name}</strong>? Esta ação não pode ser
        desfeita e quebrará integrações que usam essa chave.
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

type CreateFormState = {
  name: string
  allowed_origins: string[]
  rate_limit: number
  generate_secret: boolean
}

const CreateWidgetModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (secretKey?: string) => void
}) => {
  const [form, setForm] = useState<CreateFormState>({
    name: '',
    allowed_origins: [],
    rate_limit: 1000,
    generate_secret: false,
  })
  const [originInput, setOriginInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addOrigin = () => {
    const trimmed = originInput.trim()
    if (!trimmed || form.allowed_origins.includes(trimmed)) return
    setForm((p) => ({ ...p, allowed_origins: [...p.allowed_origins, trimmed] }))
    setOriginInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('O nome é obrigatório.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const result = await createApiKey({
        name: form.name,
        type: 'widget',
        allowed_origins: form.allowed_origins,
        rate_limit: form.rate_limit,
        generate_secret: form.generate_secret,
      })
      onSuccess(result.secret_key)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar Widget')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="font-semibold text-slate-900">Novo Widget</p>
            <p className="text-xs text-slate-500">
              Configure e gere uma nova chave de integração Widget
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Nome <span className="text-rose-500">*</span>
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Widget Loja Principal"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">Rate Limit (req/hora)</span>
            <input
              type="number"
              min={1}
              value={form.rate_limit}
              onChange={(e) => setForm((p) => ({ ...p, rate_limit: Number(e.target.value) }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-300"
            />
          </label>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-600">Origens Permitidas</span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={originInput}
                  onChange={(e) => setOriginInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addOrigin()
                    }
                  }}
                  placeholder="https://minhaloja.com.br"
                  className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300"
                />
              </div>
              <button
                type="button"
                onClick={addOrigin}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </button>
            </div>
            {form.allowed_origins.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.allowed_origins.map((origin) => (
                  <span
                    key={origin}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                  >
                    {origin}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          allowed_origins: p.allowed_origins.filter((o) => o !== origin),
                        }))
                      }
                      className="text-slate-400 transition hover:text-rose-500"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            {form.allowed_origins.length === 0 && (
              <p className="text-xs text-slate-400">
                Sem restrições — todas as origens serão aceitas
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Gerar Chave Secreta</p>
              <p className="text-xs text-slate-400">
                Cria uma chave secreta para autenticação server-side
              </p>
            </div>
            <div
              className={`relative h-6 w-11 rounded-full transition ${
                form.generate_secret ? 'bg-blue-500' : 'bg-slate-200'
              }`}
              onClick={() => setForm((p) => ({ ...p, generate_secret: !p.generate_secret }))}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.generate_secret ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </span>
              ) : (
                'Criar Widget'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Widget = () => {
  const navigate = useNavigate()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scriptModal, setScriptModal] = useState<ApiKey | null>(null)
  const [deleteModal, setDeleteModal] = useState<ApiKey | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [createModal, setCreateModal] = useState(false)
  const [secretKey, setSecretKey] = useState<string | null>(null)

  const fetchWidgets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getApiKeys({ type: 'widget' })
      setApiKeys(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar Widgets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWidgets()
  }, [fetchWidgets])

  const handleDelete = async () => {
    if (!deleteModal) return
    setDeleteLoading(true)
    try {
      await deleteApiKey(deleteModal.id)
      setApiKeys((prev) => prev.filter((k) => k.id !== deleteModal.id))
      setDeleteModal(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao remover Widget')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggle = async (id: number) => {
    setTogglingId(id)
    setApiKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, is_active: !k.is_active } : k)),
    )
    try {
      const updated = await toggleApiKeyActive(id)
      setApiKeys((prev) => prev.map((k) => (k.id === id ? updated : k)))
    } catch (err) {
      setApiKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, is_active: !k.is_active } : k)),
      )
      setError(err instanceof ApiError ? err.message : 'Erro ao alterar status')
    } finally {
      setTogglingId(null)
    }
  }

  const handleCreateSuccess = (sk?: string) => {
    setCreateModal(false)
    if (sk) {
      setSecretKey(sk)
    }
    fetchWidgets()
  }

  return (
    <DashboardPage
      title="Widget"
      subtitle="Gerencie suas integrações Widget"
    >
      <div className="space-y-5">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:ml-auto sm:order-last"
          >
            <Plus className="h-4 w-4" />
            Novo Widget
          </button>
          <button
            type="button"
            onClick={fetchWidgets}
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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Webhook className="h-8 w-8 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700">Nenhum Widget encontrado</p>
            <p className="mt-1 text-sm text-slate-400">Crie seu primeiro Widget para começar.</p>
            <button
              type="button"
              onClick={() => setCreateModal(true)}
              className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Criar Widget
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Nome
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 md:table-cell">
                    Chave Pública
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 lg:table-cell">
                    Último Uso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="transition hover:bg-slate-50/50">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-slate-900">{key.name}</p>
                      <p className="text-xs text-slate-400">
                        Criado em {formatDate(key.created_at)}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3.5 md:table-cell">
                      <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700">
                        {key.public_key}
                      </code>
                    </td>
                    <td className="hidden px-4 py-3.5 text-sm text-slate-500 lg:table-cell">
                      {formatDate(key.last_used_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggle(key.id)}
                        disabled={togglingId === key.id}
                        className="flex items-center gap-1.5 text-sm transition disabled:opacity-60"
                      >
                        {key.is_active ? (
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
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setScriptModal(key)}
                          title="Ver Script"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Code className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/tokens/${key.id}`)}
                          title="Visualizar"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/tokens/${key.id}/editar`)}
                          title="Editar"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModal(key)}
                          title="Remover"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createModal && (
        <CreateWidgetModal
          onClose={() => setCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {secretKey && (
        <SecretKeyModal
          secretKey={secretKey}
          onClose={() => {
            setSecretKey(null)
          }}
        />
      )}

      {scriptModal && (
        <ScriptModal apiKey={scriptModal} onClose={() => setScriptModal(null)} />
      )}

      {deleteModal && (
        <DeleteConfirmModal
          apiKey={deleteModal}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onClose={() => setDeleteModal(null)}
        />
      )}
    </DashboardPage>
  )
}

export default Widget
