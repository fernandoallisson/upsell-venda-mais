import DashboardPage from '../components/layout/DashboardPage'
import PagePlaceholder from '../components/layout/PagePlaceholder'

const Products = () => (
  <DashboardPage
    title="Produtos"
    subtitle="Catálogo"
    containerClassName="max-w-5xl"
  >
    <PagePlaceholder
      title="Produtos do catálogo"
      description="Aqui você acompanha os itens disponíveis no catálogo em modo somente leitura."
    />
  </DashboardPage>
)

export default Products
