import { Copy } from 'lucide-react'
import { useState } from 'react'

type FieldDoc = {
  name: string
  type: string
  required?: boolean
  example: string
  description: string
}

type ResponseDoc = {
  status: number
  title: string
  fields: FieldDoc[]
}

type EndpointDoc = {
  method: 'GET' | 'POST'
  title: string
  path: string
  description: string
  queryFields?: FieldDoc[]
  bodyFields?: FieldDoc[]
  responses: ResponseDoc[]
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: 'GET',
    title: 'Obter oferta ativa para um cliente',
    path: '/api/v1/widget/offer',
    description: 'Retorna a melhor oferta disponível para o visitante no contexto atual.',
    queryFields: [
      { name: 'customer_id', type: 'number', required: true, example: '16', description: 'ID do cliente.' },
      { name: 'email', type: 'string', required: true, example: 'gbailey@example.net', description: 'Email do cliente.' },
      { name: 'fingerprint', type: 'string', required: true, example: 'architecto', description: 'Identificador do visitante.' },
      { name: 'product_id', type: 'number', required: true, example: '16', description: 'Produto principal do contexto.' },
      { name: 'cart_value', type: 'number', required: true, example: '4326.41688', description: 'Valor total do carrinho.' },
      { name: 'type', type: 'string', required: true, example: 'cart_drawer', description: 'Tipo de gatilho.' },
      { name: 'location', type: 'string', required: true, example: 'post_purchase', description: 'Posição/contexto da oferta.' },
    ],
    responses: [
      {
        status: 200,
        title: 'Oferta retornada com sucesso',
        fields: [
          { name: 'offer_id', type: 'number', example: '1', description: 'ID da oferta.' },
          { name: 'campaign_id', type: 'number', example: '1', description: 'ID da campanha.' },
          { name: 'headline', type: 'string', example: 'Combo Especial', description: 'Título da oferta.' },
          { name: 'discount_type', type: 'string', example: 'percentage', description: 'Tipo de desconto aplicado.' },
          { name: 'discount_value', type: 'number', example: '30', description: 'Valor percentual/fixo do desconto.' },
          { name: 'product.name', type: 'string', example: 'Produto Premium', description: 'Nome do item ofertado.' },
          { name: 'campaign.cta_text', type: 'string', example: 'Adicionar', description: 'Texto do botão de ação.' },
        ],
      },
      {
        status: 404,
        title: 'Nenhuma oferta disponível',
        fields: [
          { name: 'message', type: 'string', example: 'Nenhuma oferta disponível no momento', description: 'Mensagem de ausência de oferta.' },
        ],
      },
    ],
  },
  {
    method: 'POST',
    title: 'Registrar evento de upsell (track)',
    path: '/api/v1/widget/track',
    description: 'Registra ações individuais de interação com ofertas de upsell.',
    bodyFields: [
      { name: 'offer_id', type: 'number', required: true, example: '16', description: 'ID da oferta exibida.' },
      { name: 'customer_id', type: 'number', required: true, example: '16', description: 'ID do cliente.' },
      { name: 'visitor_id', type: 'string', required: true, example: 'architecto', description: 'ID público do visitante.' },
      { name: 'session_id', type: 'string', required: true, example: 'architecto', description: 'ID da sessão atual.' },
      { name: 'action', type: 'string', required: true, example: 'architecto', description: 'Ação executada (ex.: view, click, accept).' },
      { name: 'metadata', type: 'array', required: false, example: '[]', description: 'Dados adicionais do evento.' },
    ],
    responses: [
      {
        status: 201,
        title: 'Evento registrado com sucesso',
        fields: [{ name: 'message', type: 'string', example: 'Evento registrado com sucesso', description: 'Confirmação de registro.' }],
      },
    ],
  },
  {
    method: 'POST',
    title: 'Registrar múltiplos eventos em lote',
    path: '/api/v1/widget/track/batch',
    description: 'Envia vários eventos em uma única requisição para reduzir overhead.',
    bodyFields: [
      { name: 'events', type: 'array', required: true, example: '["architecto"]', description: 'Lista de eventos a serem registrados.' },
    ],
    responses: [
      {
        status: 201,
        title: 'Eventos registrados com sucesso',
        fields: [
          { name: 'message', type: 'string', example: 'Eventos registrados com sucesso', description: 'Confirmação de sucesso.' },
          { name: 'count', type: 'number', example: '3', description: 'Quantidade de eventos processados.' },
        ],
      },
    ],
  },
  {
    method: 'POST',
    title: 'Sincronizar contexto do visitante',
    path: '/api/v1/widget/visitor/sync',
    description: 'Atualiza dados de sessão, navegação, carrinho e aquisição do visitante.',
    bodyFields: [
      { name: 'fingerprint', type: 'uuid', required: true, example: '550e8400-e29b-41d4-a716-446655440000', description: 'Identificador único do visitante.' },
      { name: 'session_id', type: 'uuid', required: true, example: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', description: 'Identificador da sessão atual.' },
      { name: 'cart_value', type: 'number', required: false, example: '299.9', description: 'Valor do carrinho.' },
      { name: 'cart_items', type: 'array<number>', required: false, example: '[123, 456]', description: 'IDs dos produtos no carrinho.' },
      { name: 'current_page', type: 'string', required: false, example: '/produto/camiseta-azul', description: 'Página atual visitada.' },
      { name: 'product_id', type: 'number', required: false, example: '123', description: 'Produto em foco.' },
      { name: 'category_id', type: 'number', required: false, example: '5', description: 'Categoria em foco.' },
      { name: 'utm_source', type: 'string', required: false, example: 'instagram', description: 'Origem de campanha.' },
      { name: 'utm_medium', type: 'string', required: false, example: 'social', description: 'Mídia de campanha.' },
      { name: 'utm_campaign', type: 'string', required: false, example: 'verao2026', description: 'Nome da campanha.' },
      { name: 'utm_term', type: 'string', required: false, example: 'm', description: 'Termo da campanha.' },
      { name: 'utm_content', type: 'string', required: false, example: 'i', description: 'Conteúdo da campanha.' },
      { name: 'referrer', type: 'string', required: false, example: 'https://google.com', description: 'URL de referência.' },
    ],
    responses: [
      {
        status: 200,
        title: 'Contexto sincronizado com sucesso',
        fields: [
          { name: 'visitor_id', type: 'string', example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID consolidado do visitante.' },
          { name: 'is_returning', type: 'boolean', example: 'true', description: 'Indica se visitante já retornou.' },
          { name: 'total_visits', type: 'number', example: '3', description: 'Total de visitas registradas.' },
          { name: 'page_views', type: 'number', example: '15', description: 'Total de páginas visualizadas.' },
          { name: 'geo.country', type: 'string', example: 'BR', description: 'País detectado.' },
          { name: 'geo.region', type: 'string', example: 'São Paulo', description: 'Região detectada.' },
          { name: 'geo.city', type: 'string', example: 'São Paulo', description: 'Cidade detectada.' },
        ],
      },
    ],
  },
  {
    method: 'GET',
    title: 'Obter dados do visitante',
    path: '/api/v1/widget/visitor',
    description: 'Recupera o perfil consolidado de um visitante via fingerprint.',
    queryFields: [
      { name: 'fingerprint', type: 'uuid', required: true, example: '550e8400-e29b-41d4-a716-446655440000', description: 'Identificador único do visitante.' },
    ],
    responses: [
      {
        status: 200,
        title: 'Dados do visitante retornados',
        fields: [
          { name: 'fingerprint', type: 'string', example: '550e8400-e29b-41d4-a716-446655440000', description: 'Fingerprint consultado.' },
          { name: 'is_returning', type: 'boolean', example: 'true', description: 'Visitante recorrente.' },
          { name: 'total_visits', type: 'number', example: '3', description: 'Total de visitas.' },
          { name: 'page_views', type: 'number', example: '15', description: 'Total de visualizações de página.' },
          { name: 'cart_value', type: 'number', example: '299.9', description: 'Valor de carrinho conhecido.' },
          { name: 'device_type', type: 'string', example: 'mobile', description: 'Tipo de dispositivo.' },
        ],
      },
      {
        status: 404,
        title: 'Visitante não encontrado',
        fields: [
          { name: 'message', type: 'string', example: 'Visitor not found', description: 'Mensagem de erro de busca.' },
        ],
      },
    ],
  },
]

const CopyUrlButton = ({ value }: { value: string }) => {
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
      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
    >
      <Copy className="h-3.5 w-3.5" />
      {copied ? 'URL copiada' : 'Copiar URL'}
    </button>
  )
}

