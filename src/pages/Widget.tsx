import DashboardPage from '../components/layout/DashboardPage'
import WidgetModuleDocs from '../features/api-keys/components/WidgetModuleDocs'

const Widget = () => {
  return (
    <DashboardPage
      title="Widget"
      subtitle="Documentação dos endpoints públicos do módulo Widget"
    >
      <WidgetModuleDocs />
    </DashboardPage>
  )
}

export default Widget
