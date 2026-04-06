import { useState, useEffect, useCallback, useRef } from 'react'
import { categoryService } from '../../../../services/categoryService'

export const useListCategory = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const debounceRef = useRef(null)

  const fetchData = useCallback(async (q) => {
    setLoading(true)
    const res = await categoryService.getAll({ search: q })
    if (res.ok) setRows(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchData(search), 300)
    return () => clearTimeout(debounceRef.current)
  }, [search, fetchData])

  const deleteCategory = useCallback(async (id) => {
    const res = await categoryService.delete(id)
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id))
    return res
  }, [])

  return { rows, loading, search, setSearch, deleteCategory }
}
