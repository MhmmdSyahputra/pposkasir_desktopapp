/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
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
  useTheme,
  Dialog,
  IconButton,
  DialogTitle,
  DialogContent,
  CircularProgress,
  DialogActions
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
import { Line, Doughnut } from 'react-chartjs-2'
import {
  AssessmentOutlined,
  DownloadRounded,
  PictureAsPdfRounded,
  RestartAltRounded,
  SearchRounded,
  TableChartRounded,
  CloseRounded,
  AutoAwesomeRounded
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { PageLayout } from '../../productPage/components/PageLayout'
import { useExpenseReport } from './hook/useExpenseReport'
import { DatePicker } from '../../../components/ui/DatePicker'
import { expenseService } from '../../../services/expenseService'
import { imageService } from '../../../services/imageService'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { apiService } from '../../../services/apiService'

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

export const ListExpenseReportPage = () => {
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
    LIMIT,
    loading,
    error,
    summary,
    byCategory,
    daily,
    rows,
    totalRows,
    getAllRowsForExport
  } = useExpenseReport()

  const [customCategories, setCustomCategories] = useState([])
  const [lightboxImage, setLightboxImage] = useState(null)

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

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Sync current expense report context globally for AI assistant
  useEffect(() => {
    window.__currentExpenseReportContext = {
      filters,
      summary,
      byCategory,
      daily,
      rows,
      totalRows
    }
    return () => {
      delete window.__currentExpenseReportContext
    }
  }, [filters, summary, byCategory, daily, rows, totalRows])

  const DEFAULT_CATEGORIES = [
    { id: 'operasional', nama: 'Operasional' },
    { id: 'bahan baku', nama: 'Bahan Baku' },
    { id: 'sewa', nama: 'Sewa Tempat' },
    { id: 'gaji', nama: 'Gaji / Karyawan' },
    { id: 'lain-lain', nama: 'Lain-lain' }
  ]

  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.map((c) => ({ id: c.nama, nama: c.nama }))
  ]

  const [aiLoading, setAiLoading] = useState(false)
  const [aiInsight, setAiInsight] = useState(null)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)

  const generateAiInsight = async () => {
    setAiLoading(true)
    setAiDialogOpen(true)
    setAiInsight(null)

    try {
      const data = await getAllRowsForExport()

      const promptData = {
        periode: `${filters.startDate || 'Awal'} sampai ${filters.endDate || 'Akhir'}`,
        summary: data.summary,
        byCategory: data.byCategory,
        expensesSample: data.rows.slice(0, 15).map((r) => ({
          tanggal: r.created_at,
          kategori: r.kategori,
          jumlah: r.jumlah,
          keterangan: r.keterangan || ''
        }))
      }

      const promptContent = `Berikut adalah data laporan pengeluaran (expenses/cost) dari sistem POS (Point of Sales):
${JSON.stringify(promptData, null, 2)}

Tolong berikan ringkasan analisis keuangan pengeluaran yang profesional, evaluasi alokasi budget/kategori pengeluaran terbesar, dan berikan saran langkah efisiensi cost strategis untuk bisnis ini. Gunakan format yang rapi dengan poin-poin (bullet points). Gunakan Bahasa Indonesia.`

      const insight = await apiService.generateBusinessInsight(promptContent)
      setAiInsight(insight)
    } catch (e) {
      console.error(e)
      setAiInsight(
        'Terjadi kesalahan saat menghubungi AI. Pastikan konfigurasi API Token Anda sudah benar.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  const exportExcel = async () => {
    const data = await getAllRowsForExport()
    const wb = XLSX.utils.book_new()

    const summarySheet = XLSX.utils.json_to_sheet([
      {
        Metric: 'Total Pengeluaran',
        Value: data.summary?.total_pengeluaran || 0
      },
      {
        Metric: 'Jumlah Transaksi',
        Value: data.summary?.jumlah_transaksi || 0
      },
      {
        Metric: 'Rata-rata Pengeluaran',
        Value: Number(data.summary?.rata_rata_pengeluaran || 0).toFixed(0)
      }
    ])

    const txSheet = XLSX.utils.json_to_sheet(
      data.rows.map((r, index) => ({
        No: index + 1,
        Tanggal: fmtDate(r.created_at),
        Kategori: r.kategori,
        Jumlah: r.jumlah,
        Keterangan: r.keterangan || '',
        Kasir: r.kasir || ''
      }))
    )

    const catSheet = XLSX.utils.json_to_sheet(
      data.byCategory.map((c) => ({
        Kategori: c.kategori,
        'Jumlah Transaksi': c.jumlah,
        'Total Pengeluaran': c.total
      }))
    )

    XLSX.utils.book_append_sheet(wb, summarySheet, 'Ringkasan')
    XLSX.utils.book_append_sheet(wb, txSheet, 'Daftar Pengeluaran')
    XLSX.utils.book_append_sheet(wb, catSheet, 'Berdasarkan Kategori')

    XLSX.writeFile(wb, `laporan_pengeluaran_${todayFileStamp()}.xlsx`)
  }

  const exportPdf = async () => {
    const data = await getAllRowsForExport()
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

    doc.setFontSize(14)
    doc.text('Laporan Pengeluaran Toko', 40, 36)
    doc.setFontSize(10)
    doc.text(`Periode : ${filters.startDate || '-'} - ${filters.endDate || '-'}`, 40, 54)

    autoTable(doc, {
      startY: 72,
      head: [['Ringkasan', 'Nilai']],
      body: [
        ['Total Pengeluaran', fmtRp(data.summary?.total_pengeluaran || 0)],
        ['Jumlah Transaksi Pengeluaran', data.summary?.jumlah_transaksi || 0],
        ['Rata-rata Pengeluaran', fmtRp(data.summary?.rata_rata_pengeluaran || 0)]
      ],
      styles: { fontSize: 9 }
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [['No', 'Tanggal / Waktu', 'Kategori', 'Jumlah', 'Keterangan', 'Kasir']],
      body: data.rows.map((r, idx) => [
        idx + 1,
        fmtDate(r.created_at),
        r.kategori,
        fmtRp(r.jumlah),
        r.keterangan || '-',
        r.kasir || '-'
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [180, 40, 40] }
    })

    const blob = doc.output('blob')
    saveBlob(blob, `laporan_pengeluaran_${todayFileStamp()}.pdf`)
  }

  return (
    <PageLayout
      breadcrumbs={[{ label: 'Laporan', path: '/laporan/list' }, { label: 'Laporan Pengeluaran' }]}
      title="Laporan Pengeluaran"
      actions={
        <>
          <Button
            size="small"
            startIcon={<AutoAwesomeRounded sx={{ fontSize: 16 }} />}
            onClick={generateAiInsight}
            sx={{
              fontSize: 13,
              textTransform: 'none',
              borderRadius: 2,
              px: 1.5,
              bgcolor: isDark ? 'rgba(156,39,176,0.24)' : 'rgba(156,39,176,0.12)',
              color: 'secondary.main',
              '&:hover': { bgcolor: isDark ? 'rgba(156,39,176,0.34)' : 'rgba(156,39,176,0.2)' }
            }}
          >
            Magic Insight
          </Button>
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
            Ekspor Excel
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
            Ekspor PDF
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
            gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
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
            value={filters.kategori}
            onChange={(e) => updateFilter('kategori', e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">Semua Kategori</MenuItem>
            {allCategories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id} style={{ textTransform: 'capitalize' }}>
                {cat.nama}
              </MenuItem>
            ))}
          </Select>
          <TextField
            size="small"
            placeholder="Cari keterangan/kasir..."
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
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 1.5,
          mb: 2.5
        }}
      >
        <SummaryCard
          label="TOTAL PENGELUARAN"
          value={loading ? '...' : fmtRp(summary?.total_pengeluaran || 0)}
          accent="error.main"
        />
        <SummaryCard
          label="JUMLAH TRANSAKSI"
          value={loading ? '...' : summary?.jumlah_transaksi || 0}
          accent="text.primary"
        />
        <SummaryCard
          label="RATA-RATA PENGELUARAN"
          value={loading ? '...' : fmtRp(summary?.rata_rata_pengeluaran || 0)}
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
        Statistik Visual Pengeluaran
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1.5fr' },
          gap: 1.5,
          mb: 2.5,
          minHeight: 340
        }}
      >
        {/* Breakdown by Category */}
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
            Proporsi Berdasarkan Kategori
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
            ) : byCategory.length === 0 ? (
              <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>Tidak ada data</Typography>
            ) : (
              <Doughnut
                data={{
                  labels: byCategory.map((c) => c.kategori),
                  datasets: [
                    {
                      data: byCategory.map((c) => c.total),
                      backgroundColor: [
                        theme.palette.error.main,
                        theme.palette.warning.main,
                        theme.palette.primary.main,
                        theme.palette.success.main,
                        theme.palette.info.main
                      ].map((c) => alpha(c, 0.75)),
                      hoverBackgroundColor: [
                        theme.palette.error.main,
                        theme.palette.warning.main,
                        theme.palette.primary.main,
                        theme.palette.success.main,
                        theme.palette.info.main
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

        {/* Daily Trend */}
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
            Tren Pengeluaran Harian
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
                  Tidak ada data
                </Typography>
              </Box>
            ) : (
              <Line
                data={{
                  labels: daily.map((d) => d.tanggal),
                  datasets: [
                    {
                      label: 'Total Pengeluaran',
                      data: daily.map((d) => d.total),
                      borderColor: theme.palette.error.main,
                      backgroundColor: alpha(theme.palette.error.main, 0.08),
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointBackgroundColor: theme.palette.error.main,
                      pointBorderColor: theme.palette.background.paper,
                      pointBorderWidth: 2,
                      pointHoverRadius: 6,
                      pointHoverBackgroundColor: theme.palette.error.main,
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
        Rincian Transaksi Pengeluaran
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
                'No',
                'Tanggal / Waktu',
                'Kategori',
                'Jumlah',
                'Keterangan',
                'Lampiran',
                'Kasir'
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
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" width="75%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 7 }}>
                  <Typography sx={{ color: 'text.secondary' }}>Tidak ada data</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, idx) => {
                const imgs = imageService.parseImages(r.images)
                return (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>
                      {page * LIMIT + idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{fmtDate(r.created_at)}</TableCell>
                    <TableCell sx={{ fontSize: 12, textTransform: 'capitalize' }}>
                      {r.kategori}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 700, color: 'error.main' }}>
                      {fmtRp(r.jumlah)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{r.keterangan || '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
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
                    <TableCell sx={{ fontSize: 12 }}>{r.kasir || '-'}</TableCell>
                  </TableRow>
                )
              })
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

      {/* Lightbox Preview */}
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

      {/* AI Insight Dialog */}
      <Dialog
        open={aiDialogOpen}
        onClose={() => !aiLoading && setAiDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <AutoAwesomeRounded sx={{ color: 'secondary.main' }} />
          <Typography sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', fontSize: 18 }}>
            AI Business Insight (Expenses)
          </Typography>
          <IconButton
            size="small"
            onClick={() => setAiDialogOpen(false)}
            disabled={aiLoading}
            sx={{ ml: 'auto' }}
          >
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {aiLoading ? (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}
            >
              <CircularProgress color="secondary" />
              <Typography
                sx={{ fontSize: 13, color: 'text.secondary', fontFamily: 'Poppins, sans-serif' }}
              >
                Menganalisis data pengeluaran dan merumuskan efisiensi cost...
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                fontSize: 13.5,
                lineHeight: 1.7,
                fontFamily: 'Poppins, sans-serif',
                color: 'text.primary',
                '& p': { mb: 1.5 },
                '& ul, & ol': { pl: 2, mb: 1.5 },
                '& li': { mb: 0.5 }
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiInsight}</ReactMarkdown>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setAiDialogOpen(false)}
            disabled={aiLoading}
            variant="contained"
            color="secondary"
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  )
}
