import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, Check, Globe, Plus, Trash2 } from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import { ApiError } from '../lib/api'
import { getApiKeyById, updateApiKey } from '../lib/services/api-keys/api-keys.service'
import type { ApiKey, ApiKeyType } from '../lib/services/api-keys/api-keys.types'

const TYPE_OPTIONS: { value: ApiKeyType; label: string; description: string }[] = [
  { value: 'pre_checkout', label: 'Pré-Checkout', description: 'Exibe antes da finalização da compra' },
  { value: 'post_purchase', label: 'Pós-Compra', description: 'Exibe após o pedido ser concluído' },
  { value: 'cart_drawer', label: 'Cart Drawer', description: 'Exibe no painel lateral do carrinho' },
]

type FormState = {
  name: string
  type: ApiKeyType
  allowed_origins: string[]
  rate_limit: number
  is_active: boolean
  debug: boolean
}

const OriginsInput = ({
  origins,
  onChange,
}: {
  origins: string[]
  onChange: (v: string[]) => void
}) => {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (!trimmed || origins.includes(trimmed)) return
    onChange([...origins, trimmed])
    setInput('')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
            placeholder="https://minhaloja.com.br"
            className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300"
          />
        </div>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </button>
      </div>
      {origins.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {origins.map((origin) => (
            <span
              key={origin}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
            >
              {origin}
              <button
                type="button"
                onClick={() => onChange(origins.filter((o) => o !== origin))}
                className="text-slate-400 transition hover:text-rose-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
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

const EditApiKey = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState<ApiKey | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const fetchApiKey = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getApiKeyById(Number(id))
      setApiKey(data)
      setForm({
        name: data.name,
        type: data.type,
        allowed_origins: data.allowed_origins,
        rate_limit: data.rate_limit ?? 1000,
        is_active: data.is_active,
        debug: false,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar chave de API')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchApiKey()
  }, [fetchApiKey])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form || !apiKey) return
    if (!form.name.trim()) {
      setError('O nome é obrigatório.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await updateApiKey(apiKey.id, {
        name: form.name,
        type: form.type,
        allowed_origins: form.allowed_origins,
        rate_limit: form.rate_limit,
        is_active: form.is_active,
      })
      setSaved(true)
      setTimeout(() => {
        navigate(`/tokens/${apiKey.id}`)
      }, 800)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao atualizar chave de API')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardPage title="Editar Chave de API" subtitle="Carregando...">
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
        </div>
      </DashboardPage>
    )
  }

  if (error && !form) {
    return (
      <DashboardPage title="Editar Chave de API" subtitle="Erro">
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      </DashboardPage>
    )
  }

  if (!form || !apiKey) return null

  const scriptPreview = `<script src="https://cdn.jsdelivr.net/gh/leo-lizi/it-upsell-sdk@0.0.1-beta/upsell.js" data-key="${apiKey.public_key}" data-api-base="https://vitor-api.vendamais.top/api" data-trigger="${form.type}" data-debug="${form.debug}"><\/script>`

  return (
    <DashboardPage
      title={`Editar: ${apiKey.name}`}
      subtitle="Atualize as configurações da chave de API"
    >
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => navigate(`/tokens/${apiKey.id}`)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900">Informações Básicas</h2>

            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-600">Chave Pública</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 break-all">
                  {apiKey.public_key}
                </code>
                <CopyButton value={apiKey.public_key} />
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-600">
                Nome da Chave <span className="text-rose-500">*</span>
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
              />
            </label>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600">Tipo de Gatilho</span>
              <div className="grid gap-2 sm:grid-cols-3">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('type', opt.value)}
                    className={`rounded-xl border p-3 text-left transition ${
                      form.type === opt.value
                        ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${form.type === opt.value ? 'text-blue-800' : 'text-slate-700'}`}>
                      {opt.label}
                    </p>
                    <p className={`mt-0.5 text-xs ${form.type === opt.value ? 'text-blue-600' : 'text-slate-400'}`}>
                      {opt.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-600">Rate Limit (req/hora)</span>
              <input
                type="number"
                min={1}
                value={form.rate_limit}
                onChange={(e) => set('rate_limit', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-300"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900">Origens Permitidas</h2>
            <OriginsInput
              origins={form.allowed_origins}
              onChange={(v) => set('allowed_origins', v)}
            />
            {form.allowed_origins.length === 0 && (
              <p className="text-xs text-slate-400">Sem restrições — todas as origens serão aceitas</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Configurações</h2>

            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Status da Chave</p>
                <p className="text-xs text-slate-400">{form.is_active ? 'Ativa e funcional' : 'Inativa e bloqueada'}</p>
              </div>
              <div
                className={`relative h-6 w-11 rounded-full transition ${form.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                onClick={() => set('is_active', !form.is_active)}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </div>
            </label>

            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {form.debug ? 'Ativo - modo debug' : 'Inativo - modo produção'}
                </p>
                <p className="text-xs text-slate-400">Altera o parâmetro data-debug no script</p>
              </div>
              <div
                className={`relative h-6 w-11 rounded-full transition ${form.debug ? 'bg-amber-400' : 'bg-slate-200'}`}
                onClick={() => set('debug', !form.debug)}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.debug ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/tokens/${apiKey.id}`)}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || saved}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${
                saved ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saved ? 'Salvo!' : submitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Preview do Script</h2>
            <p className="mb-3 text-xs text-slate-500">
              Atualizado em tempo real conforme você edita as configurações.
            </p>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-emerald-400 whitespace-pre-wrap break-all">
              {scriptPreview}
            </pre>
            <div className="mt-3 flex justify-end">
              <CopyButton value={scriptPreview} />
            </div>
          </div>
        </div>
      </div>
    </DashboardPage>
  )
}

export default EditApiKey
