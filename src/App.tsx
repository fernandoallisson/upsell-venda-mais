import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
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
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
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
        path="/catalogo/categorias"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/catalogo/produtos"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedidos"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/segmentacao"
        element={
          <ProtectedRoute>
            <Segmentation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upsell/campanhas"
        element={
          <ProtectedRoute>
            <UpsellCampaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upsell/campanhas/nova"
        element={
          <ProtectedRoute>
            <CreateCampaign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upsell/campanhas/:id/editar"
        element={
          <ProtectedRoute>
            <EditCampaign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upsell/ofertas"
        element={
          <ProtectedRoute>
            <UpsellOffers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? '/dashboard' : '/login'}
            replace
          />
        }
      />
    </Routes>
  )
}

export default App
