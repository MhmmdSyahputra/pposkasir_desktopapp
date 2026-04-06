import { useState, useEffect, useCallback } from 'react'

/**
 * Hook untuk mendapatkan list peers di LAN yang sedang buka app yang sama.
 *
 * @returns {{
 *   peers: Array<{ username: string, hostname: string, ip: string, platform: string, lastSeen: number }>,
 *   myInfo: { username: string, hostname: string, ip: string, platform: string } | null,
 *   isLoading: boolean,
 *   refresh: () => void
 * }}
 */
export function useDiscovery() {
  const [peers, setPeers] = useState([])
  const [myInfo, setMyInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const [currentPeers, info] = await Promise.all([
        window.api.discovery.getPeers(),
        window.api.discovery.getMyInfo()
      ])
      setPeers(currentPeers)
      setMyInfo(info)
    } catch (err) {
      console.error('[useDiscovery] refresh error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Ambil data awal
    refresh()

    // Listen update realtime dari main process
    const cleanup = window.api.discovery.onPeersUpdated((updatedPeers) => {
      setPeers(updatedPeers)
    })

    return cleanup
  }, [refresh])

  return { peers, myInfo, isLoading, refresh }
}
