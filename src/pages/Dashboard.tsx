import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ApiError } from '../lib/api'
import { logout } from '../lib/services/auth/auth.service'
import { getUser, updateUser } from '../lib/services/users/users.service'
import type { UpdateUserPayload, User } from '../lib/services/users/users.types'
import { getAuthTokenCreatedAt } from '../lib/storage'

const Dashboard = () => {
  const { token, signOut } = useAuth()
  const createdAt = getAuthTokenCreatedAt()
  const [user, setUser] = useState<User | null>(null)
  const [userStatus, setUserStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [userError, setUserError] = useState<string | null>(null)
  const [formData, setFormData] = useState<UpdateUserPayload>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [updateMethod, setUpdateMethod] = useState<'PUT' | 'PATCH'>('PUT')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle',
  )
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [logoutStatus, setLogoutStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null)

  const tokenPreview = useMemo(() => {
    if (!token) return 'Não encontrado'
    if (token.length <= 20) return token
    return `${token.slice(0, 12)}...${token.slice(-6)}`
  }, [token])

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      setUserStatus('loading')
      setUserError(null)
      try {
        const data = await getUser()
        if (isMounted) {
          setUser(data)
          setFormData({
            name: data.name,
            email: data.email,
            password: '',
            password_confirmation: '',
          })
          setUserStatus('idle')
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof ApiError ? error.message : 'Erro ao carregar usuário'
          setUserError(message)
          setUserStatus('error')
        }
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  const handleFormChange = (field: keyof UpdateUserPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSaveStatus('idle')
    setSaveMessage(null)
  }

  const buildPayload = () => {
    const payload: UpdateUserPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
    }

    const password = formData.password?.trim() ?? ''
    const confirmation = formData.password_confirmation?.trim() ?? ''

    if (password || confirmation) {
      payload.password = password
      payload.password_confirmation = confirmation
    }

    return payload
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaveStatus('saving')
    setSaveMessage(null)

    const payload = buildPayload()
    if (!payload.name || !payload.email) {
      setSaveStatus('error')
      setSaveMessage('Nome e e-mail são obrigatórios.')
      return
    }

    if (payload.password || payload.password_confirmation) {
      if (!payload.password || !payload.password_confirmation) {
        setSaveStatus('error')
        setSaveMessage('Preencha a senha e a confirmação.')
        return
      }
      if (payload.password !== payload.password_confirmation) {
        setSaveStatus('error')
        setSaveMessage('A confirmação de senha não confere.')
        return
      }
    }

    try {
      const updated = await updateUser(updateMethod, payload)
      setUser(updated)
      setFormData({
        name: updated.name,
        email: updated.email,
        password: '',
        password_confirmation: '',
      })
      setSaveStatus('success')
      setSaveMessage('Dados atualizados com sucesso.')
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Erro ao atualizar usuário'
      setSaveStatus('error')
      setSaveMessage(message)
    }
  }

  const handleRefresh = async () => {
    setUserStatus('loading')
    setUserError(null)
    try {
      const data = await getUser()
      setUser(data)
      setFormData({
        name: data.name,
        email: data.email,
        password: '',
        password_confirmation: '',
      })
      setUserStatus('idle')
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Erro ao carregar usuário'
      setUserError(message)
      setUserStatus('error')
    }
  }

  const handleLogout = async () => {
    setLogoutStatus('loading')
    setLogoutMessage(null)
    try {
      await logout()
      setLogoutStatus('idle')
      signOut()
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Erro ao encerrar sessão'
      setLogoutStatus('error')
      setLogoutMessage(message)
    }
  }

  return (
    <main className="page page--dashboard">
      <section className="card card--wide">
        <header className="card__header">
          <h1>Dashboard do usuário</h1>
          <p>Atualize seus dados e gerencie o token ativo.</p>
        </header>

        <div className="card__content">
          <div className="info-grid">
            <div className="info">
              <span className="info__label">Token ativo</span>
              <span className="info__value">{tokenPreview}</span>
            </div>
            <div className="info">
              <span className="info__label">Criado em</span>
              <span className="info__value">
                {createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          <section className="section">
            <header className="section__header">
              <div>
                <h2>Dados do usuário</h2>
                <p>Consulta: GET /api/v1/user</p>
              </div>
              <button
                className="button button--ghost"
                type="button"
                onClick={handleRefresh}
                disabled={userStatus === 'loading'}
              >
                {userStatus === 'loading' ? 'Carregando...' : 'Recarregar'}
              </button>
            </header>

            {userStatus === 'error' && userError ? (
              <p className="form__error">{userError}</p>
            ) : (
              <div className="user-grid">
                <div>
                  <span className="info__label">Nome</span>
                  <span className="info__value">{user?.name ?? '---'}</span>
                </div>
                <div>
                  <span className="info__label">E-mail</span>
                  <span className="info__value">{user?.email ?? '---'}</span>
                </div>
                <div>
                  <span className="info__label">Tenant</span>
                  <span className="info__value">{user?.tenant_id ?? '---'}</span>
                </div>
                <div>
                  <span className="info__label">Criado em</span>
                  <span className="info__value">
                    {user?.created_at ? new Date(user.created_at).toLocaleString() : '---'}
                  </span>
                </div>
                <div>
                  <span className="info__label">Atualizado em</span>
                  <span className="info__value">
                    {user?.updated_at ? new Date(user.updated_at).toLocaleString() : '---'}
                  </span>
                </div>
              </div>
            )}
          </section>

          <section className="section">
            <header className="section__header">
              <div>
                <h2>Atualizar usuário</h2>
                <p>PUT /api/v1/user ou PATCH /api/v1/user</p>
              </div>
            </header>

            <form className="form" onSubmit={handleSubmit}>
              <div className="form__row">
                <label className="form__field">
                  Nome
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => handleFormChange('name', event.target.value)}
                    required
                  />
                </label>
                <label className="form__field">
                  E-mail
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => handleFormChange('email', event.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="form__row">
                <label className="form__field">
                  Senha
                  <input
                    type="password"
                    value={formData.password ?? ''}
                    onChange={(event) => handleFormChange('password', event.target.value)}
                    placeholder="Nova senha"
                  />
                </label>
                <label className="form__field">
                  Confirmação de senha
                  <input
                    type="password"
                    value={formData.password_confirmation ?? ''}
                    onChange={(event) =>
                      handleFormChange('password_confirmation', event.target.value)
                    }
                    placeholder="Repita a senha"
                  />
                </label>
              </div>

              <div className="form__options">
                <span className="info__label">Método</span>
                <label className="radio">
                  <input
                    type="radio"
                    name="updateMethod"
                    value="PUT"
                    checked={updateMethod === 'PUT'}
                    onChange={() => setUpdateMethod('PUT')}
                  />
                  PUT (substituir)
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="updateMethod"
                    value="PATCH"
                    checked={updateMethod === 'PATCH'}
                    onChange={() => setUpdateMethod('PATCH')}
                  />
                  PATCH (parcial)
                </label>
              </div>

              {saveStatus === 'error' && saveMessage ? (
                <p className="form__error">{saveMessage}</p>
              ) : null}
              {saveStatus === 'success' && saveMessage ? (
                <p className="form__success">{saveMessage}</p>
              ) : null}

              <button className="button" type="submit" disabled={saveStatus === 'saving'}>
                {saveStatus === 'saving' ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          </section>
        </div>

        <footer className="section footer">
          <div>
            <h2>Sessão</h2>
            <p>POST /api/v1/logout</p>
          </div>
          <div className="footer__actions">
            {logoutStatus === 'error' && logoutMessage ? (
              <span className="form__error">{logoutMessage}</span>
            ) : null}
            <button
              className="button button--ghost"
              onClick={handleLogout}
              disabled={logoutStatus === 'loading'}
            >
              {logoutStatus === 'loading' ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </footer>
      </section>
    </main>
  )
}

export default Dashboard
