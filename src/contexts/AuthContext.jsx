import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api'
import { TOKEN_KEY } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setUser(null)
      setLoading(false)
      return null
    }

    try {
      const { data } = await authApi.me()
      setUser(data)
      return data
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      setLoading(false)
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    const current = await loadMe()
    return current
  }

  const register = async ({ name, email, password }) => {
    await authApi.register({ name, email, password })
    return login(email, password)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    refreshUser: loadMe,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
  }), [user, loading, loadMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
