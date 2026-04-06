/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import {
  LanguageRounded,
  LogoutRounded,
  PlaylistAddCheckRounded,
  PaletteRounded,
  DeleteSweepRounded,
  PersonAddAltRounded,
  SettingsSuggestRounded,
  SystemUpdateAltRounded,
  UpdateRounded
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../productPage/components/PageLayout'
import { useAuth } from '../../context/authContext'
import { useNotifier } from '../../components/core/notificationProvider'

const InfoCard = ({ title, subtitle, icon, children }) => {
  const theme = useTheme()
  const Icon = icon

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Icon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{title}</Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{subtitle}</Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Paper>
  )
}

export const SettingsPage = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { user, isSuper, logout, createCashier, listCashiers } = useAuth()
  const { show } = useNotifier()
  const [appVersion, setAppVersion] = useState('-')
  const [checking, setChecking] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [loadingCashier, setLoadingCashier] = useState(false)
  const [creatingCashier, setCreatingCashier] = useState(false)
  const [cashiers, setCashiers] = useState([])
  const [cashierEmail, setCashierEmail] = useState('')
  const [cashierUsername, setCashierUsername] = useState('')
  const [cashierPin, setCashierPin] = useState('')
  const [cashierError, setCashierError] = useState('')
  const [resetOpen, setResetOpen] = useState(false)
  const [resetText, setResetText] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [dummyOpen, setDummyOpen] = useState(false)
  const [dummyText, setDummyText] = useState('')
  const [dummyLoading, setDummyLoading] = useState(false)
  const [dummyError, setDummyError] = useState('')
  const [updateStatus, setUpdateStatus] = useState({
    message: '',
    severity: 'info'
  })

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
    const loadVersion = async () => {
      try {
        const version = await window.api.getAppVersion()
        setAppVersion(version || '-')
      } catch (error) {
        console.error('Failed to load app version:', error)
      }
    }

    loadVersion()
  }, [])

  useEffect(() => {
    if (!isSuper) return
    loadCashiers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuper])

  useEffect(() => {
    const unsubProgress = window.api.onUpdateProgress((percent) => {
      setChecking(false)
      setDownloadProgress(percent)
    })

    const unsubNotification = window.api.onUpdateNotification((message, severity) => {
      setChecking(false)
      setUpdateStatus({ message, severity: severity || 'info' })

      if (severity === 'error' || severity === 'success') {
        setDownloadProgress(0)
      }
    })

    return () => {
      unsubProgress()
      unsubNotification()
    }
  }, [])

  const handleCheckUpdates = () => {
    try {
      setChecking(true)
      setDownloadProgress(0)
      setUpdateStatus({ message: t('settings.checking'), severity: 'info' })
      window.api.checkForUpdates()
    } catch (error) {
      console.error('Failed to request update check:', error)
      setChecking(false)
      setUpdateStatus({ message: t('settings.check_failed'), severity: 'error' })
    }
  }

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

  const handleResetAllData = async () => {
    setResetError('')

    if (resetText.trim().toUpperCase() !== 'RESET') {
      setResetError(t('settings.reset_confirm_invalid'))
      return
    }

    if (!resetPassword.trim()) {
      setResetError(t('settings.reset_password_required'))
      return
    }

    try {
      setResetLoading(true)
      const res = await window.api.system.resetAllData({
        username: user?.username || '',
        password: resetPassword
      })
      if (!res?.ok) throw new Error(res?.error || t('settings.reset_failed'))

      show({ message: t('settings.reset_success'), severity: 'success' })
      setResetOpen(false)
      setResetText('')
      setResetPassword('')
      if (isSuper) {
        await loadCashiers()
      }
    } catch (error) {
      setResetError(error.message || t('settings.reset_failed'))
    } finally {
      setResetLoading(false)
    }
  }

  const handleSeedDummyData = async () => {
    setDummyError('')

    if (dummyText.trim().toUpperCase() !== 'DUMMY') {
      setDummyError(t('settings.dummy_confirm_invalid'))
      return
    }

    try {
      setDummyLoading(true)
      const res = await window.api.system.seedDummyData({ count: 10 })
      if (!res?.ok) throw new Error(res?.error || t('settings.dummy_failed'))

      const summary = res.data || {}
      show({
        message: t('settings.dummy_success', {
          categories: summary.categories ?? 0,
          units: summary.units ?? 0,
          products: summary.products ?? 0,
          modifiers: summary.modifierGroups ?? 0
        }),
        severity: 'success'
      })
      setDummyOpen(false)
      setDummyText('')
    } catch (error) {
      setDummyError(error.message || t('settings.dummy_failed'))
    } finally {
      setDummyLoading(false)
    }
  }

  return (
    <PageLayout
      breadcrumbs={[{ label: t('settings.page_title') }]}
      title={t('settings.page_title')}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' }, gap: 2 }}>
        <InfoCard
          title={t('settings.update_title')}
          subtitle={t('settings.update_subtitle')}
          icon={SystemUpdateAltRounded}
        >
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {t('settings.current_version')}
              </Typography>
              <Chip
                size="small"
                color="primary"
                label={`v${appVersion}`}
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Button
              variant="contained"
              startIcon={<UpdateRounded />}
              onClick={handleCheckUpdates}
              disabled={checking}
              sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
            >
              {checking ? t('settings.checking_button') : t('settings.check_button')}
            </Button>

            {checking && <LinearProgress />}

            {downloadProgress > 0 && (
              <Box>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.8 }}>
                  {t('settings.download_progress')}: {downloadProgress.toFixed(0)}%
                </Typography>
                <LinearProgress variant="determinate" value={downloadProgress} />
              </Box>
            )}

            {updateStatus.message && (
              <Alert severity={updateStatus.severity} sx={{ borderRadius: 1.5 }}>
                {updateStatus.message}
              </Alert>
            )}
          </Stack>
        </InfoCard>

        <Stack spacing={2}>
          <InfoCard
            title={t('settings.app_title')}
            subtitle={t('settings.app_subtitle')}
            icon={SettingsSuggestRounded}
          >
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {t('settings.app_name')}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>P-POS Kasir</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {t('settings.theme_mode')}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{theme.palette.mode}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {t('settings.logged_in_as')}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {user?.username || '-'} ({user?.role || '-'})
                </Typography>
              </Box>
            </Stack>
          </InfoCard>

          <InfoCard
            title={t('settings.quick_preferences')}
            subtitle={t('settings.quick_preferences_subtitle')}
            icon={PaletteRounded}
          >
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteRounded sx={{ fontSize: 17, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {t('settings.theme_hint')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LanguageRounded sx={{ fontSize: 17, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {t('settings.language_hint')}
                </Typography>
              </Box>
            </Stack>
          </InfoCard>

          <InfoCard
            title={t('settings.session_title')}
            subtitle={t('settings.session_subtitle')}
            icon={LogoutRounded}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutRounded />}
              onClick={logout}
              sx={{ textTransform: 'none' }}
            >
              {t('settings.logout')}
            </Button>
          </InfoCard>
        </Stack>
      </Box>

      {isSuper && (
        <Box sx={{ mt: 2 }}>
          <InfoCard
            title={t('settings.cashier_title')}
            subtitle={t('settings.cashier_subtitle')}
            icon={PersonAddAltRounded}
          >
            <Box
              component="form"
              onSubmit={handleCreateCashier}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr auto' },
                gap: 1,
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
              <Alert severity="error" sx={{ mt: 1.5 }}>
                {cashierError}
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            {loadingCashier ? (
              <LinearProgress />
            ) : cashiers.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {t('settings.cashier_empty')}
              </Typography>
            ) : (
              <Stack spacing={1}>
                {cashiers.map((row) => (
                  <Box
                    key={row.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1.5
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{row.username}</Typography>
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
          </InfoCard>

          <Box sx={{ mt: 2 }}>
            <InfoCard
              title={t('settings.dummy_title')}
              subtitle={t('settings.dummy_subtitle')}
              icon={PlaylistAddCheckRounded}
            >
              <Alert severity="info" sx={{ mb: 1.5 }}>
                {t('settings.dummy_info')}
              </Alert>
              <Button
                variant="contained"
                startIcon={<PlaylistAddCheckRounded />}
                onClick={() => {
                  setDummyError('')
                  setDummyText('')
                  setDummyOpen(true)
                }}
                sx={{ textTransform: 'none' }}
              >
                {t('settings.dummy_button')}
              </Button>
            </InfoCard>
          </Box>

          <Box sx={{ mt: 2 }}>
            <InfoCard
              title={t('settings.reset_title')}
              subtitle={t('settings.reset_subtitle')}
              icon={DeleteSweepRounded}
            >
              <Alert severity="warning" sx={{ mb: 1.5 }}>
                {t('settings.reset_warning')}
              </Alert>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteSweepRounded />}
                onClick={() => {
                  setResetError('')
                  setResetText('')
                  setResetPassword('')
                  setResetOpen(true)
                }}
                sx={{ textTransform: 'none' }}
              >
                {t('settings.reset_button')}
              </Button>
            </InfoCard>
          </Box>
        </Box>
      )}

      <Dialog open={resetOpen} onClose={() => !resetLoading && setResetOpen(false)}>
        <DialogTitle>{t('settings.reset_dialog_title')}</DialogTitle>
        <DialogContent sx={{ minWidth: 380, pt: '8px !important' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1.25 }}>
            {t('settings.reset_dialog_desc')}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.disabled', mb: 1 }}>
            {t('settings.reset_confirm_instruction')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="RESET"
            value={resetText}
            onChange={(e) => setResetText(e.target.value)}
            autoFocus
          />
          <TextField
            fullWidth
            size="small"
            type="password"
            label={t('settings.reset_password_label')}
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            sx={{ mt: 1 }}
          />
          {resetError && (
            <Alert severity="error" sx={{ mt: 1.25 }}>
              {resetError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)} disabled={resetLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleResetAllData}
            variant="contained"
            color="error"
            disabled={resetLoading}
          >
            {resetLoading ? t('settings.reset_processing') : t('settings.reset_confirm_button')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dummyOpen} onClose={() => !dummyLoading && setDummyOpen(false)}>
        <DialogTitle>{t('settings.dummy_dialog_title')}</DialogTitle>
        <DialogContent sx={{ minWidth: 380, pt: '8px !important' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1.25 }}>
            {t('settings.dummy_dialog_desc')}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.disabled', mb: 1 }}>
            {t('settings.dummy_confirm_instruction')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="DUMMY"
            value={dummyText}
            onChange={(e) => setDummyText(e.target.value)}
            autoFocus
          />
          {dummyError && (
            <Alert severity="error" sx={{ mt: 1.25 }}>
              {dummyError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDummyOpen(false)} disabled={dummyLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSeedDummyData} variant="contained" disabled={dummyLoading}>
            {dummyLoading ? t('settings.dummy_processing') : t('settings.dummy_confirm_button')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  )
}
