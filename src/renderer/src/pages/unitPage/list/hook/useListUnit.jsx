import { useState, useEffect, useCallback, useRef } from 'react'
import { unitService } from '../../../../services/unitService'

export const useListUnit = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const debounceRef = useRef(null)

  const fetchData = useCallback(async (q) => {
    setLoading(true)
    const res = await unitService.getAll({ search: q })
    if (res.ok) setRows(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchData(search), 300)
    return () => clearTimeout(debounceRef.current)
  }, [search, fetchData])

  const deleteUnit = useCallback(async (id) => {
    const res = await unitService.delete(id)
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id))
    return res
  }, [])

  return { rows, loading, search, setSearch, deleteUnit }
}
