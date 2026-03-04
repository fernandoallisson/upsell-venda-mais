import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { ApiError } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { logout } from '../lib/services/auth/auth.service'
import { getUser, updateAuthenticatedUser } from '../lib/services/users/users.service'
import type { UpdateUserPayload, User } from '../lib/services/users/users.types'
import DashboardLayout from '../components/layout/DashboardLayout'

type Feedback = {
  type: 'success' | 'error'
  message: string
}

const Profile = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const loadUser = useCallback(async () => {
    setIsLoading(true)
    setFeedback(null)
    try {
      const data = await getUser()
      setUser(data)
      setName(data.name)
      setEmail(data.email)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Não foi possível carregar seus dados.'
      setFeedback({ type: 'error', message })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      signOut()
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)

    if (!name.trim() || !email.trim()) {
      setFeedback({ type: 'error', message: 'Preencha nome e e-mail.' })
      return
    }

    if (passwordConfirmation && !password) {
      setFeedback({ type: 'error', message: 'Informe a nova senha primeiro.' })
      return
    }

    if (password && password !== passwordConfirmation) {
      setFeedback({
        type: 'error',
        message: 'A confirmação da senha precisa ser igual à nova senha.',
      })
      return
    }

    const payload: UpdateUserPayload = {
      name: name.trim(),
      email: email.trim(),
    }

    if (password) {
      payload.password = password
      payload.password_confirmation = passwordConfirmation
    }

    setIsSaving(true)

    try {
      const updated = await updateAuthenticatedUser(payload)
      setUser(updated)
      setName(updated.name)
      setEmail(updated.email)
      setPassword('')
      setPasswordConfirmation('')
      setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso.' })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Não foi possível atualizar seu perfil.'
      setFeedback({ type: 'error', message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout
      user={user}
      onRefresh={loadUser}
      onLogout={handleLogout}
      title="Perfil"
      subtitle="Gerencie seus dados cadastrais"
      containerClassName="max-w-5xl"
    >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading || isSaving}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o dashboard
          </button>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Informações pessoais
            </h2>
            <p className="text-sm text-slate-500">
              Atualize seu nome, e-mail e senha sempre que necessário.
            </p>
          </div>

          {feedback ? (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Nome completo
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  disabled={isLoading || isSaving}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                E-mail
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@dominio.com"
                  type="email"
                  disabled={isLoading || isSaving}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Nova senha
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite a nova senha"
                  type="password"
                  disabled={isLoading || isSaving}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Confirmar nova senha
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  placeholder="Confirme a nova senha"
                  type="password"
                  disabled={isLoading || isSaving}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                disabled={isLoading || isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </button>

              <span className="text-xs text-slate-400">
                Última atualização:{' '}
                {user?.updated_at
                  ? new Date(user.updated_at).toLocaleString('pt-BR')
                  : '--'}
              </span>
            </div>
          </form>
        </section>
    </DashboardLayout>
  )
}

export default Profile
