import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Divider,
  Stack,
  Avatar,
  Fade,
  Slide,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material'
import pposLogo from '../../../../../resources/icon.png'


// We force a dark theme for the mirror display for a premium aesthetic
const mirrorTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4facfe' },
    background: {
      default: '#0f172a', // Tailwind slate-900
      paper: '#1e293b' // Tailwind slate-800
    },
    text: {
      primary: '#f8fafc', // slate-50
      secondary: '#94a3b8' // slate-400
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
  }
})

export const MirrorPage = () => {
  const [cartData, setCartData] = useState({
    items: [],
    subtotal: 0,
    totalDiscount: 0,
    totalTax: 0,
    finalTotal: 0
  })

  useEffect(() => {
    // Listen for updates from the main window
    const removeListener = window.api.windowManagement.onMirrorCartUpdated((data) => {
      setCartData(data)
    })
    return () => removeListener()
  }, [])

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val || 0)
  }

  const { items = [], subtotal = 0, totalDiscount = 0, totalTax = 0, finalTotal = 0 } = cartData

  return (
    <ThemeProvider theme={mirrorTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        {/* Left Side: Brand / Idle Screen */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            p: 4
          }}
        >
          {items.length === 0 ? (
            <Fade in={true} timeout={1000}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 130,
                    height: 130,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 4,
                    mx: 'auto',
                    boxShadow: '0 0 40px rgba(79, 172, 254, 0.4)'
                  }}
                >
                  <img src={pposLogo} alt="P-POS Logo" style={{ width: 80, height: 80, objectFit: 'contain' }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
                  Selamat Datang
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                  Silakan sampaikan pesanan Anda pada kasir.
                </Typography>
              </Box>
            </Fade>
          ) : (
            <Fade in={true} timeout={800}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  Pesanan Anda
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto' }}
                >
                  Mohon periksa kembali detail pesanan Anda di layar sebelah kanan sebelum melakukan
                  pembayaran.
                </Typography>
              </Box>
            </Fade>
          )}

          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: 30, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              opacity: 0.9 
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 3, textTransform: 'uppercase', mb: 0.2, fontSize: 10, fontWeight: 600 }}>
              Powered By
            </Typography>
            <Typography variant="h5" sx={{ 
              fontWeight: 900, 
              background: 'linear-gradient(90deg, #4facfe, #00f2fe)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              letterSpacing: 1 
            }}>
              P-POS KASIR
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.2, fontSize: 11 }}>
              Sistem Kasir Pintar Masa Kini
            </Typography>
          </Box>
        </Box>

        {/* Right Side: Order List */}
        <Box
          sx={{
            width: { xs: '45%', md: '400px', lg: '450px' },
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Detail Pesanan
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 3, pb: 10 }}>
            {items.length === 0 ? (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography sx={{ color: 'text.secondary' }}>Keranjang kosong</Typography>
              </Box>
            ) : (
              <Stack spacing={2.5}>
                {items.map((item, index) => (
                  <Slide
                    direction="left"
                    in={true}
                    key={item.cartId || index}
                    timeout={300 + index * 100}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        variant="rounded"
                        src={item.image ? `ppos://localhost/${item.image}` : undefined}
                        sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.05)' }}
                      >
                        {!item.image && item.nama?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{item.nama}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                            {item.qty} x {formatCurrency(item.basePrice ?? item.hargaJual)}
                          </Typography>
                          <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'primary.main' }}>
                            {formatCurrency(item.qty * item.hargaJual)}
                          </Typography>
                        </Box>

                        {/* Modifier Support */}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <Box
                            sx={{ mt: 1, pl: 1.5, borderLeft: '2px solid rgba(255,255,255,0.1)' }}
                          >
                            {item.modifiers.map((mod, i) => (
                              <Box
                                key={i}
                                sx={{ display: 'flex', justifyContent: 'space-between' }}
                              >
                                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                  + {mod.nama}
                                </Typography>
                                {mod.harga > 0 && (
                                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                    {formatCurrency(mod.harga)}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Box>
                        )}

                        {item.diskon > 0 && (
                          <Typography sx={{ color: 'error.main', fontSize: 13, mt: 0.5 }}>
                            Diskon: -{formatCurrency(item.diskon)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Slide>
                ))}
              </Stack>
            )}
          </Box>

          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(to top, #1e293b 80%, transparent)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              zIndex: 10
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: 'text.secondary' }}>Subtotal</Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</Typography>
            </Box>
            {totalDiscount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: 'error.main' }}>Diskon</Typography>
                <Typography sx={{ color: 'error.main', fontWeight: 600 }}>
                  -{formatCurrency(totalDiscount)}
                </Typography>
              </Box>
            )}
            {totalTax > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ color: 'text.secondary' }}>Pajak</Typography>
                <Typography sx={{ fontWeight: 600 }}>{formatCurrency(totalTax)}</Typography>
              </Box>
            )}

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Total</Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 800, color: 'primary.main' }}>
                {formatCurrency(finalTotal)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
