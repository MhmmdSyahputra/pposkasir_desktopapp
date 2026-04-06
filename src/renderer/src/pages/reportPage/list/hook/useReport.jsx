import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { transactionService } from '../../../../services/transactionService'

const todayStr = () => new Date().toISOString().slice(0, 10)

const firstDayOfMonthStr = () => {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

export const useReport = () => {
  const [filters, setFilters] = useState({
    startDate: firstDayOfMonthStr(),
    endDate: todayStr(),
    status: 'all',
    metode: 'all',
    search: ''
  })

  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [byMethod, setByMethod] = useState([])
  const [daily, setDaily] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [rows, setRows] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const debounceRef = useRef(null)

  const LIMIT = 50

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const res = await transactionService.getReport({
        ...filters,
        limit: LIMIT,
        offset: page * LIMIT
      })

      if (!res.ok) {
        setError(res.error || 'Failed to load report data')
        return
      }

      const data = res.data || {}
      setSummary(data.summary || null)
      setByMethod(data.byMethod || [])
      setDaily(data.daily || [])
      setTopProducts(data.topProducts || [])
      setRows(data.rows || [])
      setTotalRows(data.totalRows || 0)
    } catch (e) {
      setError(e.message || 'Failed to load report data')
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
  }, [filters.startDate, filters.endDate, filters.status, filters.metode, filters.search]) // eslint-disable-line react-hooks/exhaustive-deps

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
      status: 'all',
      metode: 'all',
      search: ''
    })
    setPage(0)
  }

  const getAllRowsForExport = async () => {
    const res = await transactionService.getReport({
      ...filters,
      limit: 100000,
      offset: 0
    })

    if (!res.ok) {
      throw new Error(res.error || 'Failed to prepare export')
    }

    return {
      summary: res.data?.summary || summary,
      byMethod: res.data?.byMethod || byMethod,
      daily: res.data?.daily || daily,
      topProducts: res.data?.topProducts || topProducts,
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
    byMethod,
    daily,
    topProducts,
    rows,
    totalRows,
    reload: loadData,
    getAllRowsForExport
  }
}
