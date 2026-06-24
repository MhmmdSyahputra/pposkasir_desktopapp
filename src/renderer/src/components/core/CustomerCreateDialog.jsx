import PropTypes from 'prop-types'
import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material'
import { customerService } from '../../services/customerService'
import { useNotifier } from './notificationProvider'

export const CustomerCreateDialog = ({ open, onClose, onSuccess }) => {
  const [nama, setNama] = useState('')
  const [telepon, setTelepon] = useState('')
  const [alamat, setAlamat] = useState('')
  const [saving, setSaving] = useState(false)
  const { show } = useNotifier()

  const handleClose = () => {
    setNama('')
    setTelepon('')
    setAlamat('')
    onClose()
  }

  const handleSave = async () => {
    if (!nama.trim()) {
      show({ message: 'Nama pelanggan harus diisi', severity: 'warning' })
      return
    }

    setSaving(true)
    try {
      const res = await customerService.create({ nama, telepon, alamat })
      if (res.ok) {
        show({ message: 'Pelanggan berhasil ditambahkan', severity: 'success' })
        onSuccess(res.data)
        handleClose()
      } else {
        show({ message: 'Gagal menambahkan pelanggan', description: res.error, severity: 'error' })
      }
    } catch (e) {
      show({ message: 'Terjadi kesalahan', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 600 }}>
        Tambah Pelanggan Baru
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Nama *"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            label="No. Telepon / WhatsApp"
            value={telepon}
            onChange={(e) => setTelepon(e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            label="Alamat"
            multiline
            rows={2}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          disabled={saving}
          sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
        >
          Batal
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

CustomerCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}
