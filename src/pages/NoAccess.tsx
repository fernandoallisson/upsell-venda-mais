import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../contexts/PermissionsContext'
import { logout } from '../lib/services/auth/auth.service'

const NoAccess = () => {
  const { signOut } = useAuth()
  const { error, isLoading, refreshPermissions } = usePermissions()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      signOut()
    }
  }

  const handleRefresh = () => {
    void refreshPermissions()
  }

  return (
    <DashboardLayout
      user={null}
      onRefresh={handleRefresh}
      onLogout={handleLogout}
      title="Acesso aos módulos"
      subtitle="Permissões da conta"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
        <p className="font-semibold text-slate-900">
          Você não possui acesso aos módulos disponíveis.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Entre em contato com um administrador para solicitar permissões.
        </p>
        {isLoading ? (
          <p className="mt-4 text-sm text-slate-500">Carregando permissões...</p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </div>
    </DashboardLayout>
  )
}

export default NoAccess
