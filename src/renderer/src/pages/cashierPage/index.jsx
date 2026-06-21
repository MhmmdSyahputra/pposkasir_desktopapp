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
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch
} from '@mui/material'
import {
  PersonAddAltRounded,
  MoreVert,
  EditRounded,
  DeleteRounded,
  VpnKeyRounded
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../productPage/components/PageLayout'
import { useAuth } from '../../context/authContext'
import { useNotifier } from '../../components/core/notificationProvider'

export const CashierPage = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { isSuper, createCashier, listCashiers, updateCashier, deleteCashier, resetPinCashier } =
    useAuth()
  const { show } = useNotifier()

  const [loadingCashier, setLoadingCashier] = useState(false)
  const [creatingCashier, setCreatingCashier] = useState(false)
  const [cashiers, setCashiers] = useState([])
  const [cashierEmail, setCashierEmail] = useState('')
  const [cashierUsername, setCashierUsername] = useState('')
  const [cashierPin, setCashierPin] = useState('')
  const [cashierError, setCashierError] = useState('')

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)

  // Edit State
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ id: null, email: '', username: '', aktif: true })
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete State
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Reset PIN State
  const [resetModal, setResetModal] = useState(false)
  const [resetPin, setResetPin] = useState('')
  const [savingPin, setSavingPin] = useState(false)

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
      show({
        message: t('settings.cashier_create_success', 'Kasir berhasil dibuat'),
        severity: 'success'
      })
      await loadCashiers()
    } catch (error) {
      setCashierError(error.message || t('settings.cashier_create_failed'))
    } finally {
      setCreatingCashier(false)
    }
  }

  const openMenu = (e, row) => {
    setAnchorEl(e.currentTarget)
    setSelectedRow(row)
  }

  const closeMenu = () => {
    setAnchorEl(null)
  }

  const handleEditClick = () => {
    setEditForm({
      id: selectedRow.id,
      email: selectedRow.email || '',
      username: selectedRow.username || '',
      aktif: selectedRow.aktif
    })
    setEditModal(true)
    closeMenu()
  }

  const handleDeleteClick = () => {
    setDeleteModal(true)
    closeMenu()
  }

  const handleResetPinClick = () => {
    setResetPin('')
    setResetModal(true)
    closeMenu()
  }

  const submitEdit = async () => {
    try {
      setSavingEdit(true)
      await updateCashier(editForm)
      show({ message: 'Akun kasir berhasil diperbarui', severity: 'success' })
      setEditModal(false)
      loadCashiers()
    } catch (error) {
      show({ message: error.message || 'Gagal memperbarui kasir', severity: 'error' })
    } finally {
      setSavingEdit(false)
    }
  }

  const submitDelete = async () => {
    try {
      setDeleting(true)
      await deleteCashier({ id: selectedRow.id })
      show({ message: 'Akun kasir berhasil dihapus', severity: 'success' })
      setDeleteModal(false)
      loadCashiers()
    } catch (error) {
      show({ message: error.message || 'Gagal menghapus kasir', severity: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const submitResetPin = async () => {
    try {
      setSavingPin(true)
      await resetPinCashier({ id: selectedRow.id, pin: resetPin })
      show({ message: 'PIN kasir berhasil direset', severity: 'success' })
      setResetModal(false)
    } catch (error) {
      show({ message: error.message || 'Gagal mereset PIN kasir', severity: 'error' })
    } finally {
      setSavingPin(false)
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
      <Box sx={{ width: '100%' }}>
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

          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 2 }}>Daftar Akun Kasir</Typography>

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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      color={row.aktif ? 'success' : 'default'}
                      label={row.aktif ? t('common.active') : t('common.inactive')}
                    />
                    <IconButton size="small" onClick={(e) => openMenu(e, row)}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={handleEditClick} sx={{ fontSize: 13, gap: 1 }}>
          <EditRounded fontSize="small" /> Edit Kasir
        </MenuItem>
        <MenuItem onClick={handleResetPinClick} sx={{ fontSize: 13, gap: 1 }}>
          <VpnKeyRounded fontSize="small" /> Reset PIN
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ fontSize: 13, gap: 1, color: 'error.main' }}>
          <DeleteRounded fontSize="small" /> Hapus Kasir
        </MenuItem>
      </Menu>

      {/* Edit Modal */}
      <Dialog open={editModal} onClose={() => setEditModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Edit Kasir</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              size="small"
              label="Email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              type="email"
              fullWidth
            />
            <TextField
              size="small"
              required
              label="Username"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.aktif}
                  onChange={(e) => setEditForm({ ...editForm, aktif: e.target.checked })}
                  color="primary"
                />
              }
              label={editForm.aktif ? 'Akun Aktif' : 'Akun Nonaktif'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModal(false)} sx={{ textTransform: 'none' }}>
            Batal
          </Button>
          <Button
            onClick={submitEdit}
            variant="contained"
            disabled={savingEdit}
            sx={{ textTransform: 'none' }}
          >
            {savingEdit ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset PIN Modal */}
      <Dialog open={resetModal} onClose={() => setResetModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Reset PIN Kasir</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ fontSize: 13, mb: 2 }}>
            Masukkan PIN baru untuk <b>{selectedRow?.username}</b>
          </Typography>
          <TextField
            size="small"
            required
            label="PIN Baru"
            value={resetPin}
            onChange={(e) => setResetPin(e.target.value.replace(/\D/g, ''))}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              minLength: 6,
              maxLength: 12
            }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetModal(false)} sx={{ textTransform: 'none' }}>
            Batal
          </Button>
          <Button
            onClick={submitResetPin}
            variant="contained"
            disabled={savingPin || resetPin.length < 6}
            sx={{ textTransform: 'none' }}
          >
            {savingPin ? 'Mereset...' : 'Reset PIN'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModal} onClose={() => setDeleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Hapus Kasir</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ fontSize: 13 }}>
            Apakah Anda yakin ingin menghapus akun kasir <b>{selectedRow?.username}</b>?
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'error.main', mt: 1 }}>
            Jika kasir ini sudah pernah melakukan transaksi, kasir tidak dapat dihapus. Anda dapat
            menonaktifkannya melalui opsi Edit.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModal(false)} sx={{ textTransform: 'none' }}>
            Batal
          </Button>
          <Button
            onClick={submitDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ textTransform: 'none' }}
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  )
}
