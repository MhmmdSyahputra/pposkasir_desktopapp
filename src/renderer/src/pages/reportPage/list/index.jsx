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
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
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
import { DatePicker } from '../../../components/ui/DatePicker'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

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
        Metric: t('report.summary_cogs'),
        Value: data.summary?.total_hpp || 0
      },
      {
        Metric: t('report.summary_gross_profit'),
        Value: data.summary?.laba_kotor || 0
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
        [t('report.summary_cogs'), fmtRp(data.summary?.total_hpp || 0)],
        [t('report.summary_gross_profit'), fmtRp(data.summary?.laba_kotor || 0)],
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(6, 1fr)' },
            gap: 1.25
          }}
        >
          <DatePicker
            label={t('report.start_date')}
            value={filters.startDate || ''}
            onChange={(val) => updateFilter('startDate', val)}
          />
          <DatePicker
            label={t('report.end_date')}
            value={filters.endDate || ''}
            onChange={(val) => updateFilter('endDate', val)}
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
          gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
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
          label={t('report.summary_gross_profit')}
          value={loading ? '...' : fmtRp(summary?.laba_kotor || 0)}
          accent="success.main"
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

      <Typography
        variant="h6"
        sx={{
          fontSize: 16,
          fontWeight: 800,
          mb: 1.5,
          fontFamily: 'Poppins, sans-serif',
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <AssessmentOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
        Statistik Visual
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1.5fr 1fr' },
          gap: 1.5,
          mb: 2.5,
          minHeight: 340
        }}
      >
        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.03)'
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              color: 'text.secondary',
              mb: 2,
              fontWeight: 700,
              fontFamily: 'Poppins'
            }}
          >
            {t('report.breakdown_method')}
          </Typography>
          <Box
            sx={{
              flex: 1,
              position: 'relative',
              minHeight: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {loading ? (
              <Skeleton variant="circular" width={180} height={180} />
            ) : byMethod.length === 0 ? (
              <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>
                {t('report.no_data')}
              </Typography>
            ) : (
              <Doughnut
                data={{
                  labels: byMethod.map((m) => methodLabel[m.metode_bayar] || m.metode_bayar),
                  datasets: [
                    {
                      data: byMethod.map((m) => m.total),
                      backgroundColor: [
                        theme.palette.primary.main,
                        theme.palette.success.main,
                        theme.palette.warning.main,
                        theme.palette.info.main,
                        theme.palette.error.main
                      ].map((c) => alpha(c, 0.75)),
                      hoverBackgroundColor: [
                        theme.palette.primary.main,
                        theme.palette.success.main,
                        theme.palette.warning.main,
                        theme.palette.info.main,
                        theme.palette.error.main
                      ],
                      borderColor: theme.palette.background.paper,
                      borderWidth: 2,
                      hoverOffset: 4
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15,
                        boxWidth: 8,
                        font: { size: 10, family: 'Poppins', weight: 500 },
                        color: theme.palette.text.secondary
                      }
                    },
                    tooltip: {
                      padding: 10,
                      backgroundColor: theme.palette.background.paper,
                      titleColor: theme.palette.text.primary,
                      bodyColor: theme.palette.text.secondary,
                      borderColor: theme.palette.divider,
                      borderWidth: 1,
                      callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${fmtRp(ctx.raw)}`
                      }
                    }
                  },
                  cutout: '70%'
                }}
              />
            )}
          </Box>
        </Box>

        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.03)'
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              color: 'text.secondary',
              mb: 2,
              fontWeight: 700,
              fontFamily: 'Poppins'
            }}
          >
            {t('report.trend_daily')}
          </Typography>
          <Box sx={{ flex: 1, position: 'relative', minHeight: 220 }}>
            {loading ? (
              <Skeleton variant="rounded" height="100%" />
            ) : daily.length === 0 ? (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>
                  {t('report.no_data')}
                </Typography>
              </Box>
            ) : (
              <Line
                data={{
                  labels: daily.map((d) => d.tanggal),
                  datasets: [
                    {
                      label: t('report.summary_net_sales'),
                      data: daily.map((d) => d.total),
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointBackgroundColor: theme.palette.primary.main,
                      pointBorderColor: theme.palette.background.paper,
                      pointBorderWidth: 2,
                      pointHoverRadius: 6,
                      pointHoverBackgroundColor: theme.palette.primary.main,
                      pointHoverBorderColor: theme.palette.background.paper,
                      pointHoverBorderWidth: 2
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: theme.palette.divider, drawBorder: false },
                      ticks: {
                        font: { size: 10, family: 'Poppins' },
                        color: theme.palette.text.disabled,
                        padding: 8,
                        callback: (val) =>
                          val >= 1000000
                            ? `${val / 1000000}jt`
                            : val >= 1000
                              ? `${val / 1000}rb`
                              : val
                      }
                    },
                    x: {
                      grid: { display: false },
                      ticks: {
                        font: { size: 10, family: 'Poppins' },
                        color: theme.palette.text.disabled,
                        padding: 8
                      }
                    }
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      padding: 10,
                      backgroundColor: theme.palette.background.paper,
                      titleColor: theme.palette.text.primary,
                      bodyColor: theme.palette.text.secondary,
                      borderColor: theme.palette.divider,
                      borderWidth: 1,
                      callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${fmtRp(ctx.raw)}`
                      }
                    }
                  }
                }}
              />
            )}
          </Box>
        </Box>

        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.03)'
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              color: 'text.secondary',
              mb: 2,
              fontWeight: 700,
              fontFamily: 'Poppins'
            }}
          >
            {t('report.top_products')}
          </Typography>
          <Box sx={{ flex: 1, position: 'relative', minHeight: 220 }}>
            {loading ? (
              <Skeleton variant="rounded" height="100%" />
            ) : topProducts.length === 0 ? (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>
                  {t('report.no_data')}
                </Typography>
              </Box>
            ) : (
              <Bar
                data={{
                  labels: topProducts.slice(0, 5).map((p) => p.nama_produk),
                  datasets: [
                    {
                      label: t('report.top_products_total'),
                      data: topProducts.slice(0, 5).map((p) => p.total),
                      backgroundColor: alpha(theme.palette.success.main, 0.7),
                      hoverBackgroundColor: theme.palette.success.main,
                      borderRadius: 6,
                      barThickness: 16
                    }
                  ]
                }}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: theme.palette.divider, drawBorder: false },
                      ticks: {
                        font: { size: 10, family: 'Poppins' },
                        color: theme.palette.text.disabled,
                        callback: (val) => (val >= 1000 ? `${val / 1000}rb` : val)
                      }
                    },
                    y: {
                      grid: { display: false },
                      ticks: {
                        font: { size: 10, family: 'Poppins', weight: 500 },
                        color: theme.palette.text.primary,
                        padding: 8,
                        callback: function (val) {
                          const label = this.getLabelForValue(val)
                          return label.length > 12 ? label.substr(0, 12) + '...' : label
                        }
                      }
                    }
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      padding: 10,
                      backgroundColor: theme.palette.background.paper,
                      titleColor: theme.palette.text.primary,
                      bodyColor: theme.palette.text.secondary,
                      borderColor: theme.palette.divider,
                      borderWidth: 1,
                      callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${fmtRp(ctx.raw)}`
                      }
                    }
                  }
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontSize: 16,
          fontWeight: 800,
          mb: 1.5,
          fontFamily: 'Poppins, sans-serif',
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <TableChartRounded sx={{ fontSize: 20, color: 'primary.main' }} />
        Rincian Transaksi
      </Typography>

      <TableContainer
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.03)'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {[
                t('transaction.col_no'),
                t('transaction.col_time'),
                t('transaction.col_items'),
                t('transaction.col_total'),
                t('transaction.col_method'),
                t('transaction.col_status')
              ].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    bgcolor: isDark
                      ? '#0f1420'
                      : theme.palette.custom?.elevation1 || alpha(theme.palette.primary.main, 0.05),
                    color: 'text.disabled',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'Poppins, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    py: 1.5
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
                <TableRow
                  key={r.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{r.no_transaksi}</TableCell>
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
                        r.status === 'selesai'
                          ? t('transaction.status_done')
                          : t('transaction.status_void')
                      }
                      sx={{
                        fontSize: 10,
                        fontWeight: 700,
                        height: 20,
                        bgcolor:
                          r.status === 'selesai'
                            ? alpha(theme.palette.success.main, 0.12)
                            : alpha(theme.palette.error.main, 0.1),
                        color:
                          r.status === 'selesai'
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                        border: `1px solid ${
                          r.status === 'selesai'
                            ? alpha(theme.palette.success.main, 0.25)
                            : alpha(theme.palette.error.main, 0.25)
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
        <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>
          {t('report.total_rows', { count: totalRows })}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            startIcon={<DownloadRounded sx={{ transform: 'rotate(180deg)', fontSize: 14 }} />}
            sx={{ textTransform: 'none', borderRadius: 2, fontSize: 12, px: 2 }}
          >
            {t('report.prev')}
          </Button>
          <Typography
            sx={{
              fontSize: 12,
              minWidth: 90,
              textAlign: 'center',
              color: 'text.secondary',
              fontWeight: 600
            }}
          >
            {t('transaction.page_label')} {page + 1} / {totalPages}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            endIcon={<DownloadRounded sx={{ fontSize: 14 }} />}
            sx={{ textTransform: 'none', borderRadius: 2, fontSize: 12, px: 2 }}
          >
            {t('report.next')}
          </Button>
        </Box>
      </Box>
    </PageLayout>
  )
}
