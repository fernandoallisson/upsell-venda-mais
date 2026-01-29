import DashboardPage from '../components/layout/DashboardPage'
import PagePlaceholder from '../components/layout/PagePlaceholder'

const Categories = () => (
  <DashboardPage
    title="Categorias"
    subtitle="Catálogo"
    containerClassName="max-w-5xl"
  >
    <PagePlaceholder
      title="Categorias cadastradas"
      description="Aqui você poderá visualizar e organizar as categorias do catálogo."
    />
  </DashboardPage>
)

export default Categories
