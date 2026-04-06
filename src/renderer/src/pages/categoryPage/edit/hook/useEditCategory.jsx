import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { categoryService } from '../../../../services/categoryService'

export const useEditCategory = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama: '', deskripsi: '', aktif: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    categoryService.getById(Number(id)).then((res) => {
      if (res.ok && res.data) {
        const d = res.data
        setForm({ nama: d.nama, deskripsi: d.deskripsi ?? '', aktif: Boolean(d.aktif) })
      }
      setLoading(false)
    })
  }, [id])

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
    const res = await categoryService.update(Number(id), {
      nama: form.nama.trim(),
      deskripsi: form.deskripsi.trim(),
      aktif: form.aktif ? 1 : 0
    })
    setSaving(false)
    if (res.ok) {
      navigate('/kategori/list')
    } else {
      setError(res.error ?? 'Gagal memperbarui kategori')
    }
  }

  return { form, handleChange, handleToggleAktif, handleSubmit, loading, saving, error }
}
