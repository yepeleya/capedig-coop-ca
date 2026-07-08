import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('capedig_token')
      const savedUser  = localStorage.getItem('capedig_user')
      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      }
    } catch {
      localStorage.removeItem('capedig_token')
      localStorage.removeItem('capedig_user')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (tokenValue, userValue) => {
    localStorage.setItem('capedig_token', tokenValue)
    localStorage.setItem('capedig_user', JSON.stringify(userValue))
    setToken(tokenValue)
    setUser(userValue)
  }

  const logout = () => {
    localStorage.removeItem('capedig_token')
    localStorage.removeItem('capedig_user')
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext doit être utilisé dans AuthProvider')
  return ctx
}