const FieldsTable = ({ title, fields }: { title: string; fields: FieldDoc[] }) => (
  <div className="rounded-xl border border-slate-200">
    <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold text-slate-700">{title}</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-xs">
        <thead className="bg-white">
          <tr className="text-left text-slate-500">
            <th className="px-3 py-2 font-semibold">Campo</th>
            <th className="px-3 py-2 font-semibold">Tipo</th>
            <th className="px-3 py-2 font-semibold">Obrigatório</th>
            <th className="px-3 py-2 font-semibold">Exemplo</th>
            <th className="px-3 py-2 font-semibold">Descrição</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {fields.map((field) => (
            <tr key={`${title}-${field.name}`}>
              <td className="px-3 py-2 font-medium text-slate-800">{field.name}</td>
              <td className="px-3 py-2 text-slate-600">{field.type}</td>
              <td className="px-3 py-2 text-slate-600">{field.required ? 'Sim' : 'Não'}</td>
              <td className="px-3 py-2 text-slate-600">{field.example}</td>
              <td className="px-3 py-2 text-slate-600">{field.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const Responses = ({ items }: { items: ResponseDoc[] }) => (
  <div className="space-y-3">
    {items.map((response) => (
      <div key={`${response.status}-${response.title}`} className="rounded-xl border border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded-md border px-2 py-1 text-xs font-semibold ${
              response.status < 300
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {response.status}
          </span>
          <p className="text-xs font-semibold text-slate-800">{response.title}</p>
        </div>
        <FieldsTable title="Campos da resposta" fields={response.fields} />
      </div>
    ))}
  </div>
)

const WidgetModuleDocs = () => {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Widget</h2>
        <p className="mt-1 text-xs text-slate-500">
          Endpoints públicos do módulo Widget. Em todas as chamadas, envie os headers
          <span className="mx-1 rounded bg-slate-100 px-1 py-0.5 font-medium text-slate-700">Authorization: Bearer {'{TENANT_API_KEY}'}</span>
          e
          <span className="mx-1 rounded bg-slate-100 px-1 py-0.5 font-medium text-slate-700">Accept: application/json</span>.
        </p>
      </div>

      {ENDPOINTS.map((endpoint) => {
        const methodColor = endpoint.method === 'GET'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-blue-200 bg-blue-50 text-blue-700'
        const fullPath = `{{baseUrl}}${endpoint.path}`

        return (
          <section key={`${endpoint.method}-${endpoint.path}`} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${methodColor}`}>
                {endpoint.method}
              </span>
              <h3 className="text-sm font-semibold text-slate-900">{endpoint.title}</h3>
            </div>

            <p className="text-xs text-slate-500">{endpoint.description}</p>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Endpoint</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-800">{fullPath}</p>
              <div className="mt-2">
                <CopyUrlButton value={fullPath} />
              </div>
            </div>

            {endpoint.queryFields && endpoint.queryFields.length > 0 && (
              <FieldsTable title="Parâmetros de query" fields={endpoint.queryFields} />
            )}

            {endpoint.bodyFields && endpoint.bodyFields.length > 0 && (
              <FieldsTable title="Campos do body" fields={endpoint.bodyFields} />
            )}

            <Responses items={endpoint.responses} />
          </section>
        )
      })}
    </div>
  )
}

export default WidgetModuleDocs
