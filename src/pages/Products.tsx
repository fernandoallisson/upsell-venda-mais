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
      description="Em breve você verá os itens disponíveis e poderá gerenciar preços, estoque e imagens."
    />
  </DashboardPage>
)

export default Products
