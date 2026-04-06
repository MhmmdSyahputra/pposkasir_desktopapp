import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { unitService } from '../../../../services/unitService'

export const useEditUnit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama: '', singkatan: '', deskripsi: '', aktif: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    unitService.getById(Number(id)).then((res) => {
      if (res.ok && res.data) {
        const d = res.data
        setForm({
          nama: d.nama,
          singkatan: d.singkatan,
          deskripsi: d.deskripsi ?? '',
          aktif: Boolean(d.aktif)
        })
      }
      setLoading(false)
    })
  }, [id])

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
    const res = await unitService.update(Number(id), {
      nama: form.nama.trim(),
      singkatan: form.singkatan.trim().toUpperCase(),
      deskripsi: form.deskripsi.trim(),
      aktif: form.aktif ? 1 : 0
    })
    setSaving(false)
    if (res.ok) {
      navigate('/satuan/list')
    } else {
      setErrors({ general: res.error ?? 'Gagal memperbarui satuan' })
    }
  }

  return { form, handleChange, handleToggleAktif, handleSubmit, loading, saving, errors }
}
