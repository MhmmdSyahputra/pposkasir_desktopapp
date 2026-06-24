import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Fab,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
  Paper,
  Slide,
  useTheme,
  Button,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material'
import { AutoAwesomeRounded, CloseRounded, SendRounded, SmartToyRounded } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { apiService } from '../../services/apiService'
import { sidebarRoutes } from '../../routes/sidebarRoutes'
import { useAuth } from '../../context/authContext'
import { receiptSettingsService } from '../../services/receiptSettingsService'
import { categoryService } from '../../services/categoryService'
import packageJson from '../../../../../package.json'
import { productService } from '../../services/productService'
import { transactionService } from '../../services/transactionService'

const SYSTEM_PROMPT = `Anda adalah Asisten AI cerdas khusus untuk Aplikasi Kasir (P-POS Kasir).
Tugas Anda HANYA membantu pengguna (kasir/admin) terkait fitur aplikasi kasir, laporan penjualan, manajemen produk, transaksi, dan hal yang berkaitan dengan sistem Point of Sales (POS) atau bisnis F&B/Retail.
ATURAN SANGAT KETAT:
1. Jika pengguna bertanya tentang topik di luar konteks POS/Bisnis (seperti cuaca, coding umum, politik, hiburan, dll), Anda WAJIB menolak menjawab dengan sopan dan mengingatkan bahwa Anda hanya asisten sistem kasir.
2. Gunakan bahasa Indonesia yang ramah, profesional, dan ringkas.
3. Gunakan markdown untuk memformat jawaban.`

const TEMPLATE_QUESTIONS = [
  'Bagaimana cara membatalkan transaksi?',
  'Apa fungsi pengaturan Shift Kasir?',
  'Bagaimana cara menambahkan Paket Bundle?',
  'Tolong buatkan draf pesan promo WhatsApp'
]

