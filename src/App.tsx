import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { usePermissions } from './contexts/PermissionsContext'
import Categories from './pages/Categories'
import Clients from './pages/Clients'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Products from './pages/Products'
import Segmentation from './pages/Segmentation'
import CreateCampaign from './pages/CreateCampaign'
import EditCampaign from './pages/EditCampaign'
import UpsellCampaigns from './pages/UpsellCampaigns'
import UpsellOffers from './pages/UpsellOffers'
import Users from './pages/Users'
import ApiKeys from './pages/ApiKeys'
import CreateApiKey from './pages/CreateApiKey'
import ViewApiKey from './pages/ViewApiKey'
import EditApiKey from './pages/EditApiKey'
import Widget from './pages/Widget'
import NoAccess from './pages/NoAccess'
import ProtectedRoute from './routes/ProtectedRoute'

const MODULE_DEFAULT_ROUTES: Array<{ category: string; path: string }> = [
  { category: 'analytics', path: '/dashboard' },
  { category: 'categories', path: '/catalogo/categorias' },
  { category: 'products', path: '/catalogo/produtos' },
  { category: 'customers', path: '/clientes' },
  { category: 'orders', path: '/pedidos' },
  { category: 'segments', path: '/segmentacao' },
  { category: 'upsell', path: '/upsell/campanhas' },
  { category: 'offers', path: '/upsell/ofertas' },
  { category: 'users', path: '/usuarios' },
  { category: 'settings', path: '/widget' },
]

function App() {
  const { isAuthenticated } = useAuth()
  const { hasModuleAccess, isLoading, hasLoaded, error } = usePermissions()

  const defaultAuthenticatedPath =
    MODULE_DEFAULT_ROUTES.find((module) => hasModuleAccess(module.category))
      ?.path ?? '/sem-acesso'

  const shouldHoldRedirect = isAuthenticated && (!hasLoaded || isLoading)

  if (shouldHoldRedirect) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">
          Carregando aplicação...
        </div>
      </div>
    )
  }

  if (isAuthenticated && error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-white px-6 py-4 text-sm text-red-600">
          Erro ao carregar permissões: {error}
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? defaultAuthenticatedPath : '/login'}
            replace
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredModule="analytics">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sem-acesso"
        element={
          <ProtectedRoute>
            <NoAccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="/catalogo/categorias"
        element={
          <ProtectedRoute requiredModule="categories">
            <Categories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/catalogo/produtos"
        element={
          <ProtectedRoute requiredModule="products">
            <Products />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <ProtectedRoute requiredModule="customers">
            <Clients />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pedidos"
        element={
          <ProtectedRoute requiredModule="orders">
            <Orders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/segmentacao"
        element={
          <ProtectedRoute requiredModule="segments">
            <Segmentation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upsell/campanhas"
        element={
          <ProtectedRoute requiredModule="upsell">
            <UpsellCampaigns />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upsell/campanhas/nova"
        element={
          <ProtectedRoute requiredModule="upsell">
            <CreateCampaign />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upsell/campanhas/:id/editar"
        element={
          <ProtectedRoute requiredModule="upsell">
            <EditCampaign />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upsell/ofertas"
        element={
          <ProtectedRoute requiredModule="offers">
            <UpsellOffers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <ProtectedRoute requiredModule="users">
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tokens"
        element={
          <ProtectedRoute requiredModule="settings">
            <ApiKeys />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tokens/nova"
        element={
          <ProtectedRoute requiredModule="settings">
            <CreateApiKey />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tokens/:id"
        element={
          <ProtectedRoute requiredModule="settings">
            <ViewApiKey />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tokens/:id/editar"
        element={
          <ProtectedRoute requiredModule="settings">
            <EditApiKey />
          </ProtectedRoute>
        }
      />

      <Route
        path="/widget"
        element={
          <ProtectedRoute requiredModule="settings">
            <Widget />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? defaultAuthenticatedPath : '/login'}
            replace
          />
        }
      />
    </Routes>
  )
}

export default App