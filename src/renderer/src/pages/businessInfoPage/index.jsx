import React, { useState, useEffect } from 'react'
import {
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
  Paper,
  IconButton,
  alpha,
  useTheme
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useAuth } from '../../context/authContext'
import { apiService } from '../../services/apiService'
import { profileService } from '../../services/profileService'
import { useNavigate } from 'react-router-dom'

export const BusinessInfoPage = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    storeName: '',
    businessType: '',
    phoneNumber: '',
    address: ''
  })

  // Check if it's forced (i.e. user has not filled it yet)
  const isForced = !localStorage.getItem('businessInfoFilled')

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
  }, [user])

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
        username: user?.username || 'unknown'
      }

      // 1. Send to cloud API
      await apiService.sendBusinessInfo(payload)

      // 2. Save to local SQLite
      await profileService.upsert(payload)

      // Save locally so app knows it's filled
      localStorage.setItem('businessInfoFilled', 'true')

      // Redirect back to home
      navigate('/')
    } catch (error) {
      console.error('Failed to submit business info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
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
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflowY: 'auto',
        p: 4
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 600,
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
            theme.palette.background.paper,
            1
          )} 100%)`
        }}
      >
        <Box sx={{ px: 4, pt: 4, pb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack} sx={{ color: 'text.secondary', ml: -1.5 }}>
            <ArrowBackIcon />
          </IconButton>
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
          <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
            Profil Toko & Informasi Bisnis
          </Typography>
        </Box>

        <Box sx={{ px: 4, pb: 4 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontFamily: 'Poppins, sans-serif',
              lineHeight: 1.6,
              mb: 4
            }}
          >
            Silakan lengkapi atau perbarui informasi profil toko Anda di bawah ini.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Nama Toko"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  size="medium"
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
                  size="medium"
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
                size="medium"
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
                rows={4}
                variant="outlined"
                size="medium"
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Box>

            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={handleBack}
                disabled={loading}
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3
                }}
              >
                Kembali
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Simpan Informasi'}
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  )
}
