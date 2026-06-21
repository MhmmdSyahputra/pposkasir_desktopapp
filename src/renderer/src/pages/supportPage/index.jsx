import { Box, Typography, Button, Chip, useTheme } from '@mui/material'
import { useEffect, useState } from 'react'
import {
  FavoriteRounded,
  CoffeeRounded,
  StorageRounded,
  BoltRounded,
  CodeRounded,
  VolunteerActivismRounded,
  OpenInNewRounded,
  CheckCircleRounded
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { CONFIG } from '../../utils/config'
import { apiService } from '../../services/apiService'
import defaultQrisImg from '../../assets/images/QRIS.png'
import defaultSaweriaImg from '../../assets/images/saweria.png'

// ─── Benefit items ──────────────────────────────────────────────
const BENEFITS = [
  {
    icon: <StorageRounded sx={{ fontSize: 20 }} />,
    color: '#6c63ff',
    bg: 'rgba(108,99,255,0.12)',
    title: 'Server Stabil & Aman',
    desc: 'Menjaga kelangsungan server & integrasi database.'
  },
  {
    icon: <BoltRounded sx={{ fontSize: 20 }} />,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    title: 'Fitur Lebih Cepat',
    desc: 'Mempercepat perilisan fitur request dari pengguna.'
  },
  {
    icon: <CodeRounded sx={{ fontSize: 20 }} />,
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.12)',
    title: 'Perbaikan & Optimasi',
    desc: 'Mendukung perbaikan bug & optimasi performa kasir.'
  },
  {
    icon: <FavoriteRounded sx={{ fontSize: 20 }} />,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.12)',
    title: 'Gratis untuk Semua',
    desc: 'Membantu developer fokus mengembangkan P-POS Kasir gratis.'
  }
]

