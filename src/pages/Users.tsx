import DashboardPage from '../components/layout/DashboardPage'
import PagePlaceholder from '../components/layout/PagePlaceholder'

const Users = () => (
  <DashboardPage
    title="Usuários"
    subtitle="Administração"
    containerClassName="max-w-5xl"
  >
    <PagePlaceholder
      title="Gestão de usuários"
      description="Adicione perfis, permissões e times que acessam a plataforma."
    />
  </DashboardPage>
)

export default Users
