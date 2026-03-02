import { Copy } from 'lucide-react'
import { useState } from 'react'

type EndpointDoc = {
  method: 'GET' | 'POST'
  title: string
  path: string
  description: string
  query?: string[]
  body?: string
  successResponse?: string
  notFoundResponse?: string
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: 'GET',
    title: 'Obter oferta ativa para um cliente',
    path: '/api/v1/widget/offer',
    description: 'Retorna a melhor oferta disponível para o visitante no contexto atual.',
    query: [
      'customer_id=16',
      'email=gbailey%40example.net',
      'fingerprint=architecto',
      'product_id=16',
      'cart_value=4326.41688',
      'type=cart_drawer',
      'location=post_purchase',
    ],
    successResponse: `{
  "offer_id": 1,
  "campaign_id": 1,
  "product_id": 5,
  "headline": "Combo Especial",
  "description": "Ganhe 30% de desconto neste produto",
  "type": "post_purchase",
  "discount_type": "percentage",
  "discount_value": 30,
  "product": {
    "id": 5,
    "name": "Produto Premium",
    "image": "https://...",
    "price": "99.90",
    "variant_id": "12345"
  },
  "campaign": {
    "headline": "Promoção de Verão",
    "description": "Aproveite!",
    "cta_text": "Adicionar",
    "widget_css": null,
    "widget_html": null
  }
}`,
    notFoundResponse: `{
  "message": "Nenhuma oferta disponível no momento"
}`,
  },
  {
    method: 'POST',
    title: 'Registrar evento de upsell (track)',
    path: '/api/v1/widget/track',
    description: 'Registra ações individuais de interação com ofertas de upsell.',
    body: `{
  "offer_id": 16,
  "customer_id": 16,
  "visitor_id": "architecto",
  "session_id": "architecto",
  "action": "architecto",
  "metadata": []
}`,
    successResponse: `{
  "message": "Evento registrado com sucesso"
}`,
  },
  {
    method: 'POST',
    title: 'Registrar múltiplos eventos em lote',
    path: '/api/v1/widget/track/batch',
    description: 'Envia vários eventos em uma única requisição para reduzir overhead.',
    body: `{
  "events": [
    "architecto"
  ]
}`,
    successResponse: `{
  "message": "Eventos registrados com sucesso",
  "count": 3
}`,
  },
  {
    method: 'POST',
    title: 'Sincronizar contexto do visitante',
    path: '/api/v1/widget/visitor/sync',
    description: 'Atualiza dados de sessão, navegação, carrinho e aquisição do visitante.',
    body: `{
  "fingerprint": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "cart_value": 299.9,
  "cart_items": [123, 456],
  "current_page": "/produto/camiseta-azul",
  "product_id": 123,
  "category_id": 5,
  "utm_source": "instagram",
  "utm_medium": "social",
  "utm_campaign": "verao2026",
  "utm_term": "m",
  "utm_content": "i",
  "referrer": "https://google.com"
}`,
    successResponse: `{
  "visitor_id": "550e8400-e29b-41d4-a716-446655440000",
  "is_returning": true,
  "total_visits": 3,
  "page_views": 15,
  "cart_value": 299.9,
  "geo": {
    "country": "BR",
    "region": "São Paulo",
    "city": "São Paulo"
  }
}`,
  },
  {
    method: 'GET',
    title: 'Obter dados do visitante',
    path: '/api/v1/widget/visitor',
    description: 'Recupera o perfil consolidado de um visitante via fingerprint.',
    query: ['fingerprint=550e8400-e29b-41d4-a716-446655440000'],
    successResponse: `{
  "fingerprint": "550e8400-e29b-41d4-a716-446655440000",
  "is_returning": true,
  "total_visits": 3,
  "page_views": 15,
  "cart_value": 299.9,
  "device_type": "mobile",
  "geo": {
    "country": "BR",
    "region": "São Paulo",
    "city": "São Paulo"
  }
}`,
    notFoundResponse: `{
  "message": "Visitor not found"
}`,
  },
]

const CodeBlock = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-emerald-400">{value}</pre>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
      >
        <Copy className="h-3.5 w-3.5" />
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

const WidgetModuleDocs = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Widget</h2>
        <p className="mt-1 text-xs text-slate-500">
          Endpoints públicos do módulo Widget. Use o header <code>Authorization: Bearer {'{TENANT_API_KEY}'}</code> e
          <code> Accept: application/json</code> em todas as chamadas.
        </p>
      </div>

      <div className="space-y-4">
        {ENDPOINTS.map((endpoint) => {
          const query = endpoint.query?.length ? `?${endpoint.query.join('&')}` : ''
          const fullPath = `{{baseUrl}}${endpoint.path}${query}`

          return (
            <section key={`${endpoint.method}-${endpoint.path}`} className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    endpoint.method === 'GET'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {endpoint.method}
                </span>
                <p className="text-sm font-semibold text-slate-800">{endpoint.title}</p>
              </div>

              <p className="text-xs text-slate-500">{endpoint.description}</p>
              <CodeBlock value={fullPath} />
              {endpoint.body && <CodeBlock value={endpoint.body} />}
              {endpoint.successResponse && <CodeBlock value={endpoint.successResponse} />}
              {endpoint.notFoundResponse && <CodeBlock value={endpoint.notFoundResponse} />}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default WidgetModuleDocs
