import { getAuthTokenCreatedAt } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { token, signOut } = useAuth()
  const createdAt = getAuthTokenCreatedAt()

  return (
    <main className="page">
      <section className="card">
        <header className="card__header">
          <h1>Dashboard</h1>
          <p>Você está autenticado.</p>
        </header>

        <div className="card__content">
          <div className="info">
            <span className="info__label">Token ativo</span>
            <span className="info__value">
              {token ? `${token.slice(0, 12)}...` : 'Não encontrado'}
            </span>
          </div>
          <div className="info">
            <span className="info__label">Criado em</span>
            <span className="info__value">
              {createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>

        <button className="button button--ghost" onClick={signOut}>
          Sair
        </button>
      </section>
    </main>
  )
}

export default Dashboard
