import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  IconButton
} from '@mui/material'
import { LockOpenRounded, BackspaceRounded } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/authContext'

import loginIllustration from '../../assets/login_illustration.png'

export const LoginPage = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { loginSuper, loginCashier } = useAuth()
  const isDark = theme.palette.mode === 'dark'

  const [role, setRole] = useState('super')
  const [username, setUsername] = useState('')
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cashiers, setCashiers] = useState([])

  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        const res = await window.api.auth.cashierGetAll()
        if (res.ok) {
          setCashiers(res.data || [])
          if (res.data && res.data.length > 0 && role === 'cashier') {
            setUsername(res.data[0].username)
          }
        }
      } catch (err) {
        console.error('Failed to load cashiers:', err)
      }
    }
    fetchCashiers()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      setLoading(true)
      if (role === 'super') {
        await loginSuper({ username, password: secret })
      } else {
        await loginCashier({ username, pin: secret })
      }
    } catch (err) {
      setError(err.message || t('auth.login_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handlePinClick = (val) => {
    if (val === 'C') {
      setSecret('')
    } else if (val === 'DEL') {
      setSecret((prev) => prev.slice(0, -1))
    } else {
      if (secret.length < 12) {
        setSecret((prev) => prev + val)
      }
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Sisi Kiri - Visual / Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          position: 'relative',
          bgcolor: isDark ? '#080d1a' : '#f0f4f8',
          backgroundImage: `url(${loginIllustration})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            bgcolor: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.25)' // darken background to make text pop
          },
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: 6
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            color: '#fff',
            textAlign: 'center',
            maxWidth: 540
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontFamily: 'Poppins, sans-serif',
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
              lineHeight: 1.2
            }}
          >
            P-POS Kasir Desktop
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              opacity: 0.9,
              fontFamily: 'Poppins, sans-serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              lineHeight: 1.6
            }}
          >
            Solusi kasir cerdas dan modern. Dirancang untuk mengelola bisnis Anda lebih cepat dan
            akurat, serta dapat beroperasi penuh secara <strong>offline</strong> tanpa bergantung
            pada koneksi internet.
          </Typography>
        </Box>
      </Box>

      {/* Sisi Kanan - Form Login */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 480px', lg: '0 0 540px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 4, sm: 6, md: 8 },
          bgcolor: isDark ? '#0f172a' : '#ffffff',
          boxShadow: isDark ? '-8px 0 24px rgba(0,0,0,0.4)' : '-8px 0 24px rgba(0,0,0,0.05)',
          zIndex: 2
        }}
      >
        <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 800,
                fontFamily: 'Poppins, sans-serif',
                color: 'text.primary',
                mb: 1
              }}
            >
              {t('auth.title')}
            </Typography>
            <Typography
              sx={{ fontSize: 14, color: 'text.secondary', fontFamily: 'Poppins, sans-serif' }}
            >
              {t('auth.subtitle')}
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Tabs
              value={role}
              onChange={(_e, value) => {
                setRole(value)
                setSecret('')
                setError('')
              }}
              variant="fullWidth"
              sx={{
                mb: 4,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 14,
                  py: 1.5
                }
              }}
            >
              <Tab value="super" label={t('auth.super_tab')} />
              <Tab value="cashier" label={t('auth.cashier_tab')} />
            </Tabs>

            <Stack spacing={2.5}>
              {role === 'super' ? (
                <TextField
                  required
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  InputProps={{
                    sx: { borderRadius: 2, fontFamily: 'Poppins, sans-serif' }
                  }}
                />
              ) : (
                <FormControl fullWidth required>
                  <InputLabel id="cashier-select-label" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    {t('auth.username')}
                  </InputLabel>
                  <Select
                    labelId="cashier-select-label"
                    value={username}
                    label={t('auth.username')}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ borderRadius: 2, fontFamily: 'Poppins, sans-serif' }}
                  >
                    {cashiers.length === 0 ? (
                      <MenuItem value="" disabled>
                        Belum ada akun kasir
                      </MenuItem>
                    ) : (
                      cashiers.map((c) => (
                        <MenuItem key={c.id} value={c.username}>
                          {c.username}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}

              <TextField
                required
                fullWidth
                type="password"
                label={role === 'super' ? t('auth.password') : t('auth.pin')}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                inputProps={
                  role === 'cashier'
                    ? {
                        inputMode: 'none',
                        pattern: '[0-9]*',
                        maxLength: 12,
                        readOnly: true,
                        style: {
                          textAlign: 'center',
                          letterSpacing: '0.7em',
                          fontSize: '1.4rem',
                          fontFamily: 'monospace',
                          fontWeight: 'bold'
                        }
                      }
                    : {}
                }
                autoComplete={role === 'super' ? 'current-password' : 'one-time-code'}
                InputProps={{
                  sx: { borderRadius: 2, fontFamily: 'Poppins, sans-serif' }
                }}
              />

              {role === 'cashier' && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1.5,
                    mt: 1
                  }}
                >
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((btn) => (
                    <Button
                      key={btn}
                      variant="outlined"
                      size="large"
                      onClick={() => handlePinClick(btn)}
                      sx={{
                        py: 1.5,
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        fontFamily: 'Poppins',
                        borderRadius: 2,
                        color: btn === 'C' || btn === 'DEL' ? 'text.secondary' : 'text.primary',
                        borderColor: theme.palette.divider,
                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      {btn === 'DEL' ? <BackspaceRounded fontSize="small" /> : btn}
                    </Button>
                  ))}
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LockOpenRounded />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 15,
                  mt: 1,
                  boxShadow: isDark
                    ? `0 4px 14px 0 ${theme.palette.primary.main}4d`
                    : `0 4px 14px 0 ${theme.palette.primary.main}66`,
                  '&:hover': {
                    boxShadow: isDark
                      ? `0 6px 20px ${theme.palette.primary.main}66`
                      : `0 6px 20px ${theme.palette.primary.main}80`
                  }
                }}
              >
                {loading ? t('auth.logging_in') : t('auth.login_button')}
              </Button>

              {role === 'super' && (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: 'text.secondary',
                    textAlign: 'center',
                    mt: 3,
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {t('auth.default_super_hint')}
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
