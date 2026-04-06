import { useMemo } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
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
  AssessmentOutlined,
  DownloadRounded,
  PictureAsPdfRounded,
  RestartAltRounded,
  SearchRounded,
  TableChartRounded
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { PageLayout } from '../../productPage/components/PageLayout'
import { useReport } from './hook/useReport'

const fmtRp = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(n || 0))

const fmtDate = (value) => {
  if (!value) return '-'
  const d = new Date(value)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const todayFileStamp = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}${mm}${dd}_${hh}${mi}`
}

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const SummaryCard = ({ label, value, accent = 'primary.main' }) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 2,
        bgcolor: theme.palette.background.paper,
        minHeight: 96
      }}
    >
      <Typography sx={{ color: 'text.disabled', fontSize: 11, fontFamily: 'Poppins, sans-serif' }}>
        {label}
      </Typography>
      <Typography
        sx={{
          color: accent,
          fontSize: 22,
          fontWeight: 800,
          fontFamily: 'Poppins, sans-serif',
          mt: 0.7,
          lineHeight: 1.15
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}

export const ListReportPage = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { t } = useTranslation()
  const {
    filters,
    updateFilter,
    resetFilters,
    page,
    setPage,
    totalPages,
    loading,
    error,
    summary,
    byMethod,
    daily,
    topProducts,
    rows,
    totalRows,
    getAllRowsForExport
  } = useReport()

  const methodLabel = useMemo(
    () => ({
      tunai: t('transaction.method_cash'),
      qris: t('transaction.method_qris'),
      kartu: t('transaction.method_card'),
      transfer: t('transaction.method_transfer')
    }),
    [t]
  )

  const exportExcel = async () => {
    const data = await getAllRowsForExport()

    const wb = XLSX.utils.book_new()

    const summarySheet = XLSX.utils.json_to_sheet([
      {
        Metric: t('report.summary_total_tx'),
        Value: data.summary?.total_transaksi || 0
      },
      {
        Metric: t('report.summary_completed_tx'),
        Value: data.summary?.transaksi_selesai || 0
      },
      {
        Metric: t('report.summary_void_tx'),
        Value: data.summary?.transaksi_batal || 0
      },
      {
        Metric: t('report.summary_gross_sales'),
        Value: data.summary?.subtotal_bruto || 0
      },
      {
        Metric: t('report.summary_total_discount'),
        Value: data.summary?.total_diskon || 0
      },
      {
        Metric: t('report.summary_net_sales'),
        Value: data.summary?.omzet_bersih || 0
      },
      {
        Metric: t('report.summary_avg_sales'),
        Value: Number(data.summary?.rata_rata_transaksi || 0).toFixed(0)
      }
    ])

    const txSheet = XLSX.utils.json_to_sheet(
      data.rows.map((r) => ({
        [t('transaction.col_no')]: r.no_transaksi,
        [t('transaction.col_time')]: fmtDate(r.created_at),
        [t('transaction.col_items')]: r.item_count,
        [t('transaction.col_total')]: r.total,
        [t('transaction.col_method')]: methodLabel[r.metode_bayar] || r.metode_bayar,
        [t('transaction.col_status')]:
          r.status === 'selesai' ? t('transaction.status_done') : t('transaction.status_void')
      }))
    )

    const methodSheet = XLSX.utils.json_to_sheet(
      data.byMethod.map((m) => ({
        [t('transaction.col_method')]: methodLabel[m.metode_bayar] || m.metode_bayar,
        [t('transaction.count_transactions', { count: '' }).trim() || 'Count']: m.jumlah,
        [t('transaction.col_total')]: m.total
      }))
    )

    const topSheet = XLSX.utils.json_to_sheet(
      data.topProducts.map((p) => ({
        [t('report.top_products_name')]: p.nama_produk,
        [t('report.top_products_qty')]: p.qty,
        [t('report.top_products_total')]: p.total
      }))
    )

    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')
    XLSX.utils.book_append_sheet(wb, txSheet, 'Transactions')
    XLSX.utils.book_append_sheet(wb, methodSheet, 'ByMethod')
    XLSX.utils.book_append_sheet(wb, topSheet, 'TopProducts')

    XLSX.writeFile(wb, `report_${todayFileStamp()}.xlsx`)
  }

  const exportPdf = async () => {
    const data = await getAllRowsForExport()
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

    doc.setFontSize(14)
    doc.text(t('report.page_title'), 40, 36)
    doc.setFontSize(10)
    doc.text(
      `${t('report.period')} : ${filters.startDate || '-'} - ${filters.endDate || '-'}`,
      40,
      54
    )

    autoTable(doc, {
      startY: 72,
      head: [[t('report.metric'), t('report.value')]],
      body: [
        [t('report.summary_total_tx'), data.summary?.total_transaksi || 0],
        [t('report.summary_completed_tx'), data.summary?.transaksi_selesai || 0],
        [t('report.summary_void_tx'), data.summary?.transaksi_batal || 0],
        [t('report.summary_gross_sales'), fmtRp(data.summary?.subtotal_bruto || 0)],
        [t('report.summary_total_discount'), fmtRp(data.summary?.total_diskon || 0)],
        [t('report.summary_net_sales'), fmtRp(data.summary?.omzet_bersih || 0)],
        [t('report.summary_avg_sales'), fmtRp(data.summary?.rata_rata_transaksi || 0)]
      ],
      styles: { fontSize: 9 }
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [
        [
          t('transaction.col_no'),
          t('transaction.col_time'),
          t('transaction.col_items'),
          t('transaction.col_total'),
          t('transaction.col_method'),
          t('transaction.col_status')
        ]
      ],
      body: data.rows.map((r) => [
        r.no_transaksi,
        fmtDate(r.created_at),
        r.item_count,
        fmtRp(r.total),
        methodLabel[r.metode_bayar] || r.metode_bayar,
        r.status === 'selesai' ? t('transaction.status_done') : t('transaction.status_void')
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [35, 65, 125] }
    })

    const blob = doc.output('blob')
    saveBlob(blob, `report_${todayFileStamp()}.pdf`)
  }

  return (
    <PageLayout
      breadcrumbs={[{ label: t('report.page_title') }]}
      title={t('report.page_title')}
      actions={
        <>
          <Button
            size="small"
            startIcon={<TableChartRounded sx={{ fontSize: 16 }} />}
            onClick={exportExcel}
            sx={{
              fontSize: 13,
              textTransform: 'none',
              borderRadius: 2,
              px: 1.5,
              bgcolor: isDark ? 'rgba(46,125,50,0.24)' : 'rgba(46,125,50,0.12)',
              color: 'success.main',
              '&:hover': { bgcolor: isDark ? 'rgba(46,125,50,0.34)' : 'rgba(46,125,50,0.2)' }
            }}
          >
            {t('report.export_excel')}
          </Button>
          <Button
            size="small"
            startIcon={<PictureAsPdfRounded sx={{ fontSize: 16 }} />}
            onClick={exportPdf}
            sx={{
              fontSize: 13,
              textTransform: 'none',
              borderRadius: 2,
              px: 1.5,
              bgcolor: isDark ? 'rgba(211,47,47,0.24)' : 'rgba(211,47,47,0.12)',
              color: 'error.main',
              '&:hover': { bgcolor: isDark ? 'rgba(211,47,47,0.34)' : 'rgba(211,47,47,0.2)' }
            }}
          >
            {t('report.export_pdf')}
          </Button>
        </>
      }
    >
      <Box
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(6, 1fr)' }, gap: 1.25 }}>
          <TextField
            size="small"
            type="date"
            label={t('report.start_date')}
            value={filters.startDate}
            onChange={(e) => updateFilter('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label={t('report.end_date')}
            value={filters.endDate}
            onChange={(e) => updateFilter('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Select
            size="small"
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">{t('report.all_status')}</MenuItem>
            <MenuItem value="selesai">{t('transaction.status_done')}</MenuItem>
            <MenuItem value="batal">{t('transaction.status_void')}</MenuItem>
          </Select>
          <Select
            size="small"
            value={filters.metode}
            onChange={(e) => updateFilter('metode', e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">{t('report.all_methods')}</MenuItem>
            <MenuItem value="tunai">{t('transaction.method_cash')}</MenuItem>
            <MenuItem value="qris">{t('transaction.method_qris')}</MenuItem>
            <MenuItem value="kartu">{t('transaction.method_card')}</MenuItem>
            <MenuItem value="transfer">{t('transaction.method_transfer')}</MenuItem>
          </Select>
          <TextField
            size="small"
            placeholder={t('report.search_placeholder')}
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ fontSize: 16, color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
          />
          <Button
            size="small"
            startIcon={<RestartAltRounded sx={{ fontSize: 16 }} />}
            onClick={resetFilters}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            {t('report.reset_filter')}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: 1.5,
          mb: 2.5
        }}
      >
        <SummaryCard
          label={t('report.summary_total_tx')}
          value={loading ? '...' : summary?.total_transaksi || 0}
          accent="text.primary"
        />
        <SummaryCard
          label={t('report.summary_net_sales')}
          value={loading ? '...' : fmtRp(summary?.omzet_bersih || 0)}
          accent="primary.main"
        />
        <SummaryCard
          label={t('report.summary_total_discount')}
          value={loading ? '...' : fmtRp(summary?.total_diskon || 0)}
          accent="error.main"
        />
        <SummaryCard
          label={t('report.summary_avg_sales')}
          value={loading ? '...' : fmtRp(summary?.rata_rata_transaksi || 0)}
          accent="warning.main"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr' }, gap: 1.5, mb: 2.5 }}>
        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            p: 2
          }}
        >
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.2, fontWeight: 700 }}>
            {t('report.breakdown_method')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(byMethod || []).map((m) => (
              <Chip
                key={m.metode_bayar}
                icon={<AssessmentOutlined sx={{ fontSize: 14 }} />}
                label={`${methodLabel[m.metode_bayar] || m.metode_bayar}: ${m.jumlah} • ${fmtRp(m.total)}`}
                sx={{ fontSize: 11 }}
              />
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            p: 2
          }}
        >
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.2, fontWeight: 700 }}>
            {t('report.trend_daily')}
          </Typography>
          {loading ? (
            <Skeleton variant="rounded" height={120} />
          ) : daily.length === 0 ? (
            <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>{t('report.no_data')}</Typography>
          ) : (
            daily.slice(-6).map((d) => (
              <Box key={d.tanggal} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{d.tanggal}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.primary', fontWeight: 600 }}>
                  {d.jumlah} • {fmtRp(d.total)}
                </Typography>
              </Box>
            ))
          )}
        </Box>

        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            p: 2
          }}
        >
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.2, fontWeight: 700 }}>
            {t('report.top_products')}
          </Typography>
          {loading ? (
            <Skeleton variant="rounded" height={120} />
          ) : topProducts.length === 0 ? (
            <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>{t('report.no_data')}</Typography>
          ) : (
            topProducts.slice(0, 5).map((p, idx) => (
              <Box key={`${p.nama_produk}_${idx}`} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  {idx + 1}. {p.nama_produk}
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.primary', fontWeight: 600 }}>
                  {p.qty} • {fmtRp(p.total)}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>

      <TableContainer
        sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {[t('transaction.col_no'), t('transaction.col_time'), t('transaction.col_items'), t('transaction.col_total'), t('transaction.col_method'), t('transaction.col_status')].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    bgcolor: isDark ? '#0f1420' : theme.palette.custom.elevation1,
                    color: 'text.disabled',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'Poppins, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" width="75%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 7 }}>
                  <Typography sx={{ color: 'text.secondary' }}>{t('report.no_data')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontSize: 12 }}>{r.no_transaksi}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{fmtDate(r.created_at)}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{r.item_count || 0}</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 700, color: 'primary.main' }}>
                    {fmtRp(r.total)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {methodLabel[r.metode_bayar] || r.metode_bayar}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        r.status === 'selesai' ? t('transaction.status_done') : t('transaction.status_void')
                      }
                      sx={{
                        fontSize: 11,
                        bgcolor:
                          r.status === 'selesai'
                            ? alpha(theme.palette.success.main, 0.16)
                            : alpha(theme.palette.error.main, 0.14),
                        color:
                          r.status === 'selesai' ? theme.palette.success.main : theme.palette.error.main,
                        border: `1px solid ${
                          r.status === 'selesai'
                            ? alpha(theme.palette.success.main, 0.35)
                            : alpha(theme.palette.error.main, 0.35)
                        }`
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {t('report.total_rows', { count: totalRows })}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            startIcon={<DownloadRounded sx={{ transform: 'rotate(180deg)' }} />}
            sx={{ textTransform: 'none' }}
          >
            {t('report.prev')}
          </Button>
          <Typography sx={{ fontSize: 12, minWidth: 90, textAlign: 'center', color: 'text.secondary' }}>
            {t('transaction.page_label')} {page + 1} / {totalPages}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            endIcon={<DownloadRounded />}
            sx={{ textTransform: 'none' }}
          >
            {t('report.next')}
          </Button>
        </Box>
      </Box>
    </PageLayout>
  )
}