export const SupportPage = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const isDark = theme.palette.mode === 'dark'

  const [developerInfo, setDeveloperInfo] = useState({
    saweriaQr: defaultSaweriaImg,
    saweriaProfile: CONFIG.developer.saweria || 'https://saweria.co/MhmmdSyahputra',
    qrisUrl: defaultQrisImg,
    qrisAccountName: 'Putra Tech'
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await apiService.getConfig('P-Pos Kasir')
        if (res && res.status === 200 && res.result?.payload?.payment) {
          const payment = res.result.payload.payment
          setDeveloperInfo((prev) => ({
            ...prev,
            saweriaQr: payment.saweria_url || prev.saweriaQr,
            qrisUrl: payment.qris_url || prev.qrisUrl,
            qrisAccountName: payment.qris_account_name || prev.qrisAccountName
          }))
        }
      } catch (err) {
        console.error('Failed to fetch config:', err)
      }
    }
    fetchConfig()
  }, [])

  // Tokens
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const surface = isDark ? '#141820' : '#ffffff'
  const textSub = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
  const cardBg = isDark ? '#1a1f2e' : '#f8fafc'

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        background: isDark
          ? 'linear-gradient(160deg, #0e1218 0%, #111827 60%, #0e1218 100%)'
          : 'linear-gradient(160deg, #f0f4f8 0%, #e8edf3 100%)',
        '&::-webkit-scrollbar': { width: 5 },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: 99,
          bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box
        sx={{
          width: '100%',
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        {/* ══════════════════════════════════
            HERO
        ══════════════════════════════════ */}
        <Box
          sx={{
            borderRadius: 3,
            px: { xs: 3, md: 5 },
            py: { xs: 3, md: 4 },
            position: 'relative',
            overflow: 'hidden',
            background: isDark
              ? 'linear-gradient(135deg, #1a1f2e 0%, #141820 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%)',
            border: `1px solid ${border}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 3
          }}
        >
          {/* Glows */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: 80,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          {/* Coffee Icon */}
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: 3,
              flexShrink: 0,
              background:
                'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.08) 100%)',
              border: '1px solid rgba(251,191,36,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 28px rgba(251,191,36,0.12)'
            }}
          >
            <CoffeeRounded sx={{ fontSize: 46, color: '#fbbf24' }} />
          </Box>

          {/* Text */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Chip
              label="🧡 Terima kasih!"
              size="small"
              sx={{
                mb: 1.2,
                bgcolor: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.12)',
                color: '#f59e0b',
                fontWeight: 700,
                fontSize: 10,
                border: '1px solid rgba(251,191,36,0.2)',
                height: 22
              }}
            />
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                fontFamily: 'Poppins, sans-serif',
                lineHeight: 1.25,
                mb: 0.8,
                color: isDark ? '#f1f5f9' : '#1e293b'
              }}
            >
              Dukung Pengembangan{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(90deg, #fbbf24, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                P-POS Kasir
              </Box>
            </Typography>
            <Typography variant="body2" sx={{ color: textSub, lineHeight: 1.65, maxWidth: 540 }}>
              P-POS Kasir dikembangkan secara gratis untuk membantu UMKM berkembang lebih cepat
              dengan digitalisasi transaksi. Apresiasi Anda sangat berarti bagi keberlanjutan
              pemeliharaan server dan pengembangan fitur-fitur baru.
            </Typography>
          </Box>
        </Box>

        {/* ══════════════════════════════════
            MAIN 2-COLUMN
        ══════════════════════════════════ */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' },
            gap: 2.5,
            alignItems: 'start'
          }}
        >
          {/* ─── LEFT: QRIS CARD ─── */}
          <Box
            sx={{
              borderRadius: 3,
              border: `1px solid ${border}`,
              overflow: 'hidden',
              background: surface,
              boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.4)' : '0 16px 48px rgba(0,0,0,0.07)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* QRIS Header */}
            <Box
              sx={{
                background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
                px: 3,
                py: 1.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography
                  sx={{ color: '#fff', fontWeight: 900, fontSize: 18, letterSpacing: 2.5 }}
                >
                  QRIS
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: 8.5,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    mt: '-2px'
                  }}
                >
                  Nasional
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 9 }}>
                  GoPay • OVO • DANA • ShopeePay • LinkAja • M-Banking
                </Typography>
              </Box>
            </Box>

            {/* Body: vertical — QR top, info bottom */}
            <Box
              sx={{
                flex: 1,
                bgcolor: surface,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 3,
                gap: 2.5
              }}
            >
              {/* QR image — always white background so QR is scannable */}
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  border: `1.5px solid ${border}`,
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  p: 1.5,
                  bgcolor: '#ffffff',
                  boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.07)',
                  flexShrink: 0
                }}
              >
                <Box
                  component="img"
                  src={developerInfo.qrisUrl}
                  alt="QRIS"
                  sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </Box>

              {/* Merchant */}
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                  <Typography
                    sx={{ fontWeight: 900, fontSize: 16, color: isDark ? '#f1f5f9' : '#111' }}
                  >
                    {developerInfo.qrisAccountName}
                  </Typography>
                  <CheckCircleRounded sx={{ fontSize: 15, color: '#22c55e' }} />
                </Box>
                <Typography sx={{ fontSize: 10.5, color: textSub, display: 'block' }}>
                  Terverifikasi · P-POS Kasir
                </Typography>
              </Box>

              {/* Divider */}
              <Box sx={{ width: '100%', height: '1px', bgcolor: border }} />

              {/* Payment chips */}
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: textSub,
                    mb: 1,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase'
                  }}
                >
                  Metode Pembayaran
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, justifyContent: 'center' }}>
                  {['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja', 'M-Banking'].map((m) => (
                    <Box
                      key={m}
                      sx={{
                        px: 1.4,
                        py: 0.5,
                        borderRadius: 99,
                        border: `1px solid ${border}`,
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: isDark ? 'rgba(255,255,255,0.65)' : '#555'
                      }}
                    >
                      {m}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Quote */}
              <Box
                sx={{
                  width: '100%',
                  p: 2,
                  borderRadius: 2.5,
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(29,78,216,0.08) 100%)'
                    : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: isDark ? '1px solid rgba(37,99,235,0.2)' : '1px solid #bfdbfe',
                  textAlign: 'center'
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    color: isDark ? '#93c5fd' : '#1e40af',
                    lineHeight: 1.65,
                    fontStyle: 'italic'
                  }}
                >
                  "Setiap kontribusi Anda, seberapapun kecilnya, sangat berarti bagi keberlangsungan
                  P-POS Kasir."
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ─── RIGHT COLUMN ─── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Benefits */}
            <Box
              sx={{
                borderRadius: 3,
                border: `1px solid ${border}`,
                p: 2.5,
                background: surface,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.04)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.6 }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(251,191,36,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <VolunteerActivismRounded sx={{ fontSize: 15, color: '#fbbf24' }} />
                </Box>
                <Typography
                  fontWeight={700}
                  sx={{ color: isDark ? '#f1f5f9' : '#1e293b', fontSize: 15 }}
                >
                  Manfaat untuk Anda
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: textSub, mb: 2 }}>
                Dukungan Anda membuat P-POS Kasir semakin baik.
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {BENEFITS.map((b, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: `1px solid ${border}`,
                      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      transition: 'all 0.2s',
                      cursor: 'default',
                      '&:hover': {
                        border: `1px solid ${b.color}44`,
                        bgcolor: b.bg,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: b.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.2,
                        color: b.color
                      }}
                    >
                      {b.icon}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        mb: 0.5,
                        lineHeight: 1.3
                      }}
                    >
                      {b.title}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: textSub, lineHeight: 1.5 }}>
                      {b.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Saweria Card */}
            <Box
              sx={{
                borderRadius: 3,
                border: `1px solid ${border}`,
                p: 3,
                background: isDark
                  ? 'linear-gradient(135deg, #141820 0%, #172010 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Glow */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Header row */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  mb: 1.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background:
                        'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(16,185,129,0.1) 100%)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FavoriteRounded sx={{ color: '#22c55e', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography
                      fontWeight={700}
                      sx={{ color: isDark ? '#f1f5f9' : '#1e293b', fontSize: 14, lineHeight: 1.1 }}
                    >
                      Dukung via Saweria
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: textSub }}>
                      GoPay • OVO • Dana • LinkAja • QRIS
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Content: text left + QR right */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                {/* Text + Button */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13.5, color: textSub, lineHeight: 1.7, mb: 2.5 }}>
                    Anda dapat donasi langsung melalui halaman Saweria jika lebih nyaman menggunakan
                    browser atau perangkat lainnya.
                  </Typography>
                </Box>

                {/* Saweria QR */}
                <Box
                  sx={{
                    width: 140,
                    height: 140,
                    flexShrink: 0,
                    borderRadius: 2,
                    border: `1px solid ${border}`,
                    bgcolor: '#fff',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <Box
                    component="img"
                    src={developerInfo.saweriaQr}
                    alt="Saweria QR"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, height: '1px', bgcolor: border }} />
          <Typography sx={{ fontSize: 11, color: textSub, px: 2 }}>
            P-POS Kasir • Dibuat untuk UMKM Indonesia yang lebih berdaya
          </Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: border }} />
        </Box>
      </Box>
    </Box>
  )
}
