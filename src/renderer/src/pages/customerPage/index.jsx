import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
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
  Divider,
  Tabs,
  Tab
} from '@mui/material'
import {
  AddRounded,
  SearchRounded,
  EditRounded,
  DeleteOutlineRounded,
  TrendingUpRounded,
  PaymentsRounded,
  ContactPhoneRounded,
  ClearRounded,
  HistoryRounded,
  ReceiptLongOutlined
} from '@mui/icons-material'
import { PageLayout } from '../productPage/components/PageLayout'
import { customerService } from '../../services/customerService'
import { transactionService } from '../../services/transactionService'
import { useAuth } from '../../context/authContext'
import { useNotifier } from '../../components/core/notificationProvider'

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

export const CustomerPage = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const { show } = useNotifier()
  const isDark = theme.palette.mode === 'dark'

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Selected Customer detail state
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [activeTab, setActiveTab] = useState(0) // 0: Piutang aktif, 1: Riwayat pembayaran
  const [customerTransactions, setCustomerTransactions] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])

  // Dialogs State
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  // Form states
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formNama, setFormNama] = useState('')
  const [formTelepon, setFormTelepon] = useState('')
  const [formAlamat, setFormAlamat] = useState('')

  // Payment form states
  const [formJumlahBayar, setFormJumlahBayar] = useState('')
  const [formMetodeBayar, setFormMetodeBayar] = useState('tunai')
  const [formKeterangan, setFormKeterangan] = useState('')

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await customerService.getAll()
      if (res.ok) {
        setCustomers(res.data || [])
      } else {
        show({ message: res.error || 'Gagal memuat pelanggan', severity: 'error' })
      }
    } catch (err) {
      show({ message: err.message || 'Gagal memuat pelanggan', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const fetchCustomerDetails = useCallback(async (customerId) => {
    try {
      // 1. Get transactions under name with status = 'piutang'
      const trxRes = await transactionService.getAll({
        customer_id: customerId,
        status: 'piutang',
        limit: 200
      })
      if (trxRes.ok) {
        setCustomerTransactions(trxRes.data.rows || [])
      }

      // 2. Get payment/installment history
      const payRes = await customerService.debtPaymentGetHistory(customerId)
      if (payRes.ok) {
        setPaymentHistory(payRes.data || [])
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerDetails(selectedCustomer.id)
    }
  }, [selectedCustomer, fetchCustomerDetails])

  const handleOpenAdd = () => {
    setEditingCustomer(null)
    setFormNama('')
    setFormTelepon('')
    setFormAlamat('')
    setOpenFormDialog(true)
  }

  const handleOpenEdit = (c) => {
    setEditingCustomer(c)
    setFormNama(c.nama)
    setFormTelepon(c.telepon || '')
    setFormAlamat(c.alamat || '')
    setOpenFormDialog(true)
  }

  const handleSaveCustomer = async () => {
    if (!formNama.trim()) {
      show({ message: 'Nama pelanggan wajib diisi', severity: 'warning' })
      return
    }

    try {
      let res
      if (editingCustomer) {
        res = await customerService.update({
          id: editingCustomer.id,
          nama: formNama.trim(),
          telepon: formTelepon.trim(),
          alamat: formAlamat.trim()
        })
      } else {
        res = await customerService.create({
          nama: formNama.trim(),
          telepon: formTelepon.trim(),
          alamat: formAlamat.trim()
        })
      }

      if (res.ok) {
        show({
          message: editingCustomer
            ? 'Pelanggan berhasil diperbarui'
            : 'Pelanggan berhasil ditambahkan',
          severity: 'success'
        })
        setOpenFormDialog(false)
        fetchCustomers()
        if (selectedCustomer && selectedCustomer.id === res.data.id) {
          setSelectedCustomer(res.data)
        }
      } else {
        show({ message: res.error || 'Gagal menyimpan pelanggan', severity: 'error' })
      }
    } catch (err) {
      show({ message: err.message || 'Gagal menyimpan pelanggan', severity: 'error' })
    }
  }

  const handleConfirmDelete = (c) => {
    setEditingCustomer(c)
    setOpenDeleteDialog(true)
  }

  const handleDeleteCustomer = async () => {
    try {
      const res = await customerService.delete(editingCustomer.id)
      if (res.ok) {
        show({ message: 'Pelanggan berhasil dihapus', severity: 'success' })
        setOpenDeleteDialog(false)
        if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
          setSelectedCustomer(null)
        }
        fetchCustomers()
      } else {
        show({ message: res.error || 'Gagal menghapus pelanggan', severity: 'error' })
      }
    } catch (err) {
      show({ message: err.message || 'Gagal menghapus pelanggan', severity: 'error' })
    }
  }

  const handleOpenPayment = () => {
    if (!selectedCustomer) return
    setFormJumlahBayar('')
    setFormMetodeBayar('tunai')
    setFormKeterangan('')
    setOpenPaymentDialog(true)
  }

  const handleSavePayment = async () => {
    const amount = parseFloat(formJumlahBayar)
    if (isNaN(amount) || amount <= 0) {
      show({ message: 'Jumlah bayar harus lebih besar dari 0', severity: 'warning' })
      return
    }

    try {
      const res = await customerService.debtPaymentCreate({
        customerId: selectedCustomer.id,
        jumlahBayar: amount,
        metodeBayar: formMetodeBayar,
        keterangan: formKeterangan,
        kasir: user?.username || 'admin'
      })

      if (res.ok) {
        show({ message: 'Pembayaran hutang berhasil dicatat', severity: 'success' })
        setOpenPaymentDialog(false)

        // Refresh customer detail and customers list
        const updatedRes = await customerService.getAll()
        if (updatedRes.ok) {
          const list = updatedRes.data || []
          setCustomers(list)
          const found = list.find((c) => c.id === selectedCustomer.id)
          if (found) {
            setSelectedCustomer(found)
          }
        }
      } else {
        show({ message: res.error || 'Gagal menyimpan pembayaran', severity: 'error' })
      }
    } catch (err) {
      show({ message: err.message || 'Gagal menyimpan pembayaran', severity: 'error' })
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.nama.toLowerCase().includes(search.toLowerCase()) ||
      (c.telepon && c.telepon.includes(search))
  )

  const totalPiutangSemua = customers.reduce((sum, c) => sum + (c.total_hutang || 0), 0)

  return (
    <PageLayout
      title="Pelanggan & Kasbon (Piutang)"
      breadcrumbs={[{ label: 'Pelanggan' }]}
      actions={
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: 2 }}
        >
          Tambah Pelanggan
        </Button>
      }
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              background: isDark
                ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.4)} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
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
                <TrendingUpRounded sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
                  Total Piutang Berjalan
                </Typography> 
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatRupiah(totalPiutangSemua)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Cari pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <ClearRounded />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2, borderRadius: 3, height: '100%' }}>
            <TableContainer sx={{ maxHeight: '58vh' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nama</TableCell>
                    <TableCell align="right">Total Piutang</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Tidak ada data pelanggan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((c) => {
                      const isSelected = selectedCustomer?.id === c.id
                      return (
                        <TableRow
                          key={c.id}
                          hover
                          selected={isSelected}
                          onClick={() => setSelectedCustomer(c)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {c.nama}
                            </Typography>
                            {c.telepon && (
                              <Typography variant="caption" color="text.secondary">
                                {c.telepon}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 600,
                              color: c.total_hutang > 0 ? 'error.main' : 'success.main'
                            }}
                          >
                            {formatRupiah(c.total_hutang)}
                          </TableCell>
                          <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEdit(c)}
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleConfirmDelete(c)}
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
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          {selectedCustomer ? (
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedCustomer.nama}
                  </Typography>
                  {selectedCustomer.telepon && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 0.5,
                        color: 'text.secondary'
                      }}
                    >
                      <ContactPhoneRounded sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2">{selectedCustomer.telepon}</Typography>
                    </Box>
                  )}
                  {selectedCustomer.alamat && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Alamat: {selectedCustomer.alamat}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Kasbon Aktif
                  </Typography>
                  <Typography variant="h5" color="error.main" sx={{ fontWeight: 800 }}>
                    {formatRupiah(selectedCustomer.total_hutang)}
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PaymentsRounded />}
                    onClick={handleOpenPayment}
                    sx={{ mt: 1.5, borderRadius: 2 }}
                    disabled={selectedCustomer.total_hutang <= 0}
                  >
                    Bayar Hutang
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)}>
                  <Tab
                    icon={<ReceiptLongOutlined />}
                    iconPosition="start"
                    label="Transaksi Kasbon Aktif"
                  />
                  <Tab
                    icon={<HistoryRounded />}
                    iconPosition="start"
                    label="Riwayat Cicilan / Pembayaran"
                  />
                </Tabs>
              </Box>

              {activeTab === 0 ? (
                <TableContainer sx={{ maxHeight: '45vh' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>No. Transaksi</TableCell>
                        <TableCell>Tanggal</TableCell>
                        <TableCell align="right">Total Tagihan</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            align="center"
                            sx={{ py: 4, color: 'text.secondary' }}
                          >
                            Tidak ada transaksi piutang aktif
                          </TableCell>
                        </TableRow>
                      ) : (
                        customerTransactions.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell sx={{ fontWeight: 500 }}>{t.no_transaksi}</TableCell>
                            <TableCell>{t.created_at}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              {formatRupiah(t.total)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <TableContainer sx={{ maxHeight: '45vh' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tanggal</TableCell>
                        <TableCell>Metode</TableCell>
                        <TableCell>Keterangan</TableCell>
                        <TableCell>Kasir</TableCell>
                        <TableCell align="right">Jumlah Bayar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentHistory.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            align="center"
                            sx={{ py: 4, color: 'text.secondary' }}
                          >
                            Belum ada riwayat pembayaran
                          </TableCell>
                        </TableRow>
                      ) : (
                        paymentHistory.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{p.created_at}</TableCell>
                            <TableCell sx={{ textTransform: 'uppercase' }}>
                              {p.metode_bayar}
                            </TableCell>
                            <TableCell>{p.keterangan || '-'}</TableCell>
                            <TableCell>{p.kasir}</TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 600, color: 'success.main' }}
                            >
                              {formatRupiah(p.jumlah_bayar)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                height: '100%',
                minHeight: '400px',
                border: '2px dashed',
                borderColor: isDark ? 'grey.800' : 'grey.200',
                borderRadius: 3,
                p: 3,
                color: 'text.secondary'
              }}
            >
              <ReceiptLongOutlined sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1">
                Pilih pelanggan di sisi kiri untuk melihat detail piutang & riwayat pembayaran
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Customer Form Dialog (Add/Edit) */}
      <Dialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nama Pelanggan"
              size="small"
              fullWidth
              required
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
            />
            <TextField
              label="No. Telepon / WA"
              size="small"
              fullWidth
              value={formTelepon}
              onChange={(e) => setFormTelepon(e.target.value)}
            />
            <TextField
              label="Alamat"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={formAlamat}
              onChange={(e) => setFormAlamat(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenFormDialog(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleSaveCustomer} variant="contained">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment / Installment Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Catat Pembayaran Hutang</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: isDark ? 'grey.900' : 'grey.100', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Total Hutang Saat Ini
                </Typography>
                <Typography variant="h5" color="error.main" sx={{ fontWeight: 800 }}>
                  {formatRupiah(selectedCustomer.total_hutang)}
                </Typography>
              </Box>
              <TextField
                label="Jumlah Pembayaran (Rp)"
                size="small"
                fullWidth
                required
                type="number"
                value={formJumlahBayar}
                onChange={(e) => setFormJumlahBayar(e.target.value)}
              />
              <TextField
                select
                label="Metode Pembayaran"
                size="small"
                fullWidth
                value={formMetodeBayar}
                onChange={(e) => setFormMetodeBayar(e.target.value)}
              >
                <MenuItem value="tunai">Tunai</MenuItem>
                <MenuItem value="qris">QRIS</MenuItem>
                <MenuItem value="transfer">Transfer Bank</MenuItem>
              </TextField>
              <TextField
                label="Keterangan / Catatan"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={formKeterangan}
                onChange={(e) => setFormKeterangan(e.target.value)}
                placeholder="cth: cicilan ke-1, lunas dll."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPaymentDialog(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleSavePayment} variant="contained" color="success">
            Simpan Pembayaran
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Hapus Pelanggan?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Apakah Anda yakin ingin menghapus pelanggan <strong>{editingCustomer?.nama}</strong>?
            Seluruh data kasbon dan riwayat pembayaran pelanggan ini juga akan terhapus.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleDeleteCustomer} variant="contained" color="error">
            Ya, Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  )
}
