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
    aktif: true
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

  useEffect(() => {
    Promise.all([
      productService.getById(Number(id)),
      categoryService.getAll(),
      unitService.getAll(),
      modifierService.getAll(),
      modifierService.getProductGroups(Number(id))
    ]).then(([pRes, cRes, uRes, mRes, pmRes]) => {
      if (pRes.ok && pRes.data) {
        const d = pRes.data
        setForm({
          kode: d.kode || '',
          nama: d.nama || '',
          kategori: d.kategori || '',
          satuan: d.satuan || '',
          harga_beli: d.harga_beli ?? '',
          harga_jual: d.harga_jual ?? '',
          stok: d.stok ?? '',
          min_stok: d.min_stok ?? '',
          barcode: d.barcode || '',
          deskripsi: d.deskripsi || '',
          aktif: Boolean(d.aktif)
        })
        const imgs = imageService.parseImages(d.images)
        setImages(imgs)
        setOrigImages(imgs)
      }
      if (cRes.ok) setCategories(cRes.data)
      if (uRes.ok) setUnits(uRes.data)
      if (mRes.ok) setModifierGroups(mRes.data)
      if (pmRes.ok) setSelectedModifierIds(pmRes.data.map((g) => g.id))
      setLoading(false)
    })
  }, [id])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleToggleAktif = () => setForm((prev) => ({ ...prev, aktif: !prev.aktif }))

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

    const res = await productService.update(Number(id), {
      nama: form.nama.trim(),
      kategori: form.kategori,
      satuan: form.satuan,
      harga_beli: Number(form.harga_beli) || 0,
      harga_jual: Number(form.harga_jual) || 0,
      stok: Number(form.stok) || 0,
      min_stok: Number(form.min_stok) || 0,
      barcode: form.barcode.trim(),
      deskripsi: form.deskripsi.trim(),
      aktif: form.aktif ? 1 : 0,
      images: JSON.stringify(finalPaths)
    })

    // Save modifier group links
    await modifierService.setProductGroups(Number(id), selectedModifierIds)

    setSaving(false)
    if (res.ok) {
      navigate('/produk/list')
    } else {
      setErrors({ general: res.error ?? 'Gagal menyimpan perubahan' })
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
    const res = await categoryService.create({ nama: String(nama || '').trim(), deskripsi, aktif: 1 })
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
    errors
  }
}
