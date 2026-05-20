import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { logout } from '../../lib/services/auth/auth.service'
import DashboardLayout from './DashboardLayout'

type DashboardPageProps = {
  title: string
  subtitle: string
  containerClassName?: string
  children: ReactNode
}

const DashboardPage = ({
  title,
  subtitle,
  containerClassName,
  children,
}: DashboardPageProps) => {
  const { signOut, user, refreshUser } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      signOut()
    }
  }

  return (
    <DashboardLayout
      user={user}
      onRefresh={() => void refreshUser({ force: true })}
      onLogout={handleLogout}
      title={title}
      subtitle={subtitle}
      containerClassName={containerClassName}
    >
      {children}
    </DashboardLayout>
  )
}

export default DashboardPage
