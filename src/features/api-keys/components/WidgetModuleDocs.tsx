import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ApiError } from '../../../lib/api'
import {
  getWidgetOffer,
  getWidgetVisitor,
  syncWidgetVisitor,
  trackWidgetBatch,
  trackWidgetEvent,
} from '../../../lib/services/widgets/widgets.service'

const ValueView = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined) return <span className="text-slate-400">—</span>
  if (typeof value === 'boolean') return <span>{value ? 'true' : 'false'}</span>
  if (typeof value === 'number' || typeof value === 'string') return <span>{String(value)}</span>

  if (Array.isArray(value)) {
    return (
      <div className="space-y-1">
        {value.length === 0 ? <span className="text-slate-400">Lista vazia</span> : null}
        {value.map((item, index) => (
          <div key={index} className="rounded bg-slate-50 px-2 py-1">
            <ValueView value={item} />
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === 'object') {
    return (
      <div className="space-y-1">
        {Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => (
          <div key={key} className="grid grid-cols-3 gap-2 rounded bg-slate-50 px-2 py-1">
            <span className="font-medium text-slate-700">{key}</span>
            <div className="col-span-2 text-slate-600">
              <ValueView value={nestedValue} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return <span>{String(value)}</span>
}

const ResultPanel = ({ title, data }: { title: string; data: Record<string, unknown> | null }) => {
  if (!data) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-2 text-sm last:border-b-0">
            <span className="font-medium text-slate-700">{key}</span>
            <div className="col-span-2 text-slate-600">
              <ValueView value={value} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Input = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-slate-600">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
    />
  </label>
)

const WidgetModuleDocs = () => {
  const [tenantApiKey, setTenantApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [offerForm, setOfferForm] = useState({
    customer_id: '16',
    email: 'gbailey@example.net',
    fingerprint: 'architecto',
    product_id: '16',
    cart_value: '4326.41688',
    type: 'cart_drawer',
    location: 'post_purchase',
  })
  const [offerResult, setOfferResult] = useState<Record<string, unknown> | null>(null)

  const [trackForm, setTrackForm] = useState({
    offer_id: '16',
    customer_id: '16',
    visitor_id: 'architecto',
    session_id: 'architecto',
    action: 'architecto',
    metadata: '',
  })
  const [trackResult, setTrackResult] = useState<Record<string, unknown> | null>(null)

  const [batchEvents, setBatchEvents] = useState('architecto')
  const [batchResult, setBatchResult] = useState<Record<string, unknown> | null>(null)

  const [syncForm, setSyncForm] = useState({
    fingerprint: '550e8400-e29b-41d4-a716-446655440000',
    session_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    cart_value: '299.9',
    cart_items: '123,456',
    current_page: '/produto/camiseta-azul',
    product_id: '123',
    category_id: '5',
    utm_source: 'instagram',
    utm_medium: 'social',
    utm_campaign: 'verao2026',
    utm_term: 'm',
    utm_content: 'i',
    referrer: 'https://google.com',
  })
  const [syncResult, setSyncResult] = useState<Record<string, unknown> | null>(null)

  const [visitorFingerprint, setVisitorFingerprint] = useState('550e8400-e29b-41d4-a716-446655440000')
  const [visitorResult, setVisitorResult] = useState<Record<string, unknown> | null>(null)

  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const hasConfig = useMemo(() => Boolean(tenantApiKey.trim()), [tenantApiKey])

  const runAction = async (id: string, action: () => Promise<Record<string, unknown>>, onSuccess: (data: Record<string, unknown>) => void) => {
    setError(null)
    setLoadingAction(id)
    try {
      const response = await action()
      onSuccess(response)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao executar chamada do Widget.')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Widget</h2>
        <p className="text-xs text-slate-500">Teste e valide os endpoints do Widget diretamente pelo painel.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="TENANT_API_KEY" value={tenantApiKey} onChange={setTenantApiKey} />
        </div>
        {error && <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">GET · Obter oferta ativa para um cliente</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(offerForm).map(([key, value]) => (
            <Input key={key} label={key} value={value} onChange={(v) => setOfferForm((p) => ({ ...p, [key]: v }))} />
          ))}
        </div>
        <button
          type="button"
          disabled={!hasConfig || loadingAction === 'offer'}
          onClick={() => runAction('offer', () => getWidgetOffer(tenantApiKey, offerForm), setOfferResult)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loadingAction === 'offer' && <Loader2 className="h-4 w-4 animate-spin" />} Executar
        </button>
        <ResultPanel title="Resposta da oferta" data={offerResult} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">POST · Registrar evento de upsell (track)</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="offer_id" type="number" value={trackForm.offer_id} onChange={(v) => setTrackForm((p) => ({ ...p, offer_id: v }))} />
          <Input label="customer_id" type="number" value={trackForm.customer_id} onChange={(v) => setTrackForm((p) => ({ ...p, customer_id: v }))} />
          <Input label="visitor_id" value={trackForm.visitor_id} onChange={(v) => setTrackForm((p) => ({ ...p, visitor_id: v }))} />
          <Input label="session_id" value={trackForm.session_id} onChange={(v) => setTrackForm((p) => ({ ...p, session_id: v }))} />
          <Input label="action" value={trackForm.action} onChange={(v) => setTrackForm((p) => ({ ...p, action: v }))} />
          <Input label="metadata (separado por vírgula)" value={trackForm.metadata} onChange={(v) => setTrackForm((p) => ({ ...p, metadata: v }))} />
        </div>
        <button
          type="button"
          disabled={!hasConfig || loadingAction === 'track'}
          onClick={() => runAction('track', () => trackWidgetEvent(tenantApiKey, {
            offer_id: Number(trackForm.offer_id),
            customer_id: Number(trackForm.customer_id),
            visitor_id: trackForm.visitor_id,
            session_id: trackForm.session_id,
            action: trackForm.action,
            metadata: trackForm.metadata ? trackForm.metadata.split(',').map((item) => item.trim()).filter(Boolean) : [],
          }), setTrackResult)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loadingAction === 'track' && <Loader2 className="h-4 w-4 animate-spin" />} Executar
        </button>
        <ResultPanel title="Resposta do track" data={trackResult} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">POST · Registrar múltiplos eventos em lote</h3>
        <Input label="events (separados por vírgula)" value={batchEvents} onChange={setBatchEvents} />
        <button
          type="button"
          disabled={!hasConfig || loadingAction === 'batch'}
          onClick={() => runAction('batch', () => trackWidgetBatch(tenantApiKey, {
            events: batchEvents.split(',').map((item) => item.trim()).filter(Boolean),
          }), setBatchResult)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loadingAction === 'batch' && <Loader2 className="h-4 w-4 animate-spin" />} Executar
        </button>
        <ResultPanel title="Resposta do batch" data={batchResult} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">POST · Sincronizar contexto do visitante</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(syncForm).map(([key, value]) => (
            <Input key={key} label={key} value={value} onChange={(v) => setSyncForm((p) => ({ ...p, [key]: v }))} />
          ))}
        </div>
        <button
          type="button"
          disabled={!hasConfig || loadingAction === 'sync'}
          onClick={() => runAction('sync', () => syncWidgetVisitor(tenantApiKey, {
            fingerprint: syncForm.fingerprint,
            session_id: syncForm.session_id,
            cart_value: Number(syncForm.cart_value),
            cart_items: syncForm.cart_items.split(',').map((v) => Number(v.trim())).filter((n) => !Number.isNaN(n)),
            current_page: syncForm.current_page,
            product_id: Number(syncForm.product_id),
            category_id: Number(syncForm.category_id),
            utm_source: syncForm.utm_source,
            utm_medium: syncForm.utm_medium,
            utm_campaign: syncForm.utm_campaign,
            utm_term: syncForm.utm_term,
            utm_content: syncForm.utm_content,
            referrer: syncForm.referrer,
          }), setSyncResult)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loadingAction === 'sync' && <Loader2 className="h-4 w-4 animate-spin" />} Executar
        </button>
        <ResultPanel title="Resposta da sincronização" data={syncResult} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">GET · Obter dados do visitante</h3>
        <Input label="fingerprint" value={visitorFingerprint} onChange={setVisitorFingerprint} />
        <button
          type="button"
          disabled={!hasConfig || loadingAction === 'visitor'}
          onClick={() => runAction('visitor', () => getWidgetVisitor(tenantApiKey, { fingerprint: visitorFingerprint }), setVisitorResult)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loadingAction === 'visitor' && <Loader2 className="h-4 w-4 animate-spin" />} Executar
        </button>
        <ResultPanel title="Resposta do visitante" data={visitorResult} />
      </section>
    </div>
  )
}

export default WidgetModuleDocs
