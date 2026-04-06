import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryService } from '../../../../services/categoryService'

const defaultForm = { nama: '', deskripsi: '', aktif: true }

export const useCreateCategory = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (error) setError('')
  }

  const handleToggleAktif = () => {
    setForm((prev) => ({ ...prev, aktif: !prev.aktif }))
  }

  const handleSubmit = async () => {
    if (!form.nama.trim()) {
      setError('Nama kategori wajib diisi')
      return
    }
    setSaving(true)
    const res = await categoryService.create({
      nama: form.nama.trim(),
      deskripsi: form.deskripsi.trim(),
      aktif: form.aktif ? 1 : 0
    })
    setSaving(false)
    if (res.ok) {
      navigate('/kategori/list')
    } else {
      setError(res.error ?? 'Gagal menyimpan kategori')
    }
  }

  return { form, handleChange, handleToggleAktif, handleSubmit, saving, error }
}
