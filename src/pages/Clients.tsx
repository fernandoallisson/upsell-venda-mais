import DashboardPage from '../components/layout/DashboardPage'
import PagePlaceholder from '../components/layout/PagePlaceholder'

const Clients = () => (
  <DashboardPage
    title="Clientes"
    subtitle="CRM"
    containerClassName="max-w-5xl"
  >
    <PagePlaceholder
      title="Base de clientes"
      description="Visualize perfis, contatos e histórico de compras por aqui."
    />
  </DashboardPage>
)

export default Clients
