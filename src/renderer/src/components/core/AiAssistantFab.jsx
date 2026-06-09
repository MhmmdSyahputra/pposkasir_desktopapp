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
      const products = productsRes.ok ? (productsRes.data || []) : []
      const outOfStock = products.filter(p => p.stok <= 0)
      const lowStock = products.filter(p => p.stok > 0 && p.stok <= 5)
      
      const catRes = await categoryService.getAll({ limit: 100 })
      const categories = catRes.ok ? (catRes.data || []) : []
      
      const reportRes = await transactionService.getReport({
        startDate: todayStr,
        endDate: todayStr,
        status: 'all',
        limit: 10
      })
      const todaySummary = reportRes.ok && reportRes.data.summary 
         ? reportRes.data.summary 
         : { total_transaksi: 0, omzet_bersih: 0 }
      const topProducts = reportRes.ok ? (reportRes.data.topProducts || []) : []

      // Printer
      const printerSettings = receiptSettingsService.get()

      const routesMap = sidebarRoutes.map(r => {
        let str = `- Menu "${r.label}" (Path: ${r.path || 'Dropdown'})`
        if (r.children) {
          r.children.forEach(c => {
            str += `\n  * Sub-menu "${c.label}" (Path: ${c.path})`
          })
        }
        return str
      }).join('\n')

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
- Kategori Produk: ${categories.length} Kategori (${categories.slice(0, 8).map(c => c.nama).join(', ')})
- Total Produk di Sistem: ${products.length}
- Stok Kritis (Sisa <= 5): ${lowStock.length > 0 ? lowStock.slice(0,5).map(p => `${p.nama} sisa ${p.stok}`).join(', ') : 'Aman'}
- Produk Habis Stok: ${outOfStock.length} produk. ${outOfStock.length > 0 ? `(Habis: ${outOfStock.slice(0, 10).map(p => p.nama).join(', ')})` : ''}
- Penjualan Hari Ini (${todayStr}): ${todaySummary.total_transaksi} transaksi, Omzet Bersih: Rp ${Number(todaySummary.omzet_bersih).toLocaleString('id-ID')}
- 5 Produk Terlaris Hari Ini: ${topProducts.slice(0, 5).map(p => `${p.nama} (${p.qty} terjual)`).join(', ') || 'Belum ada data'}
Gunakan peta navigasi dan informasi terkini di atas untuk memberikan jawaban cerdas jika pengguna bertanya status toko, stok barang, printer, shift, promosi hari ini atau navigasi aplikasi.
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
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-start', borderTop: '1px solid rgba(128,128,128,0.2)', pt: 1 }}>
                          <Button
                            size="small"
                            sx={{ fontSize: 11, minWidth: 0, p: '2px 8px', textTransform: 'none', color: 'text.secondary' }}
                            onClick={() => { /* helpful action */ }}
                          >
                            👍 Helpful
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            sx={{ fontSize: 11, minWidth: 0, p: '2px 8px', textTransform: 'none', opacity: 0.8 }}
                            onClick={() => {
                              setReportedMessage(msg.content)
                              setReportDialogOpen(true)
                            }}
                          >
                            👎 Report Response
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
      <Dialog open={reportDialogOpen} onClose={() => !isReporting && setReportDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 600 }}>Report AI Response</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            Please select a reason for reporting this response:
          </Typography>
          <RadioGroup value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
            <FormControlLabel value="Offensive Content" control={<Radio size="small" />} label={<Typography variant="body2">Offensive Content</Typography>} />
            <FormControlLabel value="Harmful Information" control={<Radio size="small" />} label={<Typography variant="body2">Harmful Information</Typography>} />
            <FormControlLabel value="Incorrect Information" control={<Radio size="small" />} label={<Typography variant="body2">Incorrect Information</Typography>} />
            <FormControlLabel value="Other" control={<Radio size="small" />} label={<Typography variant="body2">Other</Typography>} />
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReportDialogOpen(false)} disabled={isReporting} sx={{ textTransform: 'none' }}>Cancel</Button>
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
