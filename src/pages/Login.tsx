import { FormEvent, useState } from 'react'
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
    <main className="page">
      <section className="card">
        <header className="card__header">
          <h1 className="text-center">Venda Mais</h1>
          <p>Aumente seu faturamento e acompanhe em tempo real</p>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <label className="form__field">
            <span>E-mail</span>
            <input
              type="email"
              name="email"
              placeholder="user@tenant.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </label>

          <label className="form__field">
            <span>Senha</span>
            <input
              type="password"
              name="password"
              placeholder="secret123"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="form__error">{error}</p> : null}

          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Login
