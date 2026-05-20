import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Code,
  Eye,
  Key,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import { ApiError } from '../lib/api'
import {
  deleteApiKey,
  getApiKeys,
  toggleApiKeyActive,
} from '../lib/services/api-keys/api-keys.service'
import type { ApiKey, ApiKeyType } from '../lib/services/api-keys/api-keys.types'

const TYPE_LABELS: Record<ApiKeyType, string> = {
  pre_checkout: 'Pré-Checkout',
  post_purchase: 'Pós-Compra',
  cart_drawer: 'Cart Drawer',
  widget: 'Widget',
  webhook: 'Webhook',
  integration: 'Integração',
}

const TYPE_COLORS: Record<ApiKeyType, string> = {
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

const ScriptModal = ({
  apiKey,
  onClose,
}: {
  apiKey: ApiKey
  onClose: () => void
}) => {
  const [copied, setCopied] = useState(false)
  const script = `<script src="https://cdn.jsdelivr.net/gh/leo-lizi/it-upsell-sdk@0.0.1-beta/upsell.js" data-key="${apiKey.public_key}" data-api-base="https://vitor-api.vendamais.top/api" data-trigger="${apiKey.type}" data-debug="false"></script>`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
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
        Tem certeza que deseja remover <strong>{apiKey.name}</strong>? Esta ação não pode ser desfeita e quebrará integrações que usam essa chave.
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

const ApiKeys = () => {
  const navigate = useNavigate()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ApiKeyType | ''>('')
  const [scriptModal, setScriptModal] = useState<ApiKey | null>(null)
  const [deleteModal, setDeleteModal] = useState<ApiKey | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const fetchApiKeys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getApiKeys(typeFilter ? { type: typeFilter } : undefined)
      setApiKeys(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar chaves de API')
    } finally {
      setLoading(false)
    }
  }, [typeFilter])

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  const handleDelete = async () => {
    if (!deleteModal) return
    setDeleteLoading(true)
    try {
      await deleteApiKey(deleteModal.id)
      setApiKeys((prev) => prev.filter((k) => k.id !== deleteModal.id))
      setDeleteModal(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao remover chave')
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

  const filtered = apiKeys.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.public_key.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <DashboardPage
      title="Chaves de API"
      subtitle="Gerencie tokens de integração e scripts de incorporação"
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate('/tokens/nova')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:ml-auto sm:order-last"
          >
            <Plus className="h-4 w-4" />
            Nova Chave
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou chave..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ApiKeyType | '')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300"
          >
            <option value="">Todos os tipos</option>
            <option value="pre_checkout">Pré-Checkout</option>
            <option value="post_purchase">Pós-Compra</option>
            <option value="cart_drawer">Cart Drawer</option>
          </select>
          <button
            type="button"
            onClick={fetchApiKeys}
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Key className="h-8 w-8 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700">Nenhuma chave encontrada</p>
            <p className="mt-1 text-sm text-slate-400">
              {search || typeFilter ? 'Tente ajustar os filtros.' : 'Crie sua primeira chave de API.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Tipo</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 md:table-cell">Chave Pública</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 lg:table-cell">Último Uso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((key) => (
                  <tr key={key.id} className="transition hover:bg-slate-50/50">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-slate-900">{key.name}</p>
                      <p className="text-xs text-slate-400">Criada em {formatDate(key.created_at)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${TYPE_COLORS[key.type]}`}>
                        {TYPE_LABELS[key.type]}
                      </span>
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
                            <span className="text-emerald-600 font-medium">Ativo</span>
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

export default ApiKeys
