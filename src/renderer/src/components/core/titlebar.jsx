import { useEffect, useState } from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme
} from '@mui/material'
import {
  Minimize,
  CropSquare,
  Close,
  Settings,
  Warning,
  DarkModeRounded,
  LightModeRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppLogo from '@renderer/assets/electron.svg'
import { useThemeMode } from '@renderer/context/themeMode'

export const TitleBar = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { mode: themeMode, toggleMode: toggleTheme } = useThemeMode()
  const theme = useTheme()
  const appTitle = 'P-POS Kasir'

  const handleLangToggle = () => {
    const newLang = i18n.language === 'id' ? 'en' : 'id'
    i18n.changeLanguage(newLang)
    localStorage.setItem('ppos-lang', newLang)
  }
  const [deviceId, setDeviceId] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [deviceBrand, setDeviceBrand] = useState('')
  const [deviceInfo, setDeviceInfo] = useState({
    hostname: '',
    platform: '',
    arch: '',
    osVersion: '',
    cpu: '',
    cpuCores: null,
    totalRam: null,
    freeRam: null,
    uptime: null,
    ipAddress: '',
    macAddress: '',
    username: ''
  })
  const [openCloseDialog, setOpenCloseDialog] = useState(false)
  const [openDeviceDialog, setOpenDeviceDialog] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { key, altKey, ctrlKey } = e

      if (key === 'F4' && altKey) e.preventDefault()
      if (key === 'F5') e.preventDefault()
      if (key === 'f' && altKey) e.preventDefault()
      if (key === 'F11') e.preventDefault()
      if ((key === 'r' || key === 'R') && ctrlKey) {
        window.location.reload()
      }
      if (key === 'i' && ctrlKey) {
        e.preventDefault()
        navigate('/xyz/info')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const getDeviceUuid = async () => {
    try {
      const res = await window.api.device.deviceUuid()
      if (res) {
        setDeviceId(res)
      }
    } catch (error) {
      console.error('Failed to get device uuid', error)
    }
  }

  const getDeviceName = async () => {
    try {
      const res = await window.api.device.deviceName()
      if (res?.hostname) {
        const label = `${res.hostname} (${res.platform})`
        setDeviceName(label)
      }
    } catch (error) {
      console.error('Failed to get device name', error)
    }
  }
  const getDeviceBrand = async () => {
    try {
      const res = await window.api.device.deviceBrand()
      if (res?.manufacturer || res?.model) {
        setDeviceBrand(`${res.manufacturer} ${res.model}`.trim())
      }
    } catch (error) {
      console.error('Failed to get device brand', error)
    }
  }

  const getDeviceInfo = async () => {
    try {
      const res = await window.api.device.deviceInfo()
      console.log(res)

      setDeviceInfo(res)
    } catch (error) {
      console.error('Failed to get device info', error)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getDeviceName()
    getDeviceUuid()
    getDeviceInfo()
    getDeviceBrand()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault()
        setOpenDeviceDialog((prev) => !prev)
      }
      if ((e.key === 'r' || e.key === 'R') && e.ctrlKey) {
        window.location.reload()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleMinimize = () => {
    window.electron?.ipcRenderer.send('window-minimize')
  }

  const handleMaximize = () => {
    window.electron?.ipcRenderer.send('window-maximize')
  }

  const handleCloseClick = () => {
    setOpenCloseDialog(true)
  }

  const handleCloseConfirm = () => {
    setOpenCloseDialog(false)
    window.electron?.ipcRenderer.send('window-close')
  }

  const handleCloseCancel = () => {
    setOpenCloseDialog(false)
  }

  const subtleHoverBg = theme.palette.action.hover

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          height: 40,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          WebkitAppRegion: 'drag'
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 40, px: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: 0,
              pr: 1.5,
              borderRight: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box
              component="img"
              src={AppLogo}
              alt="P-POS Kasir"
              sx={{
                width: 18,
                height: 18,
                objectFit: 'contain',
                opacity: 0.95,
                filter: themeMode === 'dark' ? 'drop-shadow(0 0 8px rgba(26,115,232,0.35))' : 'none'
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.35,
                  fontFamily: 'Poppins, sans-serif',
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap'
                }}
              >
                {appTitle}
              </Typography>
            </Box>
          </Box>

          <Box flex={1} />

          {/* RIGHT - User Profile & Window Controls */}
          <Box display="flex" alignItems="center" gap={1} sx={{ WebkitAppRegion: 'no-drag' }}>
            {/* Language toggle */}
            <Tooltip
              title={i18n.language === 'id' ? t('lang.switch_to_en') : t('lang.switch_to_id')}
            >
              <IconButton
                size="small"
                onClick={handleLangToggle}
                sx={{
                  color: 'text.secondary',
                  WebkitAppRegion: 'no-drag',
                  '&:hover': { bgcolor: subtleHoverBg }
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'text.primary',
                    letterSpacing: 0.5
                  }}
                >
                  {i18n.language === 'id' ? 'ID' : 'EN'}
                </Typography>
              </IconButton>
            </Tooltip>
            {/* Theme toggle */}
            <IconButton
              size="small"
              onClick={toggleTheme}
              title={themeMode === 'dark' ? t('titlebar.switch_light') : t('titlebar.switch_dark')}
              sx={{
                color: 'text.secondary',
                WebkitAppRegion: 'no-drag',
                '&:hover': { bgcolor: subtleHoverBg }
              }}
            >
              {themeMode === 'dark' ? (
                <LightModeRounded sx={{ fontSize: 17 }} />
              ) : (
                <DarkModeRounded sx={{ fontSize: 17 }} />
              )}
            </IconButton>
            {/* User Profile Button */}

            {/* Window Control Buttons */}
            <Box display="flex" alignItems="center" sx={{ ml: 1 }}>
              <IconButton
                size="small"
                onClick={handleMinimize}
                sx={{
                  borderRadius: 0,
                  width: 36,
                  height: 36,
                  p: 0,
                  '&:hover': {
                    bgcolor: subtleHoverBg
                  }
                }}
                aria-label="Minimize"
              >
                <Minimize sx={{ color: 'text.primary', fontSize: 18, mb: '12px' }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleMaximize}
                sx={{
                  borderRadius: 0,
                  width: 36,
                  height: 36,
                  p: 0,
                  '&:hover': {
                    bgcolor: subtleHoverBg
                  }
                }}
                aria-label="Maximize"
              >
                <CropSquare sx={{ color: 'text.primary', fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCloseClick}
                sx={{
                  borderRadius: 0,
                  width: 36,
                  height: 36,
                  p: 0,
                  '&:hover': {
                    bgcolor: 'error.main'
                  }
                }}
                aria-label="Close"
              >
                <Close sx={{ color: 'text.primary', fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog
        open={openCloseDialog}
        onClose={handleCloseCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 420,
            bgcolor: '#151b26',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.55)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,152,0,0.22)',
                color: '#ffb74d',
                width: 48,
                height: 48
              }}
            >
              <Warning />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#f0f4ff' }}>
                {t('titlebar.close_title')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(232,234,246,0.5)' }}>
                {t('titlebar.close_subtitle')}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: 'rgba(232,234,246,0.72)', lineHeight: 1.7 }}>
            {t('titlebar.close_warning')}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleCloseCancel}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: 'rgba(255,255,255,0.18)',
              color: '#dbe3f3',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.3)',
                bgcolor: 'rgba(255,255,255,0.06)'
              }
            }}
          >
            {t('titlebar.cancel')}
          </Button>
          <Button
            onClick={handleCloseConfirm}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              minWidth: 120,
              bgcolor: '#c53d34',
              '&:hover': { bgcolor: '#a83129' }
            }}
          >
            {t('titlebar.close_app')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeviceDialog}
        onClose={() => setOpenDeviceDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 520,
            maxWidth: 720,
            width: '90vw',
            maxHeight: '82vh',
            bgcolor: '#151b26',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.55)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: 'rgba(66,165,245,0.22)',
                color: '#64b5f6',
                width: 48,
                height: 48
              }}
            >
              <Settings />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#f0f4ff' }}>
                {t('titlebar.device_info_title')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(232,234,246,0.5)' }}>
                {t('titlebar.device_info_subtitle')}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 99,
              bgcolor: 'rgba(255,255,255,0.16)'
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(232,234,246,0.45)', fontWeight: 700, letterSpacing: 0.8 }}
              >
                {t('titlebar.device_id')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  p: 1.5,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  color: '#dde5f5',
                  border: '1px solid rgba(255,255,255,0.08)',
                  wordBreak: 'break-all'
                }}
              >
                {deviceId || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(232,234,246,0.45)', fontWeight: 700, letterSpacing: 0.8 }}
              >
                {t('titlebar.device_name')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  p: 1.5,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  color: '#dde5f5',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                {deviceName || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(232,234,246,0.45)', fontWeight: 700, letterSpacing: 0.8 }}
              >
                {t('titlebar.device_brand')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  p: 1.5,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  color: '#dde5f5',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                {deviceBrand || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(232,234,246,0.45)', fontWeight: 700, letterSpacing: 0.8 }}
              >
                {t('titlebar.ip_address')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  p: 1.5,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  color: '#dde5f5',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                {deviceInfo?.ipAddress || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(232,234,246,0.45)', fontWeight: 700, letterSpacing: 0.8 }}
              >
                {t('titlebar.mac_address')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  p: 1.5,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  color: '#dde5f5',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                {deviceInfo?.macAddress || '-'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenDeviceDialog(false)}
            variant="contained"
            sx={{
              textTransform: 'none',
              bgcolor: '#1a73e8',
              minWidth: 84,
              '&:hover': { bgcolor: '#1557b0' }
            }}
          >
            {t('titlebar.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
