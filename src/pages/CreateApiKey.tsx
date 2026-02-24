import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, Plus, Trash2 } from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import { ApiError } from '../lib/api'
import { createApiKey } from '../lib/services/api-keys/api-keys.service'
import type { ApiKeyType } from '../lib/services/api-keys/api-keys.types'

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
  generate_secret: boolean
  debug: boolean
}

const DEFAULT_FORM: FormState = {
  name: '',
  type: 'pre_checkout',
  allowed_origins: [],
  rate_limit: 1000,
  generate_secret: false,
  debug: false,
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

const CreateApiKey = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [createdId, setCreatedId] = useState<number | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
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
        type: form.type,
        allowed_origins: form.allowed_origins,
        rate_limit: form.rate_limit,
        generate_secret: form.generate_secret,
      })
      setCreatedId(result.id)
      if (result.secret_key) {
        setSecretKey(result.secret_key)
      } else {
        navigate('/tokens')
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar chave de API')
    } finally {
      setSubmitting(false)
    }
  }

  const scriptPreview = `<script src="https://cdn.jsdelivr.net/gh/leo-lizi/it-upsell-sdk@0.0.1-beta/upsell.js" data-key="[SUA_CHAVE_PUBLICA]" data-api-base="https://vitor-api.vendamais.top/api" data-trigger="${form.type}" data-debug="${form.debug}"><\/script>`

  return (
    <DashboardPage
      title="Nova Chave de API"
      subtitle="Configure e gere um novo token de integração"
    >
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/tokens')}
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

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-600">
                Nome da Chave <span className="text-rose-500">*</span>
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ex: Widget Loja Principal"
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
              <p className="text-xs text-slate-400">Número máximo de requisições por hora</p>
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
            <h2 className="text-sm font-semibold text-slate-900">Configurações Avançadas</h2>

            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Gerar Chave Secreta</p>
                <p className="text-xs text-slate-400">Cria uma chave secreta para autenticação server-side</p>
              </div>
              <div
                className={`relative h-6 w-11 rounded-full transition ${form.generate_secret ? 'bg-blue-500' : 'bg-slate-200'}`}
                onClick={() => set('generate_secret', !form.generate_secret)}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.generate_secret ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </div>
            </label>

            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {form.debug ? 'Ativo - modo debug' : 'Inativo - modo produção'}
                </p>
                <p className="text-xs text-slate-400">Exibe logs detalhados no console do navegador</p>
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
              onClick={() => navigate('/tokens')}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Criando...' : 'Criar Chave'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Preview do Script</h2>
            <p className="mb-3 text-xs text-slate-500">
              Cole este script no &lt;head&gt; ou antes do &lt;/body&gt; do seu site.
            </p>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-emerald-400 whitespace-pre-wrap break-all">
              {scriptPreview}
            </pre>
            <p className="mt-3 text-xs text-slate-400">
              A chave pública real será exibida após a criação.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <p className="text-xs font-semibold text-amber-800">Importante</p>
            <p className="mt-1 text-xs text-amber-700">
              Se você ativar "Gerar Chave Secreta", guarde-a imediatamente após a criação. Ela não poderá ser visualizada novamente.
            </p>
          </div>
        </div>
      </div>

      {secretKey && (
        <SecretKeyModal
          secretKey={secretKey}
          onClose={() => {
            setSecretKey(null)
            navigate(createdId ? `/tokens/${createdId}` : '/tokens')
          }}
        />
      )}
    </DashboardPage>
  )
}

export default CreateApiKey
