/* eslint-disable react/prop-types */
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme
} from '@mui/material'
import {
  CloseRounded,
  ReceiptLongOutlined,
  SearchRounded,
  WarningAmberRounded
} from '@mui/icons-material'
import { PageLayout } from '../../productPage/components/PageLayout'
import { useTranslation } from 'react-i18next'
import { useListTransaction } from './hook/useListTransaction'

// ── helpers ──────────────────────────────────────────────────────────────────
const fmtRp = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(n ?? 0)

const fmtDate = (str) => {
  if (!str) return '—'
  const d = new Date(str)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fmtDateInput = (str) => {
  if (!str) return ''
  // convert "YYYY-MM-DD" -> "DD/MM/YYYY" for display in native date input
  return str
}

// ── StatsCard ─────────────────────────────────────────────────────────────────
const StatsCard = ({ label, value, sub }) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        flex: 1,
        p: 2,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 10,
          color: 'text.disabled',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          mb: 0.5
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 20,
          fontWeight: 800,
          color: 'text.primary',
          lineHeight: 1.2
        }}
      >
        {value}
      </Typography>
      {sub && (
        <Typography
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 10,
            color: 'text.disabled',
            mt: 0.3
          }}
        >
          {sub}
        </Typography>
      )}
    </Box>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
const EmptyState = ({ colSpan }) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const cellSx = {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: 'text.secondary',
    fontSize: 13,
    fontFamily: 'Poppins, sans-serif',
    py: 1.25,
    px: 2
  }
  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ ...cellSx, py: 8, textAlign: 'center', borderBottom: 0 }}>
        <ReceiptLongOutlined
          sx={{ fontSize: 44, color: 'text.disabled', display: 'block', mx: 'auto', mb: 1.5 }}
        />
        <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
          {t('transaction.empty_title')}
        </Typography>
        <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 0.5 }}>
          {t('transaction.empty_hint')}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

