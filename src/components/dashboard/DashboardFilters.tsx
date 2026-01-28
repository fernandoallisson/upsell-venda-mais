type DashboardFiltersProps = {
  search: string
  selectedCampaign: string
  selectedProduct: string
  campaigns: number[]
  products: number[]
  onlyTop: boolean
  onSearchChange: (value: string) => void
  onCampaignChange: (value: string) => void
  onProductChange: (value: string) => void
  onOnlyTopChange: (value: boolean) => void
}

const DashboardFilters = ({
  search,
  selectedCampaign,
  selectedProduct,
  campaigns,
  products,
  onlyTop,
  onSearchChange,
  onCampaignChange,
  onProductChange,
  onOnlyTopChange,
}: DashboardFiltersProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Buscar
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="ID, produto ou campanha"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Campanha
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={selectedCampaign}
            onChange={(event) => onCampaignChange(event.target.value)}
          >
            <option value="">Todas</option>
            {campaigns.map((campaign) => (
              <option key={campaign} value={campaign}>
                {campaign}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Produto
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={selectedProduct}
            onChange={(event) => onProductChange(event.target.value)}
          >
            <option value="">Todos</option>
            {products.map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 shadow-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          checked={onlyTop}
          onChange={(event) => onOnlyTopChange(event.target.checked)}
        />
        Somente melhores resultados
      </label>
    </div>
  </div>
)

export default DashboardFilters
