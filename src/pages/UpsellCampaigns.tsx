import DashboardPage from '../components/layout/DashboardPage'
import PagePlaceholder from '../components/layout/PagePlaceholder'

const UpsellCampaigns = () => (
  <DashboardPage
    title="Campanhas"
    subtitle="Upsell"
    containerClassName="max-w-5xl"
  >
    <PagePlaceholder
      title="Campanhas de upsell"
      description="Configure regras, metas e calendário das campanhas de upsell."
    />
  </DashboardPage>
)

export default UpsellCampaigns
