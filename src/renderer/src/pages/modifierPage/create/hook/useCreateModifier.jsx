/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { modifierService } from '../../../../services/modifierService'

const EMPTY_OPTION = () => ({
  _key: `${Date.now()}_${Math.random()}`,
  nama: '',
  harga_tambah: '',
  emoji: ''
})

export const useCreateModifier = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nama: '',
    tipe: 'single',
    wajib: false,
    min_pilih: 0,
    max_pilih: 1,
    aktif: true
  })
  const [options, setOptions] = useState([EMPTY_OPTION()])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleToggleWajib = () => setForm((prev) => ({ ...prev, wajib: !prev.wajib }))
  const handleToggleAktif = () => setForm((prev) => ({ ...prev, aktif: !prev.aktif }))

  const addOption = useCallback(() => setOptions((prev) => [...prev, EMPTY_OPTION()]), [])

  const removeOption = useCallback(
    (key) => setOptions((prev) => (prev.length > 1 ? prev.filter((o) => o._key !== key) : prev)),
    []
  )

  const updateOption = useCallback((key, field, value) => {
    setOptions((prev) => prev.map((o) => (o._key === key ? { ...o, [field]: value } : o)))
  }, [])

  const handleSubmit = async () => {
    const errs = {}
    if (!form.nama.trim()) errs.nama = 'Nama modifier wajib diisi'
    const validOpts = options.filter((o) => o.nama.trim())
    if (validOpts.length === 0) errs.options = 'Minimal 1 opsi wajib diisi'
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSaving(true)
    const res = await modifierService.create({
      nama: form.nama.trim(),
      tipe: form.tipe,
      wajib: form.wajib ? 1 : 0,
      min_pilih: form.tipe === 'multiple' ? Number(form.min_pilih) || 0 : 0,
      max_pilih: form.tipe === 'multiple' ? Number(form.max_pilih) || 1 : 1,
      aktif: form.aktif ? 1 : 0,
      options: validOpts.map((o, idx) => ({
        nama: o.nama.trim(),
        harga_tambah: Number(o.harga_tambah) || 0,
        emoji: o.emoji.trim(),
        urutan: idx
      }))
    })
    setSaving(false)
    if (res.ok) {
      navigate('/modifier/list')
    } else {
      setErrors({ general: res.error ?? 'Gagal menyimpan modifier' })
    }
  }

  return {
    form,
    handleChange,
    handleToggleWajib,
    handleToggleAktif,
    options,
    addOption,
    removeOption,
    updateOption,
    saving,
    errors,
    handleSubmit
  }
}