// ── DetailDialog ──────────────────────────────────────────────────────────────
const DetailDialog = ({ detail, onClose, onVoid }) => {
  const theme = useTheme()
  const { t } = useTranslation()
  if (!detail) return null

  const metodeLabel = {
    tunai: t('transaction.method_cash'),
    qris: 'QRIS',
    kartu: t('transaction.method_card'),
    transfer: t('transaction.method_transfer')
  }
  const isSelesai = detail.status === 'selesai'

  const cellSx = {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: 'text.secondary',
    fontSize: 12,
    fontFamily: 'Poppins, sans-serif',
    py: 1,
    px: 1.5
  }

  return (
    <Dialog
      open={!!detail}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
          backgroundImage: 'none',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3
        }
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                color: 'text.primary'
              }}
            >
              {detail.no_transaksi}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 11,
                color: 'text.disabled',
                mt: 0.3
              }}
            >
              {fmtDate(detail.created_at)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={isSelesai ? t('transaction.status_done') : t('transaction.status_void')}
              size="small"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                bgcolor: isSelesai
                  ? alpha(theme.palette.success.main, 0.15)
                  : alpha(theme.palette.error.main, 0.15),
                color: isSelesai ? theme.palette.success.main : theme.palette.error.main,
                border: `1px solid ${isSelesai ? alpha(theme.palette.success.main, 0.4) : alpha(theme.palette.error.main, 0.4)}`
              }}
            />
            <IconButton size="small" onClick={onClose} sx={{ color: 'text.disabled' }}>
              <CloseRounded fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Items table */}
        <TableContainer
          sx={{
            mb: 2,
            borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            maxHeight: 240
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  t('transaction.col_product'),
                  t('transaction.col_qty'),
                  t('transaction.col_price'),
                  t('transaction.subtotal')
                ].map((h, idx) => (
                  <TableCell
                    key={h}
                    align={idx === 0 ? 'left' : 'right'}
                    sx={{
                      ...cellSx,
                      bgcolor: theme.palette.custom.elevation1,
                      color: 'text.disabled',
                      fontSize: 10,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase'
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(detail.items || []).map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={cellSx}>
                    <Typography
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: 12,
                        color: 'text.primary'
                      }}
                    >
                      {item.nama_produk}
                    </Typography>
                    {item.modifier_summary && (
                      <Typography
                        sx={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 10,
                          color: 'text.disabled'
                        }}
                      >
                        {item.modifier_summary}
                      </Typography>
                    )}
                    {item.catatan && (
                      <Typography
                        sx={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 10,
                          color: alpha('#ffc107', 0.7),
                          fontStyle: 'italic'
                        }}
                      >
                        📝 {item.catatan}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={cellSx}>
                    {item.qty}
                  </TableCell>
                  <TableCell align="right" sx={cellSx}>
                    {fmtRp(item.harga_satuan)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ ...cellSx, color: 'text.primary', fontWeight: 600 }}
                  >
                    {fmtRp(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ mb: 2 }} />

        {/* Totals */}
        <Box sx={{ mb: 2.5 }}>
          {detail.diskon > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
              <Typography
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 12,
                  color: 'text.secondary'
                }}
              >
                {t('transaction.subtotal')}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 12,
                  color: 'text.secondary'
                }}
              >
                {fmtRp(detail.subtotal)}
              </Typography>
            </Box>
          )}
          {detail.diskon > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
              <Typography
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 12,
                  color: 'text.secondary'
                }}
              >
                {t('transaction.discount')}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 12,
                  color: theme.palette.error.main
                }}
              >
                -{fmtRp(detail.diskon)}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                color: 'text.primary'
              }}
            >
              {t('transaction.total')}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 15,
                fontWeight: 800,
                color: theme.palette.primary.main
              }}
            >
              {fmtRp(detail.total)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 11,
                color: 'text.disabled'
              }}
            >
              {t('transaction.method_detail')}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 11,
                color: 'text.secondary'
              }}
            >
              {metodeLabel[detail.metode_bayar] ?? detail.metode_bayar}
            </Typography>
          </Box>
          {detail.metode_bayar === 'tunai' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                <Typography
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 11,
                    color: 'text.disabled'
                  }}
                >
                  {t('transaction.payment')}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 11,
                    color: 'text.secondary'
                  }}
                >
                  {fmtRp(detail.bayar)}
                </Typography>
              </Box>
              {detail.kembalian > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 11,
                      color: 'text.disabled'
                    }}
                  >
                    {t('transaction.change')}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 11,
                      fontWeight: 700,
                      color: theme.palette.success.main
                    }}
                  >
                    {fmtRp(detail.kembalian)}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Void button */}
        {isSelesai && (
          <Box
            onClick={() => onVoid(detail.id)}
            sx={{
              py: 1.3,
              borderRadius: 2,
              textAlign: 'center',
              border: `1px solid ${alpha(theme.palette.error.main, 0.4)}`,
              bgcolor: alpha(theme.palette.error.main, 0.08),
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              color: theme.palette.error.main,
              fontWeight: 700,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8,
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.15),
                borderColor: theme.palette.error.main
              },
              '&:active': { transform: 'scale(0.98)' },
              transition: 'all 0.15s'
            }}
          >
            <WarningAmberRounded sx={{ fontSize: 15 }} />
            {t('transaction.void_btn')}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export const ListTransactionPage = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const {
    rows,
    total,
    loading,
    stats,
    search,
    setSearch,
    tanggal,
    setTanggal,
    page,
    setPage,
    LIMIT,
    detail,
    openDetail,
    closeDetail,
    handleVoid
  } = useListTransaction()

  const COLUMNS = [
    { id: 'no_transaksi', label: t('transaction.col_no'), width: 190 },
    { id: 'waktu', label: t('transaction.col_time'), width: 170 },
    { id: 'items', label: t('transaction.col_items'), width: 70, align: 'center' },
    { id: 'total', label: t('transaction.col_total'), width: 150, align: 'right' },
    { id: 'metode', label: t('transaction.col_method'), width: 100, align: 'center' },
    { id: 'status', label: t('transaction.col_status'), width: 100, align: 'center' }
  ]

  const metodeLabel = {
    tunai: t('transaction.method_cash'),
    qris: 'QRIS',
    kartu: t('transaction.method_card'),
    transfer: t('transaction.method_transfer')
  }

  const headerCellSx = {
    borderBottom: `1px solid ${theme.palette.divider}`,
    bgcolor: theme.palette.custom.elevation1,
    color: 'text.disabled',
    fontSize: 10,
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    py: 1.25,
    px: 2
  }

  const cellSx = {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: 'text.secondary',
    fontSize: 12,
    fontFamily: 'Poppins, sans-serif',
    py: 1.25,
    px: 2
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <PageLayout
      breadcrumbs={[{ label: t('transaction.page_title') }]}
      title={t('transaction.page_title')}
    >
      {/* ── Stats Bar ────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StatsCard
          label={t('transaction.today_count')}
          value={stats.jumlah}
          sub={`${t('transaction.date_label')} ${tanggal}`}
        />
        <StatsCard
          label={t('transaction.today_revenue')}
          value={fmtRp(stats.omzet)}
          sub={
            stats.total_diskon > 0
              ? `${t('transaction.discount')} ${fmtRp(stats.total_diskon)}`
              : undefined
          }
        />
        <StatsCard
          label={t('transaction.table_total')}
          value={total}
          sub={t('transaction.rows_displayed')}
        />
      </Box>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <TextField
          size="small"
          placeholder={t('transaction.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ fontSize: 17, color: 'text.disabled' }} />
              </InputAdornment>
            )
          }}
          sx={{
            width: 260,
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.custom.inputBg,
              borderRadius: 2,
              '& fieldset': { borderColor: theme.palette.custom.inputBorder },
              '&:hover fieldset': { borderColor: theme.palette.custom.inputBorderHover },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
            },
            '& input': {
              color: 'text.primary',
              fontFamily: 'Poppins, sans-serif',
              fontSize: 13
            }
          }}
        />
        <TextField
          size="small"
          type="date"
          value={fmtDateInput(tanggal)}
          onChange={(e) => setTanggal(e.target.value)}
          sx={{
            width: 160,
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.custom.inputBg,
              borderRadius: 2,
              '& fieldset': { borderColor: theme.palette.custom.inputBorder },
              '&:hover fieldset': { borderColor: theme.palette.custom.inputBorderHover },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
            },
            '& input': {
              color: 'text.primary',
              fontFamily: 'Poppins, sans-serif',
              fontSize: 12,
              colorScheme: 'dark'
            }
          }}
        />
        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 11,
            color: 'text.disabled'
          }}
        >
          {t('transaction.count_transactions', { count: total })}
        </Typography>
      </Box>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <TableContainer
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align ?? 'left'}
                  width={col.width}
                  sx={headerCellSx}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.id} sx={cellSx}>
                      <Skeleton
                        variant="text"
                        width={col.width ? col.width - 16 : 120}
                        height={16}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <EmptyState colSpan={COLUMNS.length} />
            ) : (
              rows.map((row) => {
                const isSelesai = row.status === 'selesai'
                return (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => openDetail(row.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ ...cellSx, color: 'text.primary', fontWeight: 600 }}>
                      {row.no_transaksi}
                    </TableCell>
                    <TableCell sx={cellSx}>{fmtDate(row.created_at)}</TableCell>
                    <TableCell align="center" sx={cellSx}>
                      {row.item_count ?? 0}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ ...cellSx, color: theme.palette.primary.main, fontWeight: 700 }}
                    >
                      {fmtRp(row.total)}
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <Chip
                        label={metodeLabel[row.metode_bayar] ?? row.metode_bayar}
                        size="small"
                        sx={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 10,
                          height: 20,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.light,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <Chip
                        label={
                          isSelesai ? t('transaction.status_done') : t('transaction.status_void')
                        }
                        size="small"
                        sx={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 10,
                          height: 20,
                          bgcolor: isSelesai
                            ? alpha(theme.palette.success.main, 0.12)
                            : alpha(theme.palette.error.main, 0.12),
                          color: isSelesai ? theme.palette.success.main : theme.palette.error.main,
                          border: `1px solid ${isSelesai ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.error.main, 0.3)}`
                        }}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1,
            mt: 2
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 11,
              color: 'text.disabled'
            }}
          >
            {t('transaction.page_label')} {page + 1} / {totalPages}
          </Typography>
          {[...Array(Math.min(totalPages, 7))].map((_, i) => (
            <Box
              key={i}
              onClick={() => setPage(i)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 11,
                fontWeight: page === i ? 700 : 400,
                bgcolor:
                  page === i
                    ? alpha(theme.palette.primary.main, 0.2)
                    : theme.palette.custom.inputBg,
                color: page === i ? theme.palette.primary.main : 'text.secondary',
                border: `1px solid ${page === i ? alpha(theme.palette.primary.main, 0.4) : theme.palette.divider}`,
                '&:hover': { bgcolor: theme.palette.custom.elevation1 }
              }}
            >
              {i + 1}
            </Box>
          ))}
        </Box>
      )}

      {/* ── Detail Dialog ─────────────────────────────────────────────── */}
      <DetailDialog detail={detail} onClose={closeDetail} onVoid={handleVoid} />
    </PageLayout>
  )
}
