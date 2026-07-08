import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

/**
 * Protège une page privée.
 * Usage : useAuth('/login-producteur') ou useAuth('/login-admin', 'admin')
 */
export function useAuth(loginPath = '/login-admin', requiredRole = null) {
  const { isAuthenticated, user, loading } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      navigate(loginPath, { replace: true })
      return
    }

    if (requiredRole && user?.role !== requiredRole) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, loading, navigate, loginPath, requiredRole])

  return { user, isAuthenticated, loading }
}
