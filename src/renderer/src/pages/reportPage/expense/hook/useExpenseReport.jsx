import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { expenseService } from '../../../../services/expenseService'

const todayStr = () => new Date().toISOString().slice(0, 10)

const firstDayOfMonthStr = () => {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

export const useExpenseReport = () => {
  const [filters, setFilters] = useState({
    startDate: firstDayOfMonthStr(),
    endDate: todayStr(),
    kategori: 'all',
    search: ''
  })

  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [byCategory, setByCategory] = useState([])
  const [daily, setDaily] = useState([])
  const [rows, setRows] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const debounceRef = useRef(null)

  const LIMIT = 50

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const res = await expenseService.getReport({
        ...filters,
        limit: LIMIT,
        offset: page * LIMIT
      })

      if (!res.ok) {
        setError(res.error || 'Gagal memuat data laporan pengeluaran')
        return
      }

      const data = res.data || {}
      setSummary(data.summary || null)
      setByCategory(data.byCategory || [])
      setDaily(data.daily || [])
      setRows(data.rows || [])
      setTotalRows(data.totalRows || 0)
    } catch (e) {
      setError(e.message || 'Gagal memuat data laporan pengeluaran')
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(0)
      loadData()
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [filters.startDate, filters.endDate, filters.kategori, filters.search]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalRows / LIMIT)), [totalRows])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      startDate: firstDayOfMonthStr(),
      endDate: todayStr(),
      kategori: 'all',
      search: ''
    })
    setPage(0)
  }

  const getAllRowsForExport = async () => {
    const res = await expenseService.getReport({
      ...filters,
      limit: 100000,
      offset: 0
    })

    if (!res.ok) {
      throw new Error(res.error || 'Gagal mempersiapkan ekspor')
    }

    return {
      summary: res.data?.summary || summary,
      byCategory: res.data?.byCategory || byCategory,
      daily: res.data?.daily || daily,
      rows: res.data?.rows || []
    }
  }

  return {
    filters,
    updateFilter,
    resetFilters,
    page,
    setPage,
    totalPages,
    LIMIT,
    loading,
    error,
    summary,
    byCategory,
    daily,
    rows,
    totalRows,
    reload: loadData,
    getAllRowsForExport
  }
}
