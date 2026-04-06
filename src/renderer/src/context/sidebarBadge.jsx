/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'

const BadgeValuesCtx = createContext({ messenger: 0 })
const BadgeSetterCtx = createContext(null)

// eslint-disable-next-line react/prop-types
export const SidebarBadgeProvider = ({ children }) => {
  const [badges, setBadges] = useState({ messenger: 0 })

  useEffect(() => {
    const cleanup = window.api.chat.onMessageReceived(() => {
      setBadges((prev) => ({ ...prev, messenger: prev.messenger + 1 }))
    })
    return cleanup
  }, [])

  return (
    <BadgeValuesCtx.Provider value={badges}>
      <BadgeSetterCtx.Provider value={setBadges}>{children}</BadgeSetterCtx.Provider>
    </BadgeValuesCtx.Provider>
  )
}

export const useSidebarBadges = () => useContext(BadgeValuesCtx)
export const useSetSidebarBadge = () => useContext(BadgeSetterCtx)