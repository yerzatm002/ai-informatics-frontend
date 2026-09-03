import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loading from './Loading'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loading text="Сессия тексерілуде..." />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />
  if (!adminOnly && user.role === 'ADMIN') return <Navigate to="/admin" replace />

  return children
}
