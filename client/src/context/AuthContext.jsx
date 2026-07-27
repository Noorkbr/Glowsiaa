import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

const extractAuthPayload = (data) => ({
  token: data?.token ?? data?.accessToken ?? data?.data?.token ?? null,
  user: data?.user ?? data?.data?.user ?? data?.customer ?? null
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token')

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        setToken(storedToken)
        const { data } = await api.get('/auth/me')
        setUser(data?.user ?? data?.data?.user ?? data ?? null)
      } catch (error) {
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    validateToken()
  }, [logout])

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const authPayload = extractAuthPayload(data)
      if (!authPayload.token) {
        throw new Error('No token received from server.')
      }
      localStorage.setItem('token', authPayload.token)
      setToken(authPayload.token)
      setUser(authPayload.user)
      return authPayload.user
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (name, email, password, phone) => {
    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone })
      const authPayload = extractAuthPayload(data)
      if (!authPayload.token) {
        throw new Error('No token received from server.')
      }
      localStorage.setItem('token', authPayload.token)
      setToken(authPayload.token)
      setUser(authPayload.user)
      return authPayload.user
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    login,
    register,
    logout
  }), [isLoading, login, logout, register, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
