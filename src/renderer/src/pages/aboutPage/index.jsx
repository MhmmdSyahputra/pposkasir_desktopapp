import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
  alpha,
  Grid,
  Divider
} from '@mui/material'
import {
  InfoOutlined,
  PointOfSaleRounded,
  DevicesRounded,
  WebRounded,
  SmartphoneRounded,
  CloudSyncRounded,
  SecurityRounded,
  AssessmentRounded,
  LockRounded,
  CheckCircleRounded,
  StorageRounded,
  SpeedRounded
} from '@mui/icons-material'
import { PageLayout } from '../productPage/components/PageLayout'

const ComingSoonCard = ({ icon, title, desc, badge }) => {
  const theme = useTheme()

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        position: 'relative',
        overflow: 'hidden',
        opacity: 0.75,
        transition: 'all 0.2s',
        '&:hover': { opacity: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2
        }}
      >
        <Chip
          icon={<LockRounded sx={{ fontSize: 12 }} />}
          label={badge || 'Coming Soon'}
          size="small"
          sx={{
            fontSize: 10,
            fontWeight: 700,
            bgcolor: alpha(theme.palette.warning.main, 0.12),
            color: theme.palette.warning.main,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            height: 22
          }}
        />
      </Box>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            color: theme.palette.primary.main
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 0.5 }}>{title}</Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.6 }}>
          {desc}
        </Typography>
      </CardContent>
    </Card>
  )
}

export const AboutPage = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [appVersion, setAppVersion] = useState('-')

  useEffect(() => {
    const loadVersion = async () => {
      try {
        const version = await window.api.getAppVersion()
        setAppVersion(version || '-')
      } catch {
        setAppVersion('-')
      }
    }
    loadVersion()
  }, [])

  const FEATURES = [
    {
      icon: <PointOfSaleRounded />,
      title: 'Point of Sales (POS)',
      desc: 'Checkout cepat dengan dukungan barcode, scanner kamera, dan manajemen keranjang belanja real-time.'
    },
    {
      icon: <StorageRounded />,
      title: 'Offline SQLite Database',
      desc: '100% offline-first. Semua data transaksi tersimpan lokal tanpa perlu koneksi internet.'
    },
    {
      icon: <AssessmentRounded />,
      title: 'Laporan Keuangan',
      desc: 'Laporan penjualan, laba kotor, laba bersih, pengeluaran, dan analisis keuangan lengkap.'
    },
    {
      icon: <SecurityRounded />,
      title: 'Manajemen Stok & Produk',
      desc: 'CRUD produk, kategori, satuan, modifier, bundle, kontrol stok, dan barcode.'
    },
    {
      icon: <AssessmentRounded />,
      title: 'Piutang / Kasbon',
      desc: 'Catat transaksi hutang pelanggan, cicilan, dan otomatis lunasi ketika dibayar penuh.'
    },
    {
      icon: <SpeedRounded />,
      title: 'Thermal Print & Backup',
      desc: 'Cetak struk thermal 58/80mm, ekspor/impor database untuk backup data.'
    }
  ]

  const COMING_SOON = [
    {
      icon: <SmartphoneRounded sx={{ fontSize: 28 }} />,
      title: 'Aplikasi Mobile / Tablet',
      desc: 'Versi Android dan iOS untuk kasir mobile. Pantau toko dari mana saja menggunakan perangkat tablet atau smartphone.',
      badge: 'Coming Soon'
    },
    {
      icon: <WebRounded sx={{ fontSize: 28 }} />,
      title: 'P-POS Web Dashboard',
      desc: 'Pantau laporan, stok, dan aktivitas toko secara real-time melalui browser di komputer atau laptop mana pun.',
      badge: 'Coming Soon'
    },
    {
      icon: <DevicesRounded sx={{ fontSize: 28 }} />,
      title: 'Multi-Device Sync',
      desc: 'Sinkronisasi data antar perangkat secara otomatis. Buka kasir di tablet, pantau laporan di web, semua data tetap terintegrasi.',
      badge: 'Coming Soon'
    },
    {
      icon: <CloudSyncRounded sx={{ fontSize: 28 }} />,
      title: 'Cloud Backup & Restore',
      desc: 'Backup otomatis database ke cloud. Tidak perlu khawatir data hilang meskipun perangkat rusak.',
      badge: 'Coming Soon'
    }
  ]

  return (
    <PageLayout breadcrumbs={[{ label: 'Tentang Aplikasi' }]} title="Tentang P-POS Kasir">
      {/* HERO */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          mb: 3,
          background: isDark
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.15)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: 40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 70%)`,
            pointerEvents: 'none'
          }}
        />
        <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            <PointOfSaleRounded sx={{ fontSize: 36, color: '#fff' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
              P-POS Kasir
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
              Versi {appVersion}
            </Typography>
            <Chip
              label="Sistem Kasir Offline UMKM"
              size="small"
              sx={{
                mt: 1,
                fontSize: 10,
                fontWeight: 600,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* DESKRIPSI */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          mb: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <InfoOutlined sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Tentang Aplikasi</Typography>
          </Box>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.8 }}>
            P-POS Kasir adalah sistem Point of Sales (POS) desktop modern yang dirancang khusus
            untuk kebutuhan UMKM, toko kelontong, F&B, dan bisnis ritel kecil di Indonesia. Aplikasi
            ini 100% offline-first — semua data transaksi, produk, dan laporan keuangan disimpan
            langsung di perangkat Anda tanpa memerlukan koneksi internet.
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.8, mt: 1 }}>
            Dikembangkan dengan misi membantu digitalisasi usaha kecil dan menengah melalui
            teknologi kasir yang gratis, cepat, dan mudah digunakan.
          </Typography>
        </CardContent>
      </Card>

      {/* FITUR UTAMA */}
      <Typography
        sx={{ fontSize: 16, fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <CheckCircleRounded sx={{ fontSize: 20, color: 'success.main' }} />
        Fitur Tersedia
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {FEATURES.map((f, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: 'none',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ color: theme.palette.primary.main, display: 'flex' }}>{f.icon}</Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{f.title}</Typography>
                </Box>
                <Typography
                  sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.6, pl: 4.5 }}
                >
                  {f.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* COMING SOON */}
      <Typography
        sx={{ fontSize: 16, fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <LockRounded sx={{ fontSize: 18, color: 'warning.main' }} />
        Fitur Mendatang (Coming Soon)
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'text.disabled', mb: 2.5, fontStyle: 'italic' }}>
        Fitur-fitur ini masih dalam tahap pengembangan. Dukung pengembangan dengan memberikan
        apresiasi melalui menu Dukung Pengembang.
      </Typography>
      <Grid container spacing={2}>
        {COMING_SOON.map((item, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <ComingSoonCard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* VERSION INFO */}
      <Box sx={{ textAlign: 'center', mt: 5, py: 3 }}>
        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
          P-POS Kasir v{appVersion} &copy; {new Date().getFullYear()} Putra Tech
        </Typography>
        <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 0.5 }}>
          Dibuat untuk UMKM Indonesia yang lebih berdaya
        </Typography>
      </Box>
    </PageLayout>
  )
}
