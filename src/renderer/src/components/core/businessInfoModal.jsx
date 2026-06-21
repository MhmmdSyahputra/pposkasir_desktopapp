import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { useAuth } from '../../context/authContext'
import { apiService } from '../../services/apiService'
import { profileService } from '../../services/profileService'

export const BusinessInfoModal = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    storeName: '',
    businessType: '',
    phoneNumber: '',
    address: ''
  })

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      try {
        const profile = await profileService.get()
        if (profile) {
          setFormData({
            storeName: profile.nama_toko || '',
            businessType: profile.lini_bisnis || '',
            phoneNumber: profile.telepon || '',
            address: profile.alamat || ''
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }

    fetchProfile()

    const isFilled = localStorage.getItem('businessInfoFilled')
    if (!isFilled) {
      setOpen(true)
    }
  }, [user])

  const handleClose = () => {
    setOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        username: user?.username || 'unknown',
        meta: {
          app_source: 'P-POS Kasir',
          platform: 'Desktop Windows',
          submitted_at: new Date().toISOString()
        }
      }

      // 1. Send to cloud API
      await apiService.sendBusinessInfo(payload)

      // 2. Save to local SQLite
      await profileService.upsert(payload)

      // Save locally so it doesn't show again
      localStorage.setItem('businessInfoFilled', 'true')
      setOpen(false)
    } catch (error) {
      console.error('Failed to submit business info:', error)
    } finally {
      setLoading(false)
    }
  }

  const businessTypes = [
    'Retail / Minimarket',
    'F&B (Restoran/Cafe/Warung)',
    'Jasa / Servis',
    'Pakaian / Fashion',
    'Kecantikan / Salon',
    'Kesehatan / Apotek',
    'Elektronik / Gadget',
    'Lainnya'
  ]

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
            theme.palette.background.paper,
            1
          )} 100%)`
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            display: 'flex'
          }}
        >
          <StorefrontIcon />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
          Informasi Bisnis Anda
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 20,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 4 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: 1.6,
            mb: 3
          }}
        >
          Halo! Bantu kami melengkapi informasi profil toko Anda. Data ini bisa Anda lengkapi kapan
          saja melalui menu Profil.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Nama Toko"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                size="small"
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                select
                label="Lini Bisnis"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                size="small"
                SelectProps={{ native: true }}
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                <option value="" disabled></option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Nomor Telepon / WhatsApp"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              label="Alamat Lengkap Toko"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={3}
              variant="outlined"
              size="small"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              onClick={handleClose}
              disabled={loading}
              sx={{
                color: 'text.secondary',
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Lewati (Nanti)
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: 3,
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Simpan'}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}
