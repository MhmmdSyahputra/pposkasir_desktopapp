import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { PersonAddAltRounded } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../productPage/components/PageLayout'
import { useAuth } from '../../context/authContext'
import { useNotifier } from '../../components/core/notificationProvider'

export const CashierPage = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { isSuper, createCashier, listCashiers } = useAuth()
  const { show } = useNotifier()

  const [loadingCashier, setLoadingCashier] = useState(false)
  const [creatingCashier, setCreatingCashier] = useState(false)
  const [cashiers, setCashiers] = useState([])
  const [cashierEmail, setCashierEmail] = useState('')
  const [cashierUsername, setCashierUsername] = useState('')
  const [cashierPin, setCashierPin] = useState('')
  const [cashierError, setCashierError] = useState('')

  const loadCashiers = async () => {
    try {
      setLoadingCashier(true)
      const rows = await listCashiers()
      setCashiers(rows)
    } catch (error) {
      setCashierError(error.message || t('settings.cashier_load_failed'))
    } finally {
      setLoadingCashier(false)
    }
  }

  useEffect(() => {
    if (!isSuper) return
    loadCashiers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuper])

  const handleCreateCashier = async (e) => {
    e.preventDefault()
    setCashierError('')

    try {
      setCreatingCashier(true)
      await createCashier({
        email: cashierEmail,
        username: cashierUsername,
        pin: cashierPin
      })

      setCashierEmail('')
      setCashierUsername('')
      setCashierPin('')
      show({ message: t('settings.cashier_create_success'), severity: 'success' })
      await loadCashiers()
    } catch (error) {
      setCashierError(error.message || t('settings.cashier_create_failed'))
    } finally {
      setCreatingCashier(false)
    }
  }

  if (!isSuper) {
    return (
      <PageLayout title={t('settings.cashier_title')}>
        <Alert severity="warning">Halaman ini hanya dapat diakses oleh Super Admin.</Alert>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      breadcrumbs={[{ label: t('settings.cashier_title') }]}
      title={t('settings.cashier_title')}
    >
      <Box sx={{ maxWidth: 800 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <PersonAddAltRounded sx={{ color: 'primary.main', fontSize: 24 }} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                {t('settings.cashier_title')}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                {t('settings.cashier_subtitle')}
              </Typography>
            </Box>
          </Box>

          <Box
            component="form"
            onSubmit={handleCreateCashier}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr auto' },
              gap: 1.5,
              alignItems: 'start'
            }}
          >
            <TextField
              size="small"
              label={t('settings.cashier_email')}
              value={cashierEmail}
              onChange={(e) => setCashierEmail(e.target.value)}
              type="email"
            />
            <TextField
              size="small"
              required
              label={t('settings.cashier_username')}
              value={cashierUsername}
              onChange={(e) => setCashierUsername(e.target.value)}
            />
            <TextField
              size="small"
              required
              label={t('settings.cashier_pin')}
              value={cashierPin}
              onChange={(e) => setCashierPin(e.target.value.replace(/\D/g, ''))}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                minLength: 6,
                maxLength: 12
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={creatingCashier}
              sx={{ textTransform: 'none', minHeight: 40 }}
            >
              {creatingCashier ? t('settings.creating') : t('settings.cashier_create')}
            </Button>
          </Box>

          {cashierError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {cashierError}
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 2 }}>
            Daftar Akun Kasir
          </Typography>

          {loadingCashier ? (
            <LinearProgress />
          ) : cashiers.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('settings.cashier_empty')}
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {cashiers.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1.5
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{row.username}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {row.email || '-'}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color={row.aktif ? 'success' : 'default'}
                    label={row.aktif ? t('common.active') : t('common.inactive')}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </PageLayout>
  )
}
