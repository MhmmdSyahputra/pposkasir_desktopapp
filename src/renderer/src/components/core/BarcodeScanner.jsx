import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos'
import { Html5Qrcode } from 'html5-qrcode'

/* eslint-disable react/prop-types */
export const BarcodeScanner = ({ open, onClose, onScanSuccess }) => {
  const theme = useTheme()
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const qrScannerRef = useRef(null)
  const scannerId = 'qr-reader-element'

  const stopScanner = async () => {
    if (qrScannerRef.current) {
      try {
        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop()
        }
      } catch (err) {
        console.error('Failed to stop camera stream:', err)
      } finally {
        qrScannerRef.current = null
      }
    }
  }

  const handleClose = useCallback(async () => {
    await stopScanner()
    setErrorMsg('')
    setDevices([])
    setSelectedDevice('')
    onClose()
  }, [onClose])

  // Fetch available cameras
  useEffect(() => {
    if (!open) return

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (cameras && cameras.length > 0) {
          setDevices(cameras)
          // Default to back camera if available, or first camera
          const backCamera = cameras.find((cam) => cam.label.toLowerCase().includes('back'))
          setSelectedDevice(backCamera ? backCamera.id : cameras[0].id)
        } else {
          setErrorMsg('Kamera tidak ditemukan.')
        }
      })
      .catch((err) => {
        console.error('Failed to get cameras:', err)
        setErrorMsg('Gagal mengakses daftar kamera.')
      })
  }, [open])

  // Initialize and run scanner when open and device is selected
  useEffect(() => {
    if (!open || !selectedDevice) return

    // Ensure clean element target
    const container = document.getElementById(scannerId)
    if (!container) return

    const html5QrCode = new Html5Qrcode(scannerId)
    qrScannerRef.current = html5QrCode

    const config = {
      fps: 10,
      qrbox: (width, height) => {
        // dynamic qr box for barcode scanning (wider than taller)
        const minDim = Math.min(width, height)
        const boxWidth = Math.floor(width * 0.7)
        const boxHeight = Math.floor(minDim * 0.35)
        return { width: boxWidth, height: boxHeight }
      },
      aspectRatio: 1.777778 // 16:9
    }

    html5QrCode
      .start(
        selectedDevice,
        config,
        (decodedText) => {
          // Success callback
          onScanSuccess(decodedText)
          handleClose()
        },
        () => {
          // Silent failure callback (scanner constantly running checks)
        }
      )
      .catch((err) => {
        console.error('Failed to start scanner:', err)
        setErrorMsg('Gagal memulai kamera. Pastikan izin kamera diberikan.')
      })

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch((err) => console.error('Cleanup stop failed:', err))
      }
    }
  }, [open, selectedDevice, onScanSuccess, handleClose])

  const handleDeviceChange = async (event) => {
    await stopScanner()
    setSelectedDevice(event.target.value)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          backgroundImage: 'none',
          border: `1px solid ${theme.palette.divider}`
        }
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
          Scan Barcode / QR Code
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {errorMsg ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="error" sx={{ fontFamily: 'Poppins, sans-serif', fontSize: 14 }}>
              {errorMsg}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {devices.length > 1 && (
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>
                  Pilih Kamera
                </InputLabel>
                <Select
                  value={selectedDevice}
                  onChange={handleDeviceChange}
                  label="Pilih Kamera"
                  startAdornment={
                    <FlipCameraIosIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
                  }
                  sx={{
                    borderRadius: 1.5,
                    fontSize: 13,
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {devices.map((device) => (
                    <MenuItem
                      key={device.id}
                      value={device.id}
                      sx={{ fontSize: 13, fontFamily: 'Poppins, sans-serif' }}
                    >
                      {device.label || `Camera ${devices.indexOf(device) + 1}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Video Container for scanner */}
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#000000',
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                '& #qr-reader-element': {
                  width: '100% !important',
                  height: '100% !important',
                  border: 'none !important',
                  '& video': {
                    objectFit: 'cover'
                  }
                }
              }}
            >
              <div id={scannerId} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 12
              }}
            >
              Posisikan kode barcode/QR di dalam area kotak pemindai camera
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          onClick={handleClose}
          sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
        >
          Batal
        </Button>
      </DialogActions>
    </Dialog>
  )
}
