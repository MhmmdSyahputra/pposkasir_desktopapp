import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { unitService } from '../../../../services/unitService'

const defaultForm = { nama: '', singkatan: '', deskripsi: '', aktif: true }

export const useCreateUnit = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleToggleAktif = () => {
    setForm((prev) => ({ ...prev, aktif: !prev.aktif }))
  }

  const validate = () => {
    const errs = {}
    if (!form.nama.trim()) errs.nama = 'Nama satuan wajib diisi'
    if (!form.singkatan.trim()) errs.singkatan = 'Singkatan wajib diisi'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSaving(true)
    const res = await unitService.create({
      nama: form.nama.trim(),
      singkatan: form.singkatan.trim().toUpperCase(),
      deskripsi: form.deskripsi.trim(),
      aktif: form.aktif ? 1 : 0
    })
    setSaving(false)
    if (res.ok) {
      navigate('/satuan/list')
    } else {
      setErrors({ general: res.error ?? 'Gagal menyimpan satuan' })
    }
  }

  return { form, handleChange, handleToggleAktif, handleSubmit, saving, errors }
}
