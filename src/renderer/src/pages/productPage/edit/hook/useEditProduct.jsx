import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productService } from '../../../../services/productService'
import { categoryService } from '../../../../services/categoryService'
import { unitService } from '../../../../services/unitService'
import { imageService } from '../../../../services/imageService'
import { modifierService } from '../../../../services/modifierService'

export const useEditProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
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
  })
  const [images, setImages] = useState([]) // current state (new + existing)
  const [origImages, setOrigImages] = useState([]) // snapshot at load time
  const [categories, setCategories] = useState([])
  const [units, setUnits] = useState([])
  const [modifierGroups, setModifierGroups] = useState([]) // all available
  const [selectedModifierIds, setSelectedModifierIds] = useState([]) // currently linked
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [allProducts, setAllProducts] = useState([])

  useEffect(() => {
    Promise.all([
      productService.getById(Number(id)),
      categoryService.getAll(),
      unitService.getAll(),
      modifierService.getAll(),
      modifierService.getProductGroups(Number(id)),
      productService.getAll({ search: '' })
    ]).then(([pRes, cRes, uRes, mRes, pmRes, allPRes]) => {
      if (pRes.ok && pRes.data) {
        const d = pRes.data
        setForm({
          kode: d.kode || '',
          nama: d.nama || '',
          kategori: d.kategori || '',
          satuan: d.satuan || '',
          harga_beli: d.harga_beli ? Number(d.harga_beli).toLocaleString('id-ID') : '',
          harga_jual: d.harga_jual ? Number(d.harga_jual).toLocaleString('id-ID') : '',
          stok: d.stok ?? '',
          min_stok: d.min_stok ?? '',
          barcode: d.barcode || '',
          deskripsi: d.deskripsi || '',
          aktif: Boolean(d.aktif),
          is_bundle: Boolean(d.is_bundle),
          bundle_items: d.bundle_items || []
        })
        const imgs = imageService.parseImages(d.images)
        setImages(imgs)
        setOrigImages(imgs)
      }
      if (cRes.ok) setCategories(cRes.data)
      if (uRes.ok) setUnits(uRes.data)
      if (mRes.ok) setModifierGroups(mRes.data)
      if (pmRes.ok) setSelectedModifierIds(pmRes.data.map((g) => g.id))
      if (allPRes.ok) {
        const singles = allPRes.data.filter((p) => !p.is_bundle && p.id !== Number(id))
        setAllProducts(singles)
      }
      setLoading(false)
    })
  }, [id])

  const handleChange = (field) => (e) => {
    let val = e.target.value
    if (field === 'harga_beli' || field === 'harga_jual') {
      const digits = val.replace(/\D/g, '')
      val = digits ? Number(digits).toLocaleString('id-ID') : ''
    }
    setForm((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleToggleAktif = () => setForm((prev) => ({ ...prev, aktif: !prev.aktif }))

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

  const removeImage = useCallback((imgId) => {
    setImages((prev) => {
      const found = prev.find((i) => i.id === imgId)
      if (found?.file) URL.revokeObjectURL(found.url)
      return prev.filter((i) => i.id !== imgId)
    })
  }, [])

  const handleSubmit = async () => {
    if (!form.nama.trim()) {
      setErrors({ nama: 'Nama produk wajib diisi' })
      return
    }
    setSaving(true)

    // Delete images that were removed
    const removed = origImages.filter((o) => !images.find((i) => i.relativePath === o.relativePath))
    await Promise.all(removed.map((i) => imageService.delete(i.relativePath)))

    // Upload new images
    const newImgs = images.filter((i) => i.file)
    const saved = await Promise.all(newImgs.map((i) => imageService.save(i.file, Number(id))))
    const newPaths = saved.filter((r) => r.ok).map((r) => r.data)

    // Merge: keep surviving existing + add newly saved
    const existingPaths = images.filter((i) => i.relativePath).map((i) => i.relativePath)
    const finalPaths = [...existingPaths, ...newPaths]

    const cleanHargaBeli = Number(String(form.harga_beli).replace(/\D/g, '')) || 0
    const cleanHargaJual = Number(String(form.harga_jual).replace(/\D/g, '')) || 0

    const res = await productService.update(Number(id), {
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
      images: JSON.stringify(finalPaths),
      is_bundle: form.is_bundle ? 1 : 0,
      bundle_items: form.is_bundle ? form.bundle_items : []
    })

    // Save modifier group links
    await modifierService.setProductGroups(Number(id), selectedModifierIds)

    // Send log metadata to endpoint via main process IPC log handler
    if (res.ok) {
      try {
        let appVersion = ''
        if (window.api && window.api.getAppVersion) {
          appVersion = await window.api.getAppVersion()
        }
        if (window.api && window.api.logAction) {
          window.api.logAction({
            type: 'product_update',
            payload: { id: Number(id), ...form },
            description: `Produk "${form.nama}" (ID: ${id}) berhasil diperbarui (v${appVersion})`
          })
        }
      } catch (logErr) {
        console.error('Failed to log product update:', logErr)
      }
    }

    setSaving(false)
    if (res.ok) {
      navigate('/produk/list')
    } else {
      const errStr = String(res.error || '').toLowerCase()
      if (errStr.includes('unique') || errStr.includes('constraint')) {
        if (errStr.includes('barcode')) {
          setErrors({ barcode: 'Barcode/SKU ini sudah digunakan' })
        } else {
          setErrors({ general: 'Data sudah ada (duplikat)' })
        }
      } else {
        setErrors({ general: res.error ?? 'Gagal menyimpan perubahan' })
      }
    }
  }

  const handleDelete = async () => {
    await Promise.all(origImages.map((i) => imageService.delete(i.relativePath)))
    await productService.delete(Number(id))
    navigate('/produk/list')
  }

  const toggleModifier = useCallback((mId) => {
    setSelectedModifierIds((prev) =>
      prev.includes(mId) ? prev.filter((x) => x !== mId) : [...prev, mId]
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
    handleDelete,
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
    loading,
    saving,
    errors,
    allProducts,
    handleToggleBundle,
    addBundleItem,
    removeBundleItem,
    updateBundleItemQty
  }
}
