import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
  alpha,
  Tooltip,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import {
  AddRounded,
  SearchRounded,
  DeleteOutlineRounded,
  TrendingDownRounded,
  ClearRounded,
  ReceiptLongOutlined,
  SettingsRounded,
  AddPhotoAlternateRounded,
  DeleteRounded,
  CloseRounded
} from '@mui/icons-material'
import { PageLayout } from '../productPage/components/PageLayout'
import { expenseService } from '../../services/expenseService'
import { useAuth } from '../../context/authContext'
import { useNotifier } from '../../components/core/notificationProvider'
import { DatePicker } from '../../components/ui/DatePicker'
import { imageService } from '../../services/imageService'

const DEFAULT_CATEGORIES = [
  { id: 'operasional', nama: 'Operasional' },
  { id: 'bahan baku', nama: 'Bahan Baku' },
  { id: 'sewa', nama: 'Sewa Tempat' },
  { id: 'gaji', nama: 'Gaji / Karyawan' },
  { id: 'lain-lain', nama: 'Lain-lain' }
]

export const ExpensePage = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const { show } = useNotifier()
  const isDark = theme.palette.mode === 'dark'
  const fileInputRef = useRef(null)

  // List & Filters State
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Custom Categories State
  const [customCategories, setCustomCategories] = useState([])
  const [newCatName, setNewCatName] = useState('')
  const [openManageCatDialog, setOpenManageCatDialog] = useState(false)

  // Dialog State
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)

  // Form State
  const [formCategory, setFormCategory] = useState('operasional')
  const [formJumlah, setFormJumlah] = useState('')
  const [formKeterangan, setFormKeterangan] = useState('')
  const [images, setImages] = useState([]) // [{ id, url, file, name }]
  const [dragOver, setDragOver] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await expenseService.categoryGetAll()
      if (res.ok) {
        setCustomCategories(res.data)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await expenseService.getAll({
        search,
        startDate,
        endDate
      })
      if (res.ok) {
        setExpenses(res.data)
      } else {
        show({ message: `Gagal memuat pengeluaran: ${res.error}`, severity: 'error' })
      }
    } catch (err) {
      show({ message: `Terjadi kesalahan: ${err.message}`, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [search, startDate, endDate, show])

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
  }, [fetchExpenses, fetchCategories])

  const handleResetFilters = () => {
    setSearch('')
    setStartDate('')
    setEndDate('')
  }

  const handleOpenAdd = () => {
    setFormCategory(allCategories[0]?.nama || 'operasional')
    setFormJumlah('')
    setFormKeterangan('')
    setImages([])
    setOpenAddDialog(true)
  }

  // Combine default and custom categories, mapping default categories to uppercase/normalised names
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.map((c) => ({ id: c.nama, nama: c.nama }))
  ]

  const handleSaveExpense = async () => {
    const amount = Number(String(formJumlah).replace(/\D/g, ''))
    if (!amount || amount <= 0) {
      show({ message: 'Jumlah pengeluaran harus lebih besar dari 0', severity: 'warning' })
      return
    }

    try {
      // 1. Create the expense first to get ID (though we don't use id for image saving like products, wait, products does: imageService.save(img.file, productId))
      // For expense, we can use a temporary ID or a hash, or we can just pass an empty ID. Wait, let's see image:save handler in image.ipc.js.
      // IPC handle: 'image:save', (_e, { buffer, ext, productId }) => filename is `${productId}_${randomUUID()}.${ext.toLowerCase()}`
      // We can use 0 or some negative/other placeholder or a random number for productId for expense receipt images! Let's pass 0.
      let uploadedImagePaths = []
      if (images.length > 0) {
        const saved = await Promise.all(images.map((img) => imageService.save(img.file, 0)))
        uploadedImagePaths = saved.filter((r) => r.ok).map((r) => r.data)
      }

      const payload = {
        kategori: formCategory,
        jumlah: amount,
        keterangan: formKeterangan,
        kasir: user?.username || 'System',
        images: JSON.stringify(uploadedImagePaths)
      }

      const res = await expenseService.create(payload)
      if (res.ok) {
        show({ message: 'Pengeluaran berhasil dicatat', severity: 'success' })

        // Get app version for logging metadata
        let appVersion = ''
        try {
          if (window.api && window.api.getAppVersion) {
            appVersion = await window.api.getAppVersion()
          }
        } catch (_) {
          appVersion = 'unknown'
        }

        // Send log metadata to endpoint via main process IPC log handler
        if (window.api && window.api.logAction) {
          window.api.logAction({
            type: 'expense',
            payload: res.data,
            description: `Pengeluaran baru sebesar ${formatRupiah(amount)} dicatat oleh kasir ${payload.kasir} (v${appVersion})`
          })
        }

        setOpenAddDialog(false)
        fetchExpenses()
      } else {
        show({ message: `Gagal menyimpan: ${res.error}`, severity: 'error' })
      }
    } catch (err) {
      show({ message: `Terjadi kesalahan: ${err.message}`, severity: 'error' })
    }
  }

  const handleOpenDelete = (expense) => {
    setSelectedExpense(expense)
    setOpenDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedExpense) return

    try {
      // also delete images from local disk if necessary
      const paths = JSON.parse(selectedExpense.images || '[]')
      await Promise.all(paths.map((p) => imageService.delete(p)))

      const res = await expenseService.delete(selectedExpense.id)
      if (res.ok) {
        show({ message: 'Pengeluaran berhasil dihapus', severity: 'success' })
        setOpenDeleteDialog(false)
        setSelectedExpense(null)
        fetchExpenses()
      } else {
        show({ message: `Gagal menghapus: ${res.error}`, severity: 'error' })
      }
    } catch (err) {
      show({ message: `Terjadi kesalahan: ${err.message}`, severity: 'error' })
    }
  }

  const handleAddCategory = async () => {
    const name = newCatName.trim()
    if (!name) return
    try {
      const res = await expenseService.categoryCreate({ nama: name })
      if (res.ok) {
        show({ message: 'Kategori berhasil ditambahkan', severity: 'success' })
        setNewCatName('')
        fetchCategories()
      } else {
        show({ message: `Gagal menambahkan kategori: ${res.error}`, severity: 'error' })
      }
    } catch (err) {
      show({ message: `Terjadi kesalahan: ${err.message}`, severity: 'error' })
    }
  }

  const handleDeleteCategory = async (id) => {
    try {
      const res = await expenseService.categoryDelete(id)
      if (res.ok) {
        show({ message: 'Kategori berhasil dihapus', severity: 'success' })
        fetchCategories()
      } else {
        show({ message: `Gagal menghapus kategori: ${res.error}`, severity: 'error' })
      }
    } catch (err) {
      show({ message: `Terjadi kesalahan: ${err.message}`, severity: 'error' })
    }
  }

  const addImages = useCallback(
    (files) => {
      const newImgs = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, 10 - images.length)
        .map((f) => ({
          id: `${f.name}_${Date.now()}_${Math.random()}`,
          url: URL.createObjectURL(f),
          file: f,
          name: f.name
        }))
      setImages((prev) => [...prev, ...newImgs])
    },
    [images.length]
  )

  const removeImage = useCallback((id) => {
    setImages((prev) => {
      const found = prev.find((i) => i.id === id)
      if (found?.file) URL.revokeObjectURL(found.url)
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    addImages(e.dataTransfer.files)
  }

  // Calculate totals
  const totalAmount = expenses.reduce((acc, curr) => acc + curr.jumlah, 0)

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val)
  }

  const cellSx = {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: 'text.secondary',
    fontSize: 13,
    fontFamily: 'Poppins, sans-serif',
    py: 1.25,
    px: 2
  }

  const headCellSx = {
    ...cellSx,
    bgcolor: isDark ? '#0c1018' : theme.palette.custom?.subtle || '#f5f7fa',
    color: 'text.disabled',
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap'
  }

  return (
    <PageLayout
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Pengeluaran' }]}
      title="Daftar Pengeluaran (Cost / Expenses)"
      actions={
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={handleOpenAdd}
          sx={{
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            bgcolor: 'primary.main',
            color: '#ffffff',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' }
          }}
        >
          Catat Pengeluaran
        </Button>
      }
    >
      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* Summary Card */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                background: isDark
                  ? `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${alpha(theme.palette.error.dark, 0.4)} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
                color: isDark ? 'text.primary' : '#fff',
                borderRadius: 3
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <TrendingDownRounded sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
                    Total Pengeluaran (Filtered)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatRupiah(totalAmount)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters Card */}
        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
            bgcolor: 'background.paper'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* Cari Keterangan / Kasir filter and date filters */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Cari Keterangan / Kasir"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <DatePicker
                fullWidth
                size="small"
                label="Dari Tanggal"
                value={startDate}
                onChange={(val) => setStartDate(val)}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <DatePicker
                fullWidth
                size="small"
                label="Sampai Tanggal"
                value={endDate}
                onChange={(val) => setEndDate(val)}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={handleResetFilters}
                startIcon={<ClearRounded />}
                sx={{
                  textTransform: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 2
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Expenses List Table */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx} width={60}>
                  No
                </TableCell>
                <TableCell sx={headCellSx} width={180}>
                  Tanggal / Waktu
                </TableCell>
                <TableCell sx={headCellSx} width={150}>
                  Kategori
                </TableCell>
                <TableCell sx={headCellSx} width={180}>
                  Jumlah
                </TableCell>
                <TableCell sx={headCellSx}>Keterangan</TableCell>
                <TableCell sx={headCellSx} width={120}>
                  Lampiran
                </TableCell>
                <TableCell sx={headCellSx} width={150}>
                  Kasir
                </TableCell>
                <TableCell sx={headCellSx} width={80} align="center">
                  Aksi
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8} sx={{ py: 3, textAlign: 'center' }}>
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ))
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6, textAlign: 'center' }}>
                    <ReceiptLongOutlined sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Tidak ada data pengeluaran yang ditemukan.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((row, idx) => {
                  const imgs = imageService.parseImages(row.images)
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell sx={cellSx}>{idx + 1}</TableCell>
                      <TableCell sx={cellSx}>{row.created_at}</TableCell>
                      <TableCell sx={cellSx} style={{ textTransform: 'capitalize' }}>
                        {row.kategori}
                      </TableCell>
                      <TableCell
                        sx={cellSx}
                        style={{ fontWeight: 600, color: theme.palette.error.main }}
                      >
                        {formatRupiah(row.jumlah)}
                      </TableCell>
                      <TableCell sx={cellSx}>{row.keterangan || '-'}</TableCell>
                      <TableCell sx={cellSx}>
                        {imgs.length > 0 ? (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {imgs.slice(0, 3).map((img, i) => (
                              <Box
                                key={i}
                                component="img"
                                src={img.url}
                                alt="receipt"
                                onClick={() => setLightboxImage(img.url)}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 1,
                                  objectFit: 'cover',
                                  cursor: 'pointer',
                                  border: `1px solid ${theme.palette.divider}`,
                                  '&:hover': { opacity: 0.8 }
                                }}
                              />
                            ))}
                            {imgs.length > 3 && (
                              <Typography variant="caption" sx={{ alignSelf: 'center', ml: 0.5 }}>
                                +{imgs.length - 3}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell sx={cellSx}>{row.kasir || '-'}</TableCell>
                      <TableCell sx={cellSx} align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDelete(row)}
                        >
                          <DeleteOutlineRounded fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add Expense Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Catat Pengeluaran Baru</DialogTitle>
        <DialogContent dividers sx={{ display: 'grid', gap: 2.5, pt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Kategori Pengeluaran</InputLabel>
              <Select
                value={formCategory}
                label="Kategori Pengeluaran"
                onChange={(e) => setFormCategory(e.target.value)}
              >
                {allCategories.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.nama}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              onClick={() => setOpenManageCatDialog(true)}
              color="primary"
              sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}
            >
              <SettingsRounded />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            size="small"
            label="Jumlah Pengeluaran (Rp)"
            type="text"
            value={formJumlah}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '')
              setFormJumlah(val ? Number(val).toLocaleString('id-ID') : '')
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start">Rp</InputAdornment>
            }}
          />
          <TextField
            fullWidth
            size="small"
            label="Keterangan / Detail"
            multiline
            rows={3}
            value={formKeterangan}
            onChange={(e) => setFormKeterangan(e.target.value)}
            placeholder="Contoh: Beli minyak goreng 5 liter, Bayar listrik bulanan"
          />

          {/* Image Uploader Section */}
          <Box>
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, mb: 1, fontFamily: 'Poppins, sans-serif' }}
            >
              Lampiran Bukti Nota / Kwitansi ({images.length}/10)
            </Typography>
            <Box
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => images.length < 10 && fileInputRef.current?.click()}
              sx={{
                border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: dragOver
                  ? alpha(theme.palette.primary.main, 0.06)
                  : isDark
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(0,0,0,0.01)',
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                cursor: images.length < 10 ? 'pointer' : 'default',
                transition: 'all 0.15s',
                '&:hover':
                  images.length < 10
                    ? {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                      }
                    : {}
              }}
            >
              <AddPhotoAlternateRounded
                sx={{
                  fontSize: 32,
                  color: dragOver ? theme.palette.primary.main : 'text.disabled',
                  transition: 'color 0.15s'
                }}
              />

              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 12,
                  fontFamily: 'Poppins, sans-serif',
                  textAlign: 'center',
                  lineHeight: 1.5
                }}
              >
                {images.length >= 10
                  ? 'Batas maksimal 10 foto tercapai'
                  : dragOver
                    ? 'Lepaskan gambar di sini'
                    : 'Seret dan lepas gambar ke sini'}
              </Typography>

              {images.length < 10 && (
                <Typography
                  sx={{
                    color: 'text.disabled',
                    fontSize: 11,
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  atau klik untuk memilih berkas
                </Typography>
              )}
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                addImages(e.target.files)
                e.target.value = ''
              }}
            />

            {images.length > 0 && (
              <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                {images.map((img) => (
                  <Tooltip key={img.id} title={img.name} placement="top">
                    <Box
                      sx={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover .del-btn': { opacity: 1 }
                      }}
                    >
                      <Box
                        component="img"
                        src={img.url}
                        alt={img.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      <Box
                        className="del-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(img.id)
                        }}
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(0,0,0,0.52)',
                          opacity: 0,
                          transition: 'opacity 0.15s',
                          cursor: 'pointer'
                        }}
                      >
                        <DeleteRounded sx={{ fontSize: 18, color: '#fff' }} />
                      </Box>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpenAddDialog(false)} variant="outlined" color="inherit">
            Batal
          </Button>
          <Button onClick={handleSaveExpense} variant="contained" color="primary">
            Simpan Pengeluaran
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog
        open={openManageCatDialog}
        onClose={() => setOpenManageCatDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>
          Kelola Kategori Pengeluaran
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Nama Kategori Baru"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleAddCategory}
              startIcon={<AddRounded />}
              sx={{ textTransform: 'none', px: 2 }}
            >
              Tambah
            </Button>
          </Box>
          <Paper variant="outlined" sx={{ maxHeight: 250, overflowY: 'auto' }}>
            {customCategories.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ p: 2, textColor: 'text.secondary', textAlign: 'center' }}
              >
                Tidak ada kategori kustom.
              </Typography>
            ) : (
              <List size="small" disablePadding>
                {customCategories.map((c) => (
                  <ListItem
                    key={c.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        color="error"
                        onClick={() => handleDeleteCategory(c.id)}
                      >
                        <DeleteOutlineRounded fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={c.nama}
                      primaryTypographyProps={{
                        style: { fontSize: 13, textTransform: 'capitalize' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenManageCatDialog(false)} variant="contained">
            Selesai
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Hapus Pengeluaran</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Apakah Anda yakin ingin menghapus catatan pengeluaran sebesar{' '}
            <strong>{selectedExpense ? formatRupiah(selectedExpense.jumlah) : ''}</strong> untuk (
            {selectedExpense?.keterangan || selectedExpense?.kategori})? Tindakan ini tidak dapat
            dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined" color="inherit">
            Batal
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Ya, Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lightbox / Image Preview Dialog */}
      <Dialog open={!!lightboxImage} onClose={() => setLightboxImage(null)} maxWidth="md">
        <Box
          sx={{
            position: 'relative',
            bgcolor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <IconButton
            onClick={() => setLightboxImage(null)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#fff',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <CloseRounded />
          </IconButton>
          <Box
            component="img"
            src={lightboxImage}
            alt="Preview"
            sx={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain'
            }}
          />
        </Box>
      </Dialog>
    </PageLayout>
  )
}
