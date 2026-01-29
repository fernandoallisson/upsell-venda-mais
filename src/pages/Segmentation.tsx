import DashboardPage from '../components/layout/DashboardPage'
import PagePlaceholder from '../components/layout/PagePlaceholder'

const Segmentation = () => (
  <DashboardPage
    title="Segmentação"
    subtitle="Clientes"
    containerClassName="max-w-5xl"
  >
    <PagePlaceholder
      title="Segmentos de audiência"
      description="Crie grupos de clientes e personalize estratégias de comunicação."
    />
  </DashboardPage>
)

export default Segmentation
