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
  aktif: true
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
  }, [])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleToggleAktif = () => {
    setForm((prev) => ({ ...prev, aktif: !prev.aktif }))
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

    // 1. Create product record
    const res = await productService.create({
      kode: form.kode.trim() || undefined,
      nama: form.nama.trim(),
      kategori: form.kategori,
      satuan: form.satuan,
      harga_beli: Number(form.harga_beli) || 0,
      harga_jual: Number(form.harga_jual) || 0,
      stok: Number(form.stok) || 0,
      min_stok: Number(form.min_stok) || 0,
      barcode: form.barcode.trim(),
      deskripsi: form.deskripsi.trim(),
      aktif: form.aktif ? 1 : 0
    })

    if (!res.ok) {
      setSaving(false)
      setErrors({ general: res.error ?? 'Gagal menyimpan produk' })
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
    errors
  }
}
