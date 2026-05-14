// ─── Auth Context (Frontend) ──────────────────────────────────────────────────
// Global authentication state management using React Context.
// Stores: user object, JWT token, loading state.
// Persists to localStorage so user stays logged in on page refresh.
// user.role: 'patient' | 'doctor' | 'admin'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)     // Currently logged-in user object
  const [token, setToken] = useState(null)   // JWT token
  const [loading, setLoading] = useState(true) // true while checking localStorage

  // ── On mount: restore session from localStorage ──
  useEffect(() => {
    const storedToken = localStorage.getItem('smartmedi_token')
    const storedUser  = localStorage.getItem('smartmedi_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // ── Login: save user + token to state and localStorage ──
  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('smartmedi_token', jwtToken)
    localStorage.setItem('smartmedi_user', JSON.stringify(userData))
  }

  // ── Update user data (e.g. after profile photo change) ──
  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData }
    setUser(updated)
    localStorage.setItem('smartmedi_user', JSON.stringify(updated))
  }

  // ── Logout: clear all auth state ──
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('smartmedi_token')
    localStorage.removeItem('smartmedi_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Custom hook: must be used inside AuthProvider ──
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
