import { useState, useEffect, useCallback, useRef } from 'react'
import { productService } from '../../../../services/productService'
import { categoryService } from '../../../../services/categoryService'

export const useListProduct = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')
  const [categories, setCategories] = useState([])
  const debounceRef = useRef(null)

  // Load categories once for the filter dropdown
  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (res.ok) setCategories(res.data)
    })
  }, [])

  const fetchData = useCallback(async (q, kat) => {
    setLoading(true)
    const res = await productService.getAll({ search: q, kategori: kat })
    if (res.ok) setRows(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchData(search, kategori), 300)
    return () => clearTimeout(debounceRef.current)
  }, [search, kategori, fetchData])

  const deleteProduct = useCallback(async (id) => {
    const res = await productService.delete(id)
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id))
    return res
  }, [])

  return { rows, loading, search, setSearch, kategori, setKategori, categories, deleteProduct }
}
