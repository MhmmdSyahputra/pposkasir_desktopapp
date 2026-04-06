import { useState, useEffect, useMemo } from 'react'
import { productService } from '../../../services/productService'
import { modifierService } from '../../../services/modifierService'

export const useHome = () => {
  const [products, setProducts] = useState([])
  const [modifierMap, setModifierMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [prodRes, modRes] = await Promise.all([
          productService.getAll({ aktif: 1 }),
          modifierService.getAllProductGroups()
        ])
        if (prodRes.ok) {
          setProducts(
            prodRes.data.map((p) => ({
              ...p,
              images: (() => {
                try {
                  return JSON.parse(p.images || '[]')
                } catch {
                  return []
                }
              })()
            }))
          )
        }
        if (modRes.ok) setModifierMap(modRes.data)
      } catch (e) {
        console.error('useHome load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.kategori).filter(Boolean))]
    return ['Semua', ...cats.sort()]
  }, [products])

  return { products, modifierMap, categories, loading }
}
