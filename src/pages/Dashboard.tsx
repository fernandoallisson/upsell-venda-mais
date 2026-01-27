import { LogOut, ShieldCheck } from 'lucide-react'
import { getAuthTokenCreatedAt } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { token, signOut } = useAuth()
  const createdAt = getAuthTokenCreatedAt()

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
        <header className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Área protegida
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Você está autenticado e pronto para continuar.
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Token ativo
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {token ? `${token.slice(0, 12)}...` : 'Não encontrado'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Criado em
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        <button
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sair
        </button>
      </section>
    </main>
  )
}

export default Dashboard
