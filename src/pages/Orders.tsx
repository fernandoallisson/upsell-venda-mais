import DashboardPage from '../components/layout/DashboardPage'
import PagePlaceholder from '../components/layout/PagePlaceholder'

const Orders = () => (
  <DashboardPage
    title="Pedidos"
    subtitle="Operações"
    containerClassName="max-w-5xl"
  >
    <PagePlaceholder
      title="Pedidos recentes"
      description="Acompanhe o status, pagamentos e detalhes das vendas realizadas."
    />
  </DashboardPage>
)

export default Orders
