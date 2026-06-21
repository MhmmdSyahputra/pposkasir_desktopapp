import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService } from '../../../../services/productService'
import { categoryService } from '../../../../services/categoryService'
import { unitService } from '../../../../services/unitService'
import { imageService } from '../../../../services/imageService'
import { modifierService } from '../../../../services/modifierService'

const defaultForm = {
  kode: '',
  nama: '',
  kategori: '',
  satuan: '',
  harga_beli: '',
  harga_jual: '',
  stok: '',
  min_stok: '',
  barcode: '',
  deskripsi: '',
  aktif: true,
  is_bundle: false,
  bundle_items: []
}

export const useCreateProduct = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultForm)
  const [images, setImages] = useState([]) // [{ id, url, file, name }]
  const [categories, setCategories] = useState([])
  const [units, setUnits] = useState([])
  const [modifierGroups, setModifierGroups] = useState([]) // all available
  const [selectedModifierIds, setSelectedModifierIds] = useState([]) // chosen for this product
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [lastProducts, setLastProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])

  useEffect(() => {
    categoryService.getAll({ search: '' }).then((r) => {
      if (r.ok) setCategories(r.data)
    })
    unitService.getAll({ search: '' }).then((r) => {
      if (r.ok) setUnits(r.data)
    })
    modifierService.getAll().then((r) => {
      if (r.ok) setModifierGroups(r.data)
    })
    productService.getAll({ search: '' }).then((r) => {
      if (r.ok) {
        // filter out bundles to avoid nested bundles
        const singles = r.data.filter((p) => !p.is_bundle)
        setAllProducts(singles)
        const sorted = r.data.sort((a, b) => b.id - a.id).slice(0, 5)
        setLastProducts(sorted)
      }
    })
  }, [])

  const handleChange = (field) => (e) => {
    let val = e.target.value
    if (field === 'harga_beli' || field === 'harga_jual') {
      const digits = val.replace(/\D/g, '')
      val = digits ? Number(digits).toLocaleString('id-ID') : ''
    }
    setForm((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleToggleAktif = () => {
    setForm((prev) => ({ ...prev, aktif: !prev.aktif }))
  }

  const handleToggleBundle = () => {
    setForm((prev) => ({ ...prev, is_bundle: !prev.is_bundle }))
  }

  const addBundleItem = (product) => {
    setForm((prev) => {
      if (prev.bundle_items.find((i) => i.product_id === product.id)) return prev
      return {
        ...prev,
        bundle_items: [
          ...prev.bundle_items,
          { product_id: product.id, product_nama: product.nama, qty: 1 }
        ]
      }
    })
  }

  const removeBundleItem = (productId) => {
    setForm((prev) => ({
      ...prev,
      bundle_items: prev.bundle_items.filter((i) => i.product_id !== productId)
    }))
  }

  const updateBundleItemQty = (productId, qty) => {
    setForm((prev) => ({
      ...prev,
      bundle_items: prev.bundle_items.map((i) =>
        i.product_id === productId ? { ...i, qty: Number(qty) || 1 } : i
      )
    }))
  }

  const addImages = useCallback(
    (files) => {
      const newImgs = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, 10 - images.length)
        .map((f) => ({
          id: `${f.name}_${Date.now()}_${Math.random()}`,
          url: URL.createObjectURL(f),
          file: f,
          name: f.name
        }))
      setImages((prev) => [...prev, ...newImgs])
    },
    [images.length]
  )

  const removeImage = useCallback((id) => {
    setImages((prev) => {
      const found = prev.find((i) => i.id === id)
      if (found?.file) URL.revokeObjectURL(found.url)
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const handleSubmit = async () => {
    if (!form.nama.trim()) {
      setErrors({ nama: 'Nama produk wajib diisi' })
      return
    }
    setSaving(true)

    const cleanHargaBeli = Number(String(form.harga_beli).replace(/\D/g, '')) || 0
    const cleanHargaJual = Number(String(form.harga_jual).replace(/\D/g, '')) || 0

    // 1. Create product record
    const res = await productService.create({
      kode: form.kode.trim() || undefined,
      nama: form.nama.trim(),
      kategori: form.kategori,
      satuan: form.satuan,
      harga_beli: cleanHargaBeli,
      harga_jual: cleanHargaJual,
      stok: Number(form.stok) || 0,
      min_stok: Number(form.min_stok) || 0,
      barcode: form.barcode.trim(),
      deskripsi: form.deskripsi.trim(),
      aktif: form.aktif ? 1 : 0,
      is_bundle: form.is_bundle ? 1 : 0,
      bundle_items: form.is_bundle ? form.bundle_items : []
    })

    if (!res.ok) {
      setSaving(false)
      const errStr = String(res.error || '').toLowerCase()
      if (errStr.includes('unique') || errStr.includes('constraint')) {
        if (errStr.includes('kode')) {
          setErrors({ kode: 'Kode produk ini sudah digunakan' })
        } else if (errStr.includes('barcode')) {
          setErrors({ barcode: 'Barcode/SKU ini sudah digunakan' })
        } else {
          setErrors({ general: 'Data sudah ada (duplikat)' })
        }
      } else {
        setErrors({ general: res.error ?? 'Gagal menyimpan produk' })
      }
      return
    }

    // 2. Upload images and patch the record
    if (images.length > 0) {
      const saved = await Promise.all(images.map((img) => imageService.save(img.file, res.data.id)))
      const paths = saved.filter((r) => r.ok).map((r) => r.data)
      if (paths.length > 0) {
        await productService.update(res.data.id, { images: JSON.stringify(paths) })
      }
    }

    // 3. Link modifier groups
    if (selectedModifierIds.length > 0) {
      await modifierService.setProductGroups(res.data.id, selectedModifierIds)
    }

    setSaving(false)
    navigate('/produk/list')
  }

  const toggleModifier = useCallback((id) => {
    setSelectedModifierIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  const createCategoryQuick = useCallback(async ({ nama, deskripsi = '' }) => {
    const res = await categoryService.create({
      nama: String(nama || '').trim(),
      deskripsi,
      aktif: 1
    })
    if (res.ok && res.data) {
      setCategories((prev) => {
        const exists = prev.some((c) => c.id === res.data.id)
        const merged = exists ? prev : [...prev, res.data]
        return merged.sort((a, b) => String(a.nama).localeCompare(String(b.nama), 'id'))
      })
      setForm((prev) => ({ ...prev, kategori: res.data.nama }))
    }
    return res
  }, [])

  const createUnitQuick = useCallback(async ({ nama, singkatan, deskripsi = '' }) => {
    const res = await unitService.create({
      nama: String(nama || '').trim(),
      singkatan: String(singkatan || '').trim(),
      deskripsi,
      aktif: 1
    })
    if (res.ok && res.data) {
      setUnits((prev) => {
        const exists = prev.some((u) => u.id === res.data.id)
        const merged = exists ? prev : [...prev, res.data]
        return merged.sort((a, b) => String(a.nama).localeCompare(String(b.nama), 'id'))
      })
      setForm((prev) => ({ ...prev, satuan: res.data.nama }))
    }
    return res
  }, [])

  return {
    form,
    handleChange,
    handleToggleAktif,
    handleSubmit,
    images,
    addImages,
    removeImage,
    categories,
    units,
    modifierGroups,
    selectedModifierIds,
    toggleModifier,
    createCategoryQuick,
    createUnitQuick,
    saving,
    errors,
    lastProducts,
    allProducts,
    handleToggleBundle,
    addBundleItem,
    removeBundleItem,
    updateBundleItemQty
  }
}
