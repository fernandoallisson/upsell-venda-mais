import { FormEvent, useState } from 'react'
import { Lock, Mail } from 'lucide-react'
import { ApiError } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const isValidEmail = (value: string) => {
  return /\S+@\S+\.\S+/.test(value)
}

const Login = () => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Preencha e-mail e senha.')
      return
    }

    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.')
      return
    }

    setIsLoading(true)

    try {
      await signIn(email, password)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Credenciais inválidas')
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Não foi possível conectar. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            Entrar no painel
          </h1>
          <p className="text-sm text-slate-500">
            Use seu e-mail e senha do tenant para continuar.
          </p>
        </header>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-600">
            <span className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
              <Mail className="h-4 w-4" aria-hidden="true" />
              E-mail
            </span>
            <input
              type="email"
              name="email"
              placeholder="user@tenant.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              autoComplete="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
            />
          </label>

          <label className="block text-sm font-medium text-slate-600">
            <span className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Senha
            </span>
            <input
              type="password"
              name="password"
              placeholder="secret123"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200/60 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Login