export const AiAssistantFab = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const { user, activeSession } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'assistant',
      content: 'Halo! Saya Asisten AI Kasir. Ada yang bisa saya bantu hari ini?'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Reporting states
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportedMessage, setReportedMessage] = useState(null)
  const [reportReason, setReportReason] = useState('')
  const [isReporting, setIsReporting] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100)
    }
  }, [messages, isOpen])

  const handleSend = async (text = inputText) => {
    if (!text.trim() || isLoading) return

    const userMsg = text.trim()
    setInputText('')

    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      // Fetch Real-time Context
      const todayStr = new Date().toISOString().slice(0, 10)
      const productsRes = await productService.getAll({ limit: 10000 })
      const products = productsRes.ok ? productsRes.data || [] : []
      const outOfStock = products.filter((p) => p.stok <= 0)
      const lowStock = products.filter((p) => p.stok > 0 && p.stok <= 5)

      const catRes = await categoryService.getAll({ limit: 100 })
      const categories = catRes.ok ? catRes.data || [] : []

      const reportRes = await transactionService.getReport({
        startDate: todayStr,
        endDate: todayStr,
        status: 'all',
        limit: 10
      })
      const todaySummary =
        reportRes.ok && reportRes.data.summary
          ? reportRes.data.summary
          : { total_transaksi: 0, omzet_bersih: 0, total_expenses: 0, laba_bersih: 0 }
      const topProducts = reportRes.ok ? reportRes.data.topProducts || [] : []

      // Fetch today's expenses
      let todayExpensesCount = 0
      try {
        if (window.api && window.api.expense) {
          const expRes = await window.api.expense.getAll({ startDate: todayStr, endDate: todayStr })
          if (expRes.ok) {
            todayExpensesCount = expRes.data.length
          }
        }
      } catch (e) {
        console.error(e)
      }

      // Printer
      const printerSettings = receiptSettingsService.get()

      const routesMap = sidebarRoutes
        .map((r) => {
          let str = `- Menu "${r.label}" (Path: ${r.path || 'Dropdown'})`
          if (r.children) {
            r.children.forEach((c) => {
              str += `\n  * Sub-menu "${c.label}" (Path: ${c.path})`
            })
          }
          return str
        })
        .join('\n')

      let reportContextStr = ''
      if (window.__currentReportContext) {
        const rc = window.__currentReportContext
        reportContextStr = `
[DATA LAPORAN YANG SEDANG DILIHAT USER SAAT INI]
- Periode Filter Laporan: ${rc.filters?.startDate || '-'} s/d ${rc.filters?.endDate || '-'}
- Filter Status: ${rc.filters?.status || 'all'}, Metode Bayar: ${rc.filters?.metode || 'all'}
- Ringkasan Laporan Periode Ini:
  * Total Transaksi: ${rc.summary?.total_transaksi || 0} (Selesai: ${rc.summary?.transaksi_selesai || 0}, Batal: ${rc.summary?.transaksi_batal || 0})
  * Omzet Bersih: Rp ${Number(rc.summary?.omzet_bersih || 0).toLocaleString('id-ID')}
  * Total HPP: Rp ${Number(rc.summary?.total_hpp || 0).toLocaleString('id-ID')}
  * Laba Kotor: Rp ${Number(rc.summary?.laba_kotor || 0).toLocaleString('id-ID')}
  * Total Biaya / Expense: Rp ${Number(rc.summary?.total_expenses || 0).toLocaleString('id-ID')}
  * Laba Bersih: Rp ${Number(rc.summary?.laba_bersih || 0).toLocaleString('id-ID')}
  * Rata-rata Nilai Transaksi: Rp ${Number(rc.summary?.rata_rata_transaksi || 0).toLocaleString('id-ID')}
- Breakdown Metode Pembayaran Periode Ini:
  ${(rc.byMethod || []).map((m) => `* ${m.metode_bayar}: ${m.jumlah} transaksi, Total Rp ${Number(m.total).toLocaleString('id-ID')}`).join('\n  ')}
- Produk Terlaris Periode Ini:
  ${(rc.topProducts || []).map((p) => `* ${p.nama_produk}: ${p.qty} pcs terjual, Total Penjualan Rp ${Number(p.total).toLocaleString('id-ID')}`).join('\n  ')}
`
      }

      let expenseReportContextStr = ''
      if (window.__currentExpenseReportContext) {
        const erc = window.__currentExpenseReportContext
        expenseReportContextStr = `
[DATA LAPORAN PENGELUARAN YANG SEDANG DILIHAT USER SAAT INI]
- Periode Filter: ${erc.filters?.startDate || '-'} s/d ${erc.filters?.endDate || '-'}, Kategori: ${erc.filters?.kategori || 'all'}
- Ringkasan Pengeluaran Periode Ini:
  * Total Pengeluaran: Rp ${Number(erc.summary?.total_pengeluaran || 0).toLocaleString('id-ID')}
  * Jumlah Transaksi Pengeluaran: ${erc.summary?.jumlah_transaksi || 0}
  * Rata-rata per Pengeluaran: Rp ${Number(erc.summary?.rata_rata_pengeluaran || 0).toLocaleString('id-ID')}
- Breakdown Kategori Pengeluaran:
  ${(erc.byCategory || []).map((c) => `* ${c.kategori}: ${c.jumlah} transaksi, Total Rp ${Number(c.total).toLocaleString('id-ID')}`).join('\n  ')}
`
      }

      let cartContextStr = ''
      if (window.__currentCartContext && window.__currentCartContext.length > 0) {
        const cart = window.__currentCartContext
        const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
        cartContextStr = `
[KERANJANG BELANJA YANG SEDANG AKTIF SAAT INI (KASIR)]
User sedang melayani pelanggan di kasir dengan isi keranjang belanja saat ini:
${cart.map((item, index) => `${index + 1}. ${item.name} - Qty: ${item.qty} x Rp ${Number(item.price).toLocaleString('id-ID')} (Subtotal: Rp ${Number(item.price * item.qty).toLocaleString('id-ID')})${item.summaryLabel ? ` | Varian: ${item.summaryLabel}` : ''}${item.note ? ` | Catatan: ${item.note}` : ''}`).join('\n')}
- Total Nilai Keranjang Belanja: Rp ${totalCartPrice.toLocaleString('id-ID')}
`
      }

      let txDetailContextStr = ''
      if (window.__currentTransactionDetailContext) {
        const tx = window.__currentTransactionDetailContext
        txDetailContextStr = `
[DETAIL TRANSAKSI YANG SEDANG DILIHAT USER SAAT INI]
User sedang membuka detail transaksi dengan rincian berikut:
- No. Transaksi: ${tx.no_transaksi}
- Status Transaksi: ${tx.status}
- Waktu Transaksi: ${tx.created_at}
- Kasir yang melayani: ${tx.kasir || '-'}
- Pelanggan: ${tx.nama_pelanggan || '-'}
- Cara Pembayaran: ${tx.metode_bayar}
- Ringkasan Pembayaran:
  * Subtotal: Rp ${Number(tx.subtotal || 0).toLocaleString('id-ID')}
  * Diskon: Rp ${Number(tx.diskon || 0).toLocaleString('id-ID')}
  * Pajak: Rp ${Number(tx.pajak || 0).toLocaleString('id-ID')}
  * Total Belanja: Rp ${Number(tx.total || 0).toLocaleString('id-ID')}
  * Uang Dibayar: Rp ${Number(tx.bayar || 0).toLocaleString('id-ID')}
  * Kembalian: Rp ${Number(tx.kembalian || 0).toLocaleString('id-ID')}
- Item yang Dibeli di Transaksi Ini:
  ${(tx.items || []).map((item, index) => `${index + 1}. ${item.nama_produk} - Qty: ${item.qty} x Rp ${Number(item.harga_satuan).toLocaleString('id-ID')} (HPP: Rp ${Number(item.harga_dasar).toLocaleString('id-ID')}, Subtotal: Rp ${Number(item.subtotal).toLocaleString('id-ID')})${item.modifier_summary ? ` | Varian: ${item.modifier_summary}` : ''}${item.catatan ? ` | Catatan: ${item.catatan}` : ''}`).join('\n  ')}
`
      }

      const dynamicContext = `
---
[PETA NAVIGASI APLIKASI KASIR]
Aplikasi memiliki struktur menu sidebar sebagai berikut:
${routesMap}
- Pengaturan (Path: /settings)

[INFO SISTEM TERKINI (Real-Time)]
- Versi Aplikasi: v${packageJson.version}
- Tema UI Aktif: ${isDark ? 'Dark Mode' : 'Light Mode'}
- User Login: ${user?.username || 'Tidak diketahui'} (Role: ${user?.role || '-'})
- Shift Kasir Aktif: ${activeSession ? `Ya (Modal Awal: Rp ${Number(activeSession.opening_cash).toLocaleString('id-ID')})` : 'Tidak ada sesi aktif'}
- Pengaturan Printer: Tipe ${printerSettings.printerType} (IP: ${printerSettings.printerIp || '-'})
- Kategori Produk: ${categories.length} Kategori (${categories
        .slice(0, 8)
        .map((c) => c.nama)
        .join(', ')})
- Total Produk di Sistem: ${products.length}
- Stok Kritis (Sisa <= 5): ${
        lowStock.length > 0
          ? lowStock
              .slice(0, 5)
              .map((p) => `${p.nama} sisa ${p.stok}`)
              .join(', ')
          : 'Aman'
      }
- Produk Habis Stok: ${outOfStock.length} produk. ${
        outOfStock.length > 0
          ? `(Habis: ${outOfStock
              .slice(0, 10)
              .map((p) => p.nama)
              .join(', ')})`
          : ''
      }
- Penjualan Hari Ini (${todayStr}): ${todaySummary.total_transaksi} transaksi, Omzet Bersih: Rp ${Number(todaySummary.omzet_bersih).toLocaleString('id-ID')}, Pengeluaran Hari Ini: Rp ${Number(todaySummary.total_expenses || 0).toLocaleString('id-ID')}, Laba Bersih: Rp ${Number(todaySummary.laba_bersih || 0).toLocaleString('id-ID')}
- Total Jumlah Transaksi Pengeluaran Hari Ini: ${todayExpensesCount} transaksi
- 5 Produk Terlaris Hari Ini: ${
        topProducts
          .slice(0, 5)
          .map((p) => `${p.nama} (${p.qty} terjual)`)
          .join(', ') || 'Belum ada data'
      }
${reportContextStr}
${expenseReportContextStr}
${cartContextStr}
${txDetailContextStr}
Gunakan peta navigasi dan informasi terkini di atas untuk memberikan jawaban cerdas jika pengguna bertanya status toko, stok barang, printer, shift, pengeluaran terbaru, laporan pengeluaran, laporan penjualan yang sedang dilihat, keranjang belanja kasir saat ini, detail riwayat transaksi yang sedang dibuka, promosi hari ini atau navigasi aplikasi.
---`

      // Replace the first message (system prompt) with the dynamically injected context
      const messagesToSend = [...newMessages]
      messagesToSend[0] = {
        role: 'system',
        content: SYSTEM_PROMPT + dynamicContext
      }

      const aiResponse = await apiService.askAssistant(messagesToSend)
      setMessages([...newMessages, { role: 'assistant', content: aiResponse }])
    } catch (error) {
      console.error(error)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Maaf, terjadi kesalahan jaringan atau konfigurasi API. Silakan coba lagi.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportSubmit = async () => {
    if (!reportReason) return
    setIsReporting(true)
    try {
      await apiService.reportAiResponse({
        message: reportedMessage,
        reason: reportReason,
        timestamp: new Date().toISOString()
      })
    } catch (e) {
      console.error('Failed to report AI response', e)
    } finally {
      setIsReporting(false)
      setReportDialogOpen(false)
      setReportedMessage(null)
      setReportReason('')
    }
  }

  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        <Fab
          color="secondary"
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            boxShadow: '0 8px 24px rgba(156, 39, 176, 0.4)',
            transition: 'transform 0.2s',
            transform: isOpen ? 'scale(0.8) rotate(90deg)' : 'scale(1)',
            opacity: isOpen ? 0 : 1,
            pointerEvents: isOpen ? 'none' : 'auto'
          }}
        >
          <AutoAwesomeRounded />
        </Fab>
      </Box>

      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 380,
            height: 550,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4,
            overflow: 'hidden',
            zIndex: 10000,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'secondary.main',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{ p: 0.8, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, display: 'flex' }}
              >
                <SmartToyRounded fontSize="small" />
              </Box>
              <Box>
                <Typography
                  sx={{ fontWeight: 700, fontSize: 15, fontFamily: 'Poppins, sans-serif' }}
                >
                  P-POS AI Assistant
                </Typography>
                <Typography sx={{ fontSize: 11, opacity: 0.8 }}>
                  Tanya seputar sistem & tips bisnis
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: '#fff' }}>
              <CloseRounded />
            </IconButton>
          </Box>

          {/* Chat Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages
              .filter((m) => m.role !== 'system')
              .map((msg, i) => {
                const isUser = msg.role === 'user'
                return (
                  <Box
                    key={i}
                    sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}
                  >
                    <Box
                      sx={{
                        maxWidth: '85%',
                        p: 1.5,
                        borderRadius: 3,
                        borderTopRightRadius: isUser ? 4 : 12,
                        borderTopLeftRadius: !isUser ? 4 : 12,
                        bgcolor: isUser
                          ? 'secondary.main'
                          : isDark
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.03)',
                        color: isUser ? '#fff' : 'text.primary',
                        fontSize: 13,
                        fontFamily: 'Poppins, sans-serif',
                        boxShadow: isUser ? '0 2px 8px rgba(156, 39, 176, 0.25)' : 'none'
                      }}
                    >
                      {isUser ? (
                        msg.content
                      ) : (
                        <Box
                          sx={{
                            '& p': { mt: 0, mb: 1 },
                            '& p:last-child': { mb: 0 },
                            '& ul, & ol': { mt: 0, mb: 1, pl: 2.5 },
                            '& li': { mb: 0.5 },
                            '& strong': { fontWeight: 700 }
                          }}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </Box>
                      )}

                      {/* Report Actions for AI Responses */}
                      {!isUser && i > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            mt: 1,
                            justifyContent: 'flex-start',
                            borderTop: '1px solid rgba(128,128,128,0.2)',
                            pt: 1
                          }}
                        >
                          <Button
                            size="small"
                            sx={{
                              fontSize: 11,
                              minWidth: 0,
                              p: '2px 8px',
                              textTransform: 'none',
                              color: 'text.secondary'
                            }}
                            onClick={() => {
                              /* helpful action */
                            }}
                          >
                            👍 Helpful
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            sx={{
                              fontSize: 11,
                              minWidth: 0,
                              p: '2px 8px',
                              textTransform: 'none',
                              opacity: 0.8
                            }}
                            onClick={() => {
                              setReportedMessage(msg.content)
                              setReportDialogOpen(true)
                            }}
                          >
                            ⚠️ Report Inappropriate Content
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )
              })}

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <CircularProgress size={14} color="secondary" />
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', fontFamily: 'Poppins' }}>
                    Mengetik...
                  </Typography>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Templates */}
          {messages.length <= 2 && (
            <Box sx={{ p: 2, pt: 0, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {TEMPLATE_QUESTIONS.map((q, i) => (
                <Button
                  key={i}
                  size="small"
                  onClick={() => handleSend(q)}
                  sx={{
                    fontSize: 11,
                    textTransform: 'none',
                    borderRadius: 8,
                    bgcolor: isDark ? 'rgba(156, 39, 176, 0.1)' : 'rgba(156, 39, 176, 0.05)',
                    color: 'secondary.main',
                    py: 0.5,
                    px: 1.5,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.15) }
                  }}
                >
                  {q}
                </Button>
              ))}
            </Box>
          )}

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.default
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tanya asisten AI..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: theme.palette.background.paper,
                    fontSize: 13,
                    fontFamily: 'Poppins'
                  }
                }}
              />
              <IconButton
                color="secondary"
                disabled={!inputText.trim() || isLoading}
                onClick={() => handleSend()}
                sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
              >
                <SendRounded fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => !isReporting && setReportDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 600 }}>
          Report Inappropriate AI Content
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            Please select a reason for reporting this AI response:
          </Typography>
          <RadioGroup value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
            <FormControlLabel
              value="Offensive Content"
              control={<Radio size="small" />}
              label={<Typography variant="body2">Offensive Content</Typography>}
            />
            <FormControlLabel
              value="Harmful Information"
              control={<Radio size="small" />}
              label={<Typography variant="body2">Harmful Information</Typography>}
            />
            <FormControlLabel
              value="Incorrect Information"
              control={<Radio size="small" />}
              label={<Typography variant="body2">Incorrect Information</Typography>}
            />
            <FormControlLabel
              value="Other"
              control={<Radio size="small" />}
              label={<Typography variant="body2">Other</Typography>}
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setReportDialogOpen(false)}
            disabled={isReporting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReportSubmit}
            variant="contained"
            color="secondary"
            disabled={!reportReason || isReporting}
            sx={{ textTransform: 'none' }}
          >
            {isReporting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
