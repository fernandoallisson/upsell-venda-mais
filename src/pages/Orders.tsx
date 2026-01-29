import { Calendar, FileJson, ListChecks, PackageSearch, Server } from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'

const Orders = () => (
  <DashboardPage
    title="Pedidos"
    subtitle="Operações"
    containerClassName="max-w-6xl"
  >
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Visão geral</h2>
        <p className="text-sm text-slate-500">
          Estrutura inicial para integrar a API de pedidos. Use estes endpoints e
          exemplos como referência para o consumo de dados.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Server className="h-4 w-4 text-indigo-500" />
            GET /api/v1/orders
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Lista pedidos com paginação e dados relacionados do cliente.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <PackageSearch className="h-4 w-4 text-indigo-500" />
            GET /api/v1/orders/:id
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Detalha um pedido específico com itens e UTM.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ListChecks className="h-4 w-4 text-indigo-500" />
            POST /api/v1/orders
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Criação de pedido com itens e dados de atribuição.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calendar className="h-4 w-4 text-indigo-500" />
            placed_at
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Data de criação do pedido e referência para filtros.
          </p>
        </div>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <FileJson className="h-4 w-4 text-indigo-500" />
        Exemplo de resposta (GET /api/v1/orders)
      </div>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-4 text-xs text-slate-100">
{`{
  "current_page": 1,
  "data": [
    {
      "id": 288,
      "tenant_id": "tenant1",
      "customer_id": 101,
      "external_id": "ORD-tenant1-00000001",
      "total_amount": "4898.80",
      "subtotal_amount": "4898.80",
      "currency": "BRL",
      "status": "processing",
      "placed_at": "2026-01-15T21:26:22.000000Z",
      "customer": {
        "id": 101,
        "email": "camila.santos0@example.com",
        "first_name": "Camila",
        "last_name": "Santos"
      },
      "items": [
        {
          "id": 1002,
          "product_name": "Notebook Ultra 15\\\"",
          "quantity": 1,
          "total": "4599.00"
        }
      ],
      "utm": {
        "source": "facebook",
        "campaign": "newsletter_jan"
      }
    }
  ]
}`}
      </pre>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <FileJson className="h-4 w-4 text-indigo-500" />
        Exemplo de body (POST /api/v1/orders)
      </div>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-4 text-xs text-slate-100">
{`{
  "customer_id": 16,
  "placed_at": "2026-01-15T21:26:22.000000Z",
  "status": "processing",
  "total_amount": 4326.41688,
  "subtotal_amount": 4326.41688,
  "items": ["architecto"],
  "utm": ["architecto"]
}`}
      </pre>
    </section>
  </DashboardPage>
)

export default Orders
