/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { authService } from '../services/authService'

const SESSION_KEY = 'ppos-auth-session'

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed?.id || !parsed?.username || !parsed?.role) return null

    return parsed
  } catch {
    return null
  }
}

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isSuper: false,
  activeSession: null,
  refreshActiveSession: async () => null,
  loginSuper: async () => {},
  loginCashier: async () => {},
  logout: () => {},
  createCashier: async () => {},
  listCashiers: async () => [],
  openCashierSession: async () => {},
  closeCashierSession: async () => {},
  listCashierSessions: async () => []
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredSession())
  const [activeSession, setActiveSession] = useState(null)

  const persistUser = useCallback((nextUser) => {
    if (!nextUser) {
      localStorage.removeItem(SESSION_KEY)
      setUser(null)
      return
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const loginSuper = useCallback(
    async ({ username, password }) => {
      const res = await authService.loginSuper({ username, password })
      if (!res?.ok) throw new Error(res?.error || 'Gagal login super admin')
      setActiveSession(null)
      persistUser(res.data)
      return res.data
    },
    [persistUser]
  )

  const loginCashier = useCallback(
    async ({ username, pin }) => {
      const res = await authService.loginCashier({ username, pin })
      if (!res?.ok) throw new Error(res?.error || 'Gagal login kasir')

      const activeRes = await authService.getActiveCashierSession({ username: res.data.username })
      setActiveSession(activeRes?.ok ? activeRes.data || null : null)
      persistUser(res.data)
      return res.data
    },
    [persistUser]
  )

  const logout = useCallback(() => {
    setActiveSession(null)
    persistUser(null)
  }, [persistUser])

  const refreshActiveSession = useCallback(async () => {
    if (!user?.username) {
      return null
    }

    const res = await authService.getActiveCashierSession({ username: user.username })
    if (!res?.ok) throw new Error(res?.error || 'Gagal memuat status shift kasir')
    setActiveSession(res.data || null)
    return res.data || null
  }, [user])

  const createCashier = useCallback(
    async ({ email, username, pin }) => {
      const res = await authService.cashierCreate({
        email,
        username,
        pin,
        createdBy: user?.username || ''
      })

      if (!res?.ok) throw new Error(res?.error || 'Gagal membuat akun kasir')
      return res.data
    },
    [user?.username]
  )

  const listCashiers = useCallback(async () => {
    const res = await authService.cashierGetAll()
    if (!res?.ok) throw new Error(res?.error || 'Gagal memuat akun kasir')
    return res.data || []
  }, [])

  const openCashierSession = useCallback(
    async ({ openingCash = 0, note = '' }) => {
      if (!user?.username) throw new Error('User login tidak valid')

      const res = await authService.openCashierSession({
        username: user.username,
        openingCash,
        note,
        openedBy: user.username
      })
      if (!res?.ok) throw new Error(res?.error || 'Gagal membuka kasir')
      setActiveSession(res.data || null)
      return res.data
    },
    [user]
  )

  const closeCashierSession = useCallback(
    async ({ closingCash = 0, note = '' }) => {
      if (!activeSession?.id) throw new Error('Tidak ada sesi kasir aktif')

      const res = await authService.closeCashierSession({
        sessionId: activeSession.id,
        closingCash,
        note
      })
      if (!res?.ok) throw new Error(res?.error || 'Gagal menutup kasir')
      setActiveSession(null)
      return res.data
    },
    [activeSession]
  )

  const listCashierSessions = useCallback(
    async ({ limit = 20 } = {}) => {
      if (!user?.username) return []
      const res = await authService.getCashierSessionHistory({ username: user.username, limit })
      if (!res?.ok) throw new Error(res?.error || 'Gagal memuat riwayat kasir')
      return res.data || []
    },
    [user]
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.id),
      isSuper: user?.role === 'super',
      activeSession,
      refreshActiveSession,
      loginSuper,
      loginCashier,
      logout,
      createCashier,
      listCashiers,
      openCashierSession,
      closeCashierSession,
      listCashierSessions
    }),
    [
      activeSession,
      closeCashierSession,
      createCashier,
      listCashierSessions,
      listCashiers,
      loginCashier,
      loginSuper,
      logout,
      openCashierSession,
      refreshActiveSession,
      user
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
