import type { ReactNode } from 'react'
import type { User } from '../../lib/services/users/users.types'
import DashboardHeader from './DashboardHeader'
import DashboardSidebar from './DashboardSidebar'

type DashboardLayoutProps = {
  user: User | null
  onRefresh: () => void
  onLogout: () => void
  title?: string
  subtitle?: string
  containerClassName?: string
  children: ReactNode
}

const DashboardLayout = ({
  user,
  onRefresh,
  onLogout,
  title,
  subtitle,
  containerClassName,
  children,
}: DashboardLayoutProps) => {
  const containerClasses = `mx-auto flex w-full flex-1 flex-col gap-6 px-6 py-8 ${
    containerClassName ?? 'max-w-7xl'
  }`

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <DashboardHeader
            user={user}
            onRefresh={onRefresh}
            onLogout={onLogout}
            title={title}
            subtitle={subtitle}
          />
          <main className={containerClasses}>{children}</main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
