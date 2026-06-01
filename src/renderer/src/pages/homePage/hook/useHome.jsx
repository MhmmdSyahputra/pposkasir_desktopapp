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
          const mapped = prodRes.data.map((p) => ({
            ...p,
            images: (() => {
              try {
                return JSON.parse(p.images || '[]')
              } catch {
                return []
              }
            })()
          }))
          
          const sorted = mapped.sort((a, b) => {
            const aStok = Number(a.stok || 0)
            const bStok = Number(b.stok || 0)
            if (aStok <= 0 && bStok > 0) return 1
            if (bStok <= 0 && aStok > 0) return -1
            return 0
          })

          setProducts(sorted)
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
