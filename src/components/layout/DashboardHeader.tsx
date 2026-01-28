import { useMemo, useState } from 'react'
import { ChevronDown, LogOut, RefreshCcw, Settings, UserCircle } from 'lucide-react'
import type { User } from '../../lib/services/users/users.types'

type DashboardHeaderProps = {
  user: User | null
  onRefresh: () => void
  onLogout: () => void
}

const DashboardHeader = ({ user, onRefresh, onLogout }: DashboardHeaderProps) => {
  const [open, setOpen] = useState(false)

  const initials = useMemo(() => {
    if (!user?.name) return 'U'
    const parts = user.name.split(' ').filter(Boolean)
    const first = parts[0]?.[0] ?? ''
    const last = parts[parts.length - 1]?.[0] ?? ''
    return `${first}${last}`.toUpperCase() || 'U'
  }, [user])

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Venda Mais</p>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                {user ? initials : <UserCircle className="h-5 w-5" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">
                  {user?.name ?? 'Usuário autenticado'}
                </p>
                <p className="text-xs text-slate-500">{user?.email ?? '---'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {open ? (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                  // TODO: ajustar para rota de perfil quando existir no projeto
                >
                  <UserCircle className="h-4 w-4" />
                  Perfil
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                  // TODO: ajustar para rota de segurança quando existir no projeto
                >
                  <Settings className="h-4 w-4" />
                  Segurança
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
