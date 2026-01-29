import DashboardPage from '../components/layout/DashboardPage'
import PagePlaceholder from '../components/layout/PagePlaceholder'

const UpsellOffers = () => (
  <DashboardPage
    title="Ofertas"
    subtitle="Upsell"
    containerClassName="max-w-5xl"
  >
    <PagePlaceholder
      title="Ofertas de upsell"
      description="Gerencie os bundles, descontos e condições das ofertas."
    />
  </DashboardPage>
)

export default UpsellOffers
