import { useState, useEffect, useCallback, useRef } from 'react'
import { transactionService } from '../../../../services/transactionService'

export const useListTransaction = () => {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ jumlah: 0, omzet: 0, total_diskon: 0 })
  const [search, setSearch] = useState('')
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))
  const [page, setPage] = useState(0)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const debounceRef = useRef(null)

  const LIMIT = 50

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [listRes, statsRes] = await Promise.all([
        transactionService.getAll({
          search: search.trim(),
          tanggal,
          limit: LIMIT,
          offset: page * LIMIT
        }),
        transactionService.getStats({ tanggal })
      ])
      if (listRes.ok) {
        setRows(listRes.data.rows)
        setTotal(listRes.data.total)
      }
      if (statsRes.ok) {
        setStats(statsRes.data)
      }
    } catch (e) {
      console.error('Load transactions error:', e)
    } finally {
      setLoading(false)
    }
  }, [search, tanggal, page])

  // debounce search changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(0)
      loadData()
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search, tanggal]) // eslint-disable-line react-hooks/exhaustive-deps

  // page change triggers immediate load
  useEffect(() => {
    loadData()
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const openDetail = async (id) => {
    setDetailLoading(true)
    try {
      const res = await transactionService.getById(id)
      if (res.ok) setDetail(res.data)
    } catch (e) {
      console.error('Load detail error:', e)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => setDetail(null)

  const handleVoid = async (id) => {
    try {
      const res = await transactionService.void(id)
      if (res.ok) {
        setDetail(null)
        loadData()
      }
    } catch (e) {
      console.error('Void error:', e)
    }
  }

  return {
    rows,
    total,
    loading,
    stats,
    search,
    setSearch,
    tanggal,
    setTanggal,
    page,
    setPage,
    LIMIT,
    detail,
    detailLoading,
    openDetail,
    closeDetail,
    handleVoid,
    reload: loadData
  }
}
