import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { LockOpenRounded } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/authContext'

export const LoginPage = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { loginSuper, loginCashier } = useAuth()

  const [role, setRole] = useState('super')
  const [username, setUsername] = useState('')
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        bgcolor: 'background.default',
        backgroundImage:
          theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.18), transparent 42%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.12), transparent 38%)'
            : 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.12), transparent 42%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.08), transparent 38%)'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}
        >
          <Typography sx={{ fontSize: 19, fontWeight: 800, letterSpacing: 0.3 }}>
            {t('auth.title')}
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
            {t('auth.subtitle')}
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2.25 }}>
          <Tabs
            value={role}
            onChange={(_e, value) => {
              setRole(value)
              setSecret('')
              setError('')
            }}
            sx={{ mb: 2 }}
          >
            <Tab value="super" label={t('auth.super_tab')} />
            <Tab value="cashier" label={t('auth.cashier_tab')} />
          </Tabs>

          <Stack spacing={1.5}>
            <TextField
              required
              size="small"
              label={t('auth.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <TextField
              required
              size="small"
              type="password"
              label={role === 'super' ? t('auth.password') : t('auth.pin')}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              inputProps={role === 'cashier' ? { inputMode: 'numeric', pattern: '[0-9]*' } : {}}
              autoComplete={role === 'super' ? 'current-password' : 'one-time-code'}
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={<LockOpenRounded />}
              sx={{ textTransform: 'none' }}
            >
              {loading ? t('auth.logging_in') : t('auth.login_button')}
            </Button>

            {role === 'super' && (
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                {t('auth.default_super_hint')}
              </Typography>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}
