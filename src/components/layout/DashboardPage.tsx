import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { logout } from '../../lib/services/auth/auth.service'
import { getUser } from '../../lib/services/users/users.service'
import type { User } from '../../lib/services/users/users.types'
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
  const { signOut } = useAuth()
  const [user, setUser] = useState<User | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      const data = await getUser()
      setUser(data)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

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
      onRefresh={fetchUser}
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
