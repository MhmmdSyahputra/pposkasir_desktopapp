/* eslint-disable react/prop-types */
import { useState, useMemo, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
  Box,
  alpha,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Chip,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Dialog,
  DialogContent,
  Divider,
  Collapse
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
// import MoreVertIcon from '@mui/icons-material/MoreVert'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
// import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import NotesIcon from '@mui/icons-material/Notes'
import { useTranslation } from 'react-i18next'
import { productService } from '../../services/productService'
import { modifierService } from '../../services/modifierService'
import { transactionService } from '../../services/transactionService'
import { useAuth } from '../../context/authContext'

// ─── FORMAT RUPIAH ─────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(n)

// ─── OPTION CHIP ──────────────────────────────────────────────────────────────
const OptionChip = ({ option, selected, onClick }) => {
  const theme = useTheme()
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1.5,
        py: 0.8,
        borderRadius: 1.5,
        cursor: 'pointer',
        border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.14) : theme.palette.custom.inputBg,
        color: selected ? theme.palette.primary.light : 'text.secondary',
        fontSize: 12,
        fontFamily: 'Poppins, sans-serif',
        transition: 'all 0.13s',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.5),
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: 'text.primary'
        },
        userSelect: 'none'
      }}
    >
      {selected && <CheckIcon sx={{ fontSize: 11, color: theme.palette.primary.main }} />}
      {option.label}
      {option.price > 0 && (
        <Typography
          component="span"
          sx={{
            fontSize: 10,
            color: selected ? theme.palette.primary.light : 'text.disabled',
            ml: 0.3
          }}
        >
          +{fmt(option.price)}
        </Typography>
      )}
    </Box>
  )
}

// ─── CUSTOMIZE DIALOG ─────────────────────────────────────────────────────────
const CustomizeDialog = ({ product, open, onClose, onConfirm }) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const groups = product?.modifiers || []

  const [selections, setSelections] = useState({})
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [lastProductId, setLastProductId] = useState(null)

  if (product && product.id !== lastProductId) {
    setLastProductId(product.id)
    setSelections({})
    setQty(1)
    setNote('')
    setShowNote(false)
  }

  if (!product) return null

  const toggle = (group, optionId) => {
    setSelections((prev) => {
      const cur = prev[group.id] || []
      if (group.tipe === 'single') return { ...prev, [group.id]: [optionId] }
      return {
        ...prev,
        [group.id]: cur.includes(optionId) ? cur.filter((x) => x !== optionId) : [...cur, optionId]
      }
    })
  }

  const isSelected = (groupId, optionId) => (selections[groupId] || []).includes(optionId)

  const allRequiredFilled = groups
    .filter((g) => g.wajib)
    .every((g) => (selections[g.id] || []).length > 0)

  const extraPrice = groups.reduce((sum, g) => {
    const sel = selections[g.id] || []
    return (
      sum +
      g.options.filter((o) => sel.includes(o.id)).reduce((s, o) => s + (o.harga_tambah || 0), 0)
    )
  }, 0)

  const unitPrice = (product.harga_jual || 0) + extraPrice
  const totalPrice = unitPrice * qty

  const buildSummaryLabel = () => {
    const parts = []
    groups.forEach((g) => {
      const sel = selections[g.id] || []
      g.options
        .filter((o) => sel.includes(o.id))
        .forEach((o) => {
          parts.push(o.emoji ? `${o.emoji} ${o.nama}` : o.nama)
        })
    })
    return parts.join(', ')
  }

  const handleConfirm = () => {
    onConfirm({
      cartId: `${product.id}_${Date.now()}`,
      id: product.id,
      name: product.nama,
      image: product.images?.[0] ?? null,
      price: unitPrice,
      basePrice: product.harga_jual || 0,
      qty,
      note: note.trim(),
      selections,
      summaryLabel: buildSummaryLabel()
    })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          backgroundImage: `radial-gradient(ellipse at 80% 0%, ${alpha(theme.palette.primary.main, 0.07)} 0%, transparent 60%)`,
          maxHeight: '92vh'
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 2.5,
              flexShrink: 0,
              bgcolor: theme.palette.custom.elevation1,
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              fontSize: 36
            }}
          >
            {product.images?.[0] ? (
              <Box
                component="img"
                src={`ppos://localhost/${product.images[0]}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'text.secondary',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {product.nama?.charAt(0)?.toUpperCase()}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <Box sx={{ flex: 1, mr: 1 }}>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.3
                  }}
                >
                  {product.nama}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                  <Typography
                    sx={{
                      color: 'text.disabled',
                      fontSize: 11,
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    {t('pos.stock')} {(product.stok ?? 0) > 50 ? '50+' : (product.stok ?? 0)}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' }, mt: -0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography
              sx={{
                color: 'text.disabled',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 11,
                mt: 0.8,
                lineHeight: 1.6
              }}
            >
              {product.deskripsi}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Option groups */}
        <Box
          sx={{
            overflowY: 'auto',
            maxHeight: '44vh',
            px: 3,
            py: 2.5,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: theme.palette.custom.scrollThumb,
              borderRadius: 2
            }
          }}
        >
          {groups.map((group, gi) => (
            <Box key={group.id} sx={{ mb: gi < groups.length - 1 ? 2.8 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  {group.nama}
                </Typography>
                {group.wajib ? (
                  <Chip
                    label={t('pos.required')}
                    size="small"
                    sx={{
                      height: 17,
                      fontSize: 9,
                      fontFamily: 'Poppins, sans-serif',
                      bgcolor: alpha(theme.palette.error.main, 0.12),
                      color: theme.palette.error.main,
                      border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`
                    }}
                  />
                ) : (
                  <Chip
                    label={t('pos.optional')}
                    size="small"
                    sx={{
                      height: 17,
                      fontSize: 9,
                      fontFamily: 'Poppins, sans-serif',
                      bgcolor: theme.palette.custom.inputBg,
                      color: 'text.disabled',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  />
                )}
                {group.tipe === 'multiple' && (
                  <Typography
                    sx={{
                      color: 'text.disabled',
                      fontSize: 10,
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    · {t('pos.can_select_multiple')}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {group.options.map((opt) => (
                  <OptionChip
                    key={opt.id}
                    option={{
                      id: opt.id,
                      label: opt.emoji ? `${opt.emoji} ${opt.nama}` : opt.nama,
                      price: opt.harga_tambah || 0
                    }}
                    selected={isSelected(group.id, opt.id)}
                    onClick={() => toggle(group, opt.id)}
                  />
                ))}
              </Box>
            </Box>
          ))}

          {/* Catatan */}
          <Box sx={{ mt: 2.5 }}>
            <Box
              onClick={() => setShowNote((v) => !v)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                mb: showNote ? 1.2 : 0
              }}
            >
              <NotesIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 12
                }}
              >
                {t('pos.add_note')}
              </Typography>
              <Typography sx={{ color: 'text.disabled', fontSize: 10 }}>
                {showNote ? '▲' : '▼'}
              </Typography>
            </Box>
            <Collapse in={showNote}>
              <TextField
                multiline
                rows={2}
                placeholder={t('pos.note_placeholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: theme.palette.custom.inputBg,
                    borderRadius: 2,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12,
                    color: 'text.primary',
                    '& fieldset': { borderColor: theme.palette.custom.inputBorder },
                    '&:hover fieldset': { borderColor: theme.palette.custom.inputBorderHover },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }
                  },
                  '& textarea::placeholder': {
                    color: 'text.disabled',
                    fontFamily: 'Poppins, sans-serif'
                  }
                }}
              />
            </Collapse>
          </Box>
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
          >
            <Typography
              sx={{
                color: 'text.secondary',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 12
              }}
            >
              {t('pos.qty')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              {[
                {
                  icon: <RemoveIcon sx={{ fontSize: 14 }} />,
                  action: () => setQty((q) => Math.max(1, q - 1))
                },
                {
                  icon: <AddIcon sx={{ fontSize: 14 }} />,
                  action: () => setQty((q) => Math.min(product.stok ?? 99, q + 1))
                }
              ]
                .map((btn, i) => (
                  <Box
                    key={i}
                    onClick={i === 0 ? btn.action : btn.action}
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.custom.elevation1,
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      },
                      transition: 'all 0.13s'
                    }}
                  >
                    {btn.icon}
                  </Box>
                ))
                .reduce((acc, el, i) => {
                  if (i === 0)
                    return [
                      el,
                      <Typography
                        key="qty"
                        sx={{
                          color: 'text.primary',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 16,
                          fontWeight: 700,
                          minWidth: 28,
                          textAlign: 'center'
                        }}
                      >
                        {qty}
                      </Typography>,
                      acc[0]
                    ]
                  return [...acc, el]
                }, [])}
            </Box>
          </Box>

          {extraPrice > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography
                  sx={{
                    color: 'text.disabled',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 11
                  }}
                >
                  {t('pos.base_price')}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.disabled',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 11
                  }}
                >
                  {fmt(product.harga_jual || 0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  sx={{
                    color: 'text.disabled',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 11
                  }}
                >
                  {t('pos.option_extra')}
                </Typography>
                <Typography
                  sx={{
                    color: theme.palette.primary.light,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 11
                  }}
                >
                  +{fmt(extraPrice)}
                </Typography>
              </Box>
            </Box>
          )}

          <Box
            onClick={allRequiredFilled ? handleConfirm : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 1.6,
              borderRadius: 2,
              cursor: allRequiredFilled ? 'pointer' : 'not-allowed',
              bgcolor: allRequiredFilled
                ? theme.palette.primary.main
                : alpha(theme.palette.primary.main, 0.2),
              transition: 'all 0.15s',
              '&:hover': allRequiredFilled ? { bgcolor: theme.palette.primary.dark } : {},
              '&:active': allRequiredFilled ? { transform: 'scale(0.98)' } : {}
            }}
          >
            <Typography
              sx={{
                color: allRequiredFilled ? '#fff' : 'text.disabled',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 13,
                fontWeight: 700
              }}
            >
              {allRequiredFilled ? t('pos.add_to_order') : t('pos.select_required_first')}
            </Typography>
            <Typography
              sx={{
                color: allRequiredFilled ? 'rgba(255,255,255,0.9)' : 'text.disabled',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 14,
                fontWeight: 700
              }}
            >
              {fmt(totalPrice)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

const CheckoutDialog = ({ open, onClose, cart, onSuccess }) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [metode, setMetode] = useState('tunai')
  const [bayarInput, setBayarInput] = useState('')
  const [diskonInput, setDiskonInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(null)

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const diskon = parseInt(diskonInput.replace(/\D/g, '') || '0', 10)
  const total = Math.max(0, subtotal - diskon)
  const bayar = parseInt(bayarInput.replace(/\D/g, '') || '0', 10)
  const kembalian = metode === 'tunai' ? Math.max(0, bayar - total) : 0
  const canConfirm = !saving && (metode !== 'tunai' || bayar >= total)
  const METODE_OPTS = [
    { value: 'tunai', label: t('pos.method_cash') },
    { value: 'qris', label: t('pos.method_qris') },
    { value: 'kartu', label: t('pos.method_card') },
    { value: 'transfer', label: t('pos.method_transfer') }
  ]

  const reset = () => {
    setMetode('tunai')
    setBayarInput('')
    setDiskonInput('')
    setDone(null)
    setSaving(false)
  }

  const handleClose = () => {
    if (saving) return
    reset()
    onClose()
  }

  const handleConfirm = async () => {
    setSaving(true)
    try {
      const payload = {
        items: cart.map((i) => ({
          product_id: i.id,
          nama_produk: i.name,
          harga_satuan: i.price,
          harga_dasar: i.basePrice,
          qty: i.qty,
          subtotal: i.price * i.qty,
          catatan: i.note || '',
          modifier_summary: i.summaryLabel || ''
        })),
        subtotal,
        diskon,
        pajak: 0,
        total,
        bayar: metode === 'tunai' ? bayar : total,
        kembalian,
        metode_bayar: metode,
        catatan: '',
        kasir: user?.username || ''
      }
      const res = await transactionService.create(payload)
      if (res.ok) {
        setDone(res.data)
      }
    } catch (e) {
      console.error('Checkout error:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleDone = () => {
    reset()
    onSuccess()
  }

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: theme.palette.custom.inputBg,
      borderRadius: 1.5,
      fontFamily: 'Poppins, sans-serif',
      fontSize: 13,
      color: 'text.primary',
      '& fieldset': { borderColor: theme.palette.custom.inputBorder },
      '&:hover fieldset': { borderColor: theme.palette.custom.inputBorderHover },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }
    },
    '& .MuiInputLabel-root': {
      color: 'text.disabled',
      fontFamily: 'Poppins, sans-serif',
      fontSize: 13,
      '&.Mui-focused': { color: theme.palette.primary.main }
    }
  }

  if (done) {
    return (
      <Dialog
        open={open}
        maxWidth="xs"
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
        <DialogContent sx={{ textAlign: 'center', py: 5 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.success.main, 0.15),
              border: `1px solid ${alpha(theme.palette.success.main, 0.4)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <CheckIcon sx={{ fontSize: 32, color: theme.palette.success.main }} />
          </Box>
          <Typography
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              color: 'text.primary',
              mb: 0.5
            }}
          >
            {t('pos.payment_success')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 11,
              color: 'text.disabled',
              mb: 3
            }}
          >
            {done.no_transaksi}
          </Typography>
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.custom.elevation1,
              border: `1px solid ${theme.palette.divider}`,
              textAlign: 'left'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.7 }}>
              <Typography
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 11,
                  color: 'text.secondary'
                }}
              >
                {t('pos.total')}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'text.primary'
                }}
              >
                {fmt(done.total)}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: done.kembalian > 0 ? 0.7 : 0
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 11,
                  color: 'text.secondary'
                }}
              >
                {t('pos.pay')}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 11,
                  color: 'text.primary'
                }}
              >
                {fmt(done.bayar)}
              </Typography>
            </Box>
            {done.kembalian > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 11,
                    color: 'text.secondary'
                  }}
                >
                  {t('pos.change')}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12,
                    fontWeight: 700,
                    color: theme.palette.success.main
                  }}
                >
                  {fmt(done.kembalian)}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            onClick={handleDone}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textAlign: 'center',
              bgcolor: theme.palette.primary.main,
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              '&:hover': { bgcolor: theme.palette.primary.dark },
              '&:active': { transform: 'scale(0.98)' },
              transition: 'all 0.15s'
            }}
          >
            {t('pos.new_transaction')}
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <Typography
            sx={{
              flex: 1,
              fontFamily: 'Poppins, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: 'text.primary'
            }}
          >
            {t('pos.confirm_payment')}
          </Typography>
          <IconButton size="small" onClick={handleClose} sx={{ color: 'text.disabled' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Order Summary */}
        <Box
          sx={{
            mb: 2,
            maxHeight: 160,
            overflowY: 'auto',
            pr: 0.5,
            '&::-webkit-scrollbar': { width: 3 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: theme.palette.custom.scrollThumb,
              borderRadius: 2
            }
          }}
        >
          {cart.map((item) => (
            <Box
              key={item.cartId}
              sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6 }}
            >
              <Box sx={{ flex: 1, mr: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12,
                    color: 'text.primary'
                  }}
                >
                  {item.name}{' '}
                  <Typography component="span" sx={{ color: 'text.disabled', fontSize: 11 }}>
                    ×{item.qty}
                  </Typography>
                </Typography>
                {item.summaryLabel && (
                  <Typography
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 10,
                      color: 'text.disabled'
                    }}
                  >
                    {item.summaryLabel}
                  </Typography>
                )}
              </Box>
              <Typography
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'text.secondary',
                  flexShrink: 0
                }}
              >
                {fmt(item.price * item.qty)}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Diskon */}
        <TextField
          fullWidth
          size="small"
          label={t('pos.discount')}
          placeholder="0"
          value={diskonInput}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '')
            setDiskonInput(digits ? Number(digits).toLocaleString('id-ID') : '')
          }}
          sx={{ mb: 2, ...inputSx }}
        />

        {/* Totals */}
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: theme.palette.custom.elevation1,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          {diskon > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 11,
                    color: 'text.secondary'
                  }}
                >
                  {t('pos.subtotal')}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 11,
                    color: 'text.secondary'
                  }}
                >
                  {fmt(subtotal)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 11,
                    color: 'text.secondary'
                  }}
                >
                  {t('pos.discount')}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 11,
                    color: theme.palette.error.main
                  }}
                >
                  -{fmt(diskon)}
                </Typography>
              </Box>
            </>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                color: 'text.primary'
              }}
            >
              {t('pos.total')}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 15,
                fontWeight: 800,
                color: theme.palette.primary.main
              }}
            >
              {fmt(total)}
            </Typography>
          </Box>
        </Box>

        {/* Metode Bayar */}
        <Typography
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 10,
            color: 'text.disabled',
            mb: 0.8,
            letterSpacing: 1,
            textTransform: 'uppercase'
          }}
        >
          {t('pos.payment_method')}
        </Typography>
        <ToggleButtonGroup
          value={metode}
          exclusive
          onChange={(_, v) => v && setMetode(v)}
          size="small"
          fullWidth
          sx={{
            mb: 2,
            '& .MuiToggleButton-root': {
              flex: 1,
              border: `1px solid ${theme.palette.divider}`,
              color: 'text.disabled',
              bgcolor: theme.palette.custom.inputBg,
              fontFamily: 'Poppins, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              py: 1,
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.18),
                color: theme.palette.primary.light,
                borderColor: alpha(theme.palette.primary.main, 0.5)
              },
              '&:hover': { bgcolor: theme.palette.custom.elevation1 }
            }
          }}
        >
          {METODE_OPTS.map((m) => (
            <ToggleButton key={m.value} value={m.value}>
              {m.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Bayar input — only for tunai */}
        {metode === 'tunai' && (
          <TextField
            fullWidth
            size="small"
            label={t('pos.payment_amount')}
            placeholder={total.toLocaleString('id-ID')}
            value={bayarInput}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '')
              setBayarInput(digits ? Number(digits).toLocaleString('id-ID') : '')
            }}
            sx={{ mb: 1, ...inputSx }}
          />
        )}

        {/* Kembalian — only for tunai */}
        {metode === 'tunai' && bayar > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 12,
                color: 'text.secondary'
              }}
            >
              {t('pos.change')}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                color: kembalian >= 0 ? theme.palette.success.main : theme.palette.error.main
              }}
            >
              {kembalian >= 0 ? fmt(kembalian) : `-${fmt(Math.abs(kembalian))}`}
            </Typography>
          </Box>
        )}

        {/* Confirm Button */}
        <Box
          onClick={canConfirm ? handleConfirm : undefined}
          sx={{
            mt: metode === 'tunai' ? 0 : 1,
            py: 1.5,
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: canConfirm
              ? theme.palette.primary.main
              : alpha(theme.palette.primary.main, 0.3),
            cursor: canConfirm ? 'pointer' : 'not-allowed',
            fontFamily: 'Poppins, sans-serif',
            color: canConfirm ? '#fff' : alpha('#fff', 0.4),
            fontWeight: 700,
            fontSize: 13,
            '&:hover': canConfirm ? { bgcolor: theme.palette.primary.dark } : {},
            '&:active': canConfirm ? { transform: 'scale(0.98)' } : {},
            transition: 'all 0.15s'
          }}
        >
          {saving ? t('pos.processing') : t('pos.confirm_payment')}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, onSelect }) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const outOfStock = product.stok === 0

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setPressed(false)
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={() => !outOfStock && onSelect(product)}
      sx={{
        position: 'relative',
        borderRadius: 2.5,
        overflow: 'hidden',
        border: `1px solid ${hovered && !outOfStock ? alpha(theme.palette.primary.main, 0.6) : theme.palette.divider}`,
        bgcolor: outOfStock
          ? alpha(theme.palette.background.paper, 0.6)
          : hovered
            ? theme.palette.custom.elevation1
            : theme.palette.background.paper,
        cursor: outOfStock ? 'not-allowed' : 'pointer',
        transition: 'all 0.18s ease',
        transform:
          pressed && !outOfStock
            ? 'scale(0.97)'
            : hovered && !outOfStock
              ? 'translateY(-2px)'
              : 'none',
        boxShadow:
          hovered && !outOfStock
            ? `0 8px 24px ${alpha(theme.palette.common.black, 0.18)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.3)}`
            : `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        opacity: outOfStock ? 0.55 : 1
      }}
    >
      {outOfStock && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Chip
            label={t('pos.out_of_stock')}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: theme.palette.error.main,
              border: `1px solid ${alpha(theme.palette.error.main, 0.4)}`,
              fontFamily: 'Poppins, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1
            }}
          />
        </Box>
      )}
      {/* Thumbnail */}
      <Box
        sx={{
          width: '100%',
          height: 130,
          overflow: 'hidden',
          bgcolor: theme.palette.custom.inputBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: outOfStock ? 'grayscale(1)' : 'none'
        }}
      >
        {product.images?.[0] ? (
          <Box
            component="img"
            src={`ppos://localhost/${product.images[0]}`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.25s',
              transform: hovered && !outOfStock ? 'scale(1.07)' : 'scale(1)'
            }}
          />
        ) : (
          <Typography
            sx={{
              fontSize: 32,
              fontWeight: 700,
              color: 'text.disabled',
              fontFamily: 'Poppins, sans-serif',
              userSelect: 'none'
            }}
          >
            {product.nama?.charAt(0)?.toUpperCase()}
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 1.5 }}>
        <Typography
          sx={{
            color: outOfStock ? 'text.disabled' : 'text.primary',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1.3,
            mb: 0.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {product.nama}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Typography
            sx={{ color: 'text.disabled', fontSize: 10, fontFamily: 'Poppins, sans-serif' }}
          >
            {t('pos.stock')} {(product.stok ?? 0) > 50 ? '50+' : (product.stok ?? 0)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            sx={{
              color: outOfStock ? 'text.disabled' : theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              fontSize: 12,
              fontWeight: 700
            }}
          >
            {fmt(product.harga_jual || 0)}
          </Typography>
          {!outOfStock && (
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: hovered
                  ? theme.palette.primary.main
                  : alpha(theme.palette.primary.main, 0.15),
                border: `1px solid ${hovered ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.15s',
                flexShrink: 0
              }}
            >
              <AddIcon
                sx={{
                  fontSize: 15,
                  color: hovered ? '#fff' : alpha(theme.palette.primary.light, 0.85)
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
export const POSNavbar = ({ itemCount = 0, onClear }) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Box sx={{ flex: '0 0 65%' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.dark' }}>
          <Toolbar sx={{ minHeight: 52, px: 2, gap: 1 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ flexGrow: 1, fontFamily: 'Poppins, sans-serif', fontSize: 15 }}
            >
              {t('pos.order_menu')}
            </Typography>
            <IconButton sx={{ color: '#fff' }} size="small">
              {/* <SearchIcon /> */}
            </IconButton>
            <IconButton sx={{ color: '#fff' }} size="small">
              {/* <GridViewIcon /> */}
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ flex: '1 1 auto' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.dark' }}>
          <Toolbar sx={{ minHeight: 52, px: 2, gap: 1 }}>
            <Badge badgeContent={itemCount} color="error" sx={{ mr: 0.5 }}>
              <ShoppingCartOutlinedIcon sx={{ color: '#fff' }} />
            </Badge>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ flexGrow: 1, fontFamily: 'Poppins, sans-serif', fontSize: 14 }}
            >
              {t('pos.items_count', { count: itemCount })}
            </Typography>
            <Tooltip title={t('pos.clear_cart')}>
              <IconButton sx={{ color: '#fff' }} size="small" onClick={onClear}>
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
            <IconButton sx={{ color: '#fff' }} size="small">
              {/* <PrintOutlinedIcon /> */}
            </IconButton>
            <IconButton sx={{ color: '#fff' }} size="small">
              {/* <MoreVertIcon /> */}
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
    </Box>
  )
}

// ─── CART PANEL ───────────────────────────────────────────────────────────────
const CartPanel = ({ items, onRemove, onCheckout }) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {items.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            opacity: 0.35
          }}
        >
          <ShoppingCartOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
          <Typography
            sx={{ color: 'text.secondary', fontFamily: 'Poppins, sans-serif', fontSize: 12 }}
          >
            {t('pos.cart_empty')}
          </Typography>
          <Typography
            sx={{
              color: 'text.disabled',
              fontFamily: 'Poppins, sans-serif',
              fontSize: 10,
              textAlign: 'center'
            }}
          >
            {t('pos.cart_start_hint')}
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              pr: 0.5,
              '&::-webkit-scrollbar': { width: 3 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: theme.palette.custom.scrollThumb,
                borderRadius: 2
              }
            }}
          >
            {items.map((item) => (
              <Box
                key={item.cartId}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: theme.palette.custom.elevation1,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { bgcolor: theme.palette.custom.subtle },
                  transition: 'all 0.15s'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  {item.image ? (
                    <Box
                      component="img"
                      src={`ppos://localhost/${item.image}`}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        flexShrink: 0,
                        bgcolor: 'custom.elevation1',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'text.secondary',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                      >
                        {item.name?.charAt(0)?.toUpperCase()}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'text.primary',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 11,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          flex: 1,
                          mr: 1
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: theme.palette.primary.main,
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {fmt(item.price * item.qty)}
                      </Typography>
                    </Box>
                    {item.summaryLabel && (
                      <Typography
                        sx={{
                          color: 'text.disabled',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 10,
                          mt: 0.4,
                          lineHeight: 1.5
                        }}
                      >
                        {item.summaryLabel}
                      </Typography>
                    )}
                    {item.note && (
                      <Typography
                        sx={{
                          color: alpha('#ffc107', 0.7),
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 10,
                          mt: 0.3,
                          fontStyle: 'italic'
                        }}
                      >
                        📝 {item.note}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 0.8
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'text.disabled',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 10
                        }}
                      >
                        {fmt(item.price)} × {item.qty}
                      </Typography>
                      <Typography
                        onClick={() => onRemove(item.cartId)}
                        sx={{
                          color: alpha(theme.palette.error.main, 0.55),
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 10,
                          cursor: 'pointer',
                          '&:hover': { color: theme.palette.error.main }
                        }}
                      >
                        {t('common.delete')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 11
                }}
              >
                {t('pos.subtotal')} ({items.reduce((s, i) => s + i.qty, 0)} {t('pos.item_unit')})
              </Typography>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 15,
                  fontWeight: 700
                }}
              >
                {fmt(total)}
              </Typography>
            </Box>
            <Box
              onClick={onCheckout}
              sx={{
                width: '100%',
                py: 1.5,
                borderRadius: 2,
                textAlign: 'center',
                bgcolor: theme.palette.primary.main,
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                '&:hover': { bgcolor: theme.palette.primary.dark },
                '&:active': { transform: 'scale(0.98)' },
                transition: 'all 0.15s'
              }}
            >
              {t('pos.process_payment')}
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}

// ─── HOME PAGE ─────────────────────────────────────────────────────────────────
export const HomePage = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const ALL_CATEGORY = '__all__'
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [dialogProduct, setDialogProduct] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [modifierMap, setModifierMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [prodRes, modRes] = await Promise.all([
          productService.getAll({ aktif: 1 }),
          modifierService.getAllProductGroups()
        ])
        if (prodRes.ok) {
          setProducts(
            prodRes.data.map((p) => ({
              ...p,
              images: (() => {
                try {
                  return JSON.parse(p.images || '[]')
                } catch {
                  return []
                }
              })()
            }))
          )
        }
        if (modRes.ok) setModifierMap(modRes.data)
      } catch (e) {
        console.error('POS load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.kategori).filter(Boolean))]
    return [ALL_CATEGORY, ...cats.sort()]
  }, [products])

  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (activeCategory === ALL_CATEGORY || p.kategori === activeCategory) &&
            p.nama.toLowerCase().includes(search.toLowerCase())
        )
        .map((p) => ({ ...p, modifiers: modifierMap[p.id] || [] })),
    [products, modifierMap, activeCategory, search, ALL_CATEGORY]
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '95vh',
        bgcolor: 'background.default',
        backgroundImage: `radial-gradient(ellipse at 10% 10%, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 55%)`,
        fontFamily: 'Poppins, sans-serif',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <POSNavbar itemCount={cart.reduce((s, i) => s + i.qty, 0)} onClear={() => setCart([])} />
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* KIRI */}
        <Box
          sx={{
            flex: '0 0 65%',
            height: '100%',
            overflowY: 'auto',
            px: 2.5,
            pt: 2,
            pb: 4,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: theme.palette.custom.scrollThumb,
              borderRadius: 2
            }
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder={t('pos.search_product')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  bgcolor: theme.palette.custom.inputBg,
                  borderRadius: 2,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13,
                  color: 'text.primary',
                  '& fieldset': { borderColor: theme.palette.custom.inputBorder },
                  '&:hover fieldset': { borderColor: theme.palette.custom.inputBorderHover },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }
                },
                '& input::placeholder': {
                  color: 'text.disabled',
                  fontFamily: 'Poppins, sans-serif'
                }
              }}
            />
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  border: `1px solid ${theme.palette.divider}`,
                  color: 'text.disabled',
                  bgcolor: theme.palette.custom.inputBg,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.primary.light,
                    borderColor: alpha(theme.palette.primary.main, 0.5)
                  },
                  '&:hover': { bgcolor: theme.palette.custom.elevation1 }
                }
              }}
            >
              <ToggleButton value="grid">
                <GridViewIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat === ALL_CATEGORY ? t('pos.all') : cat}
                onClick={() => setActiveCategory(cat)}
                size="small"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  bgcolor:
                    activeCategory === cat
                      ? theme.palette.primary.main
                      : theme.palette.custom.inputBg,
                  color: activeCategory === cat ? '#fff' : 'text.secondary',
                  border: `1px solid ${activeCategory === cat ? theme.palette.primary.main : theme.palette.divider}`,
                  '&:hover': {
                    bgcolor:
                      activeCategory === cat
                        ? theme.palette.primary.dark
                        : theme.palette.custom.elevation1
                  }
                }}
              />
            ))}
          </Box>

          <Typography
            sx={{
              color: 'text.disabled',
              fontFamily: 'Poppins, sans-serif',
              fontSize: 11,
              mb: 1.5
            }}
          >
            {t('pos.products_found', { count: filtered.length })}
          </Typography>

          {viewMode === 'grid' ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={setDialogProduct} />
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filtered.map((p) => {
                const outOfStock = p.stok === 0
                return (
                  <Box
                    key={p.id}
                    onClick={() => !outOfStock && setDialogProduct(p)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: outOfStock ? 'not-allowed' : 'pointer',
                      opacity: outOfStock ? 0.5 : 1,
                      '&:hover': !outOfStock
                        ? {
                            bgcolor: theme.palette.custom.elevation1,
                            borderColor: alpha(theme.palette.primary.main, 0.5)
                          }
                        : {},
                      transition: 'all 0.15s'
                    }}
                  >
                    {p.images?.[0] ? (
                      <Box
                        component="img"
                        src={`ppos://localhost/${p.images[0]}`}
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 1,
                          objectFit: 'cover',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 1,
                          flexShrink: 0,
                          bgcolor: theme.palette.custom.inputBg,
                          border: `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: 'text.secondary',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        >
                          {p.nama?.charAt(0)?.toUpperCase()}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: 'text.primary',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        {p.nama}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'text.disabled',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 10
                        }}
                      >
                        {p.kategori || '—'} · {t('pos.stock')} {p.stok ?? 0}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: theme.palette.primary.main,
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: 13,
                        fontWeight: 700
                      }}
                    >
                      {fmt(p.harga_jual || 0)}
                    </Typography>
                    {!outOfStock && (
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <AddIcon
                          sx={{ fontSize: 16, color: alpha(theme.palette.primary.light, 0.85) }}
                        />
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>
          )}

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13
                }}
              >
                {t('pos.loading_products')}
              </Typography>
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.4 }}>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13
                }}
              >
                {t('pos.products_not_found')}
              </Typography>
            </Box>
          ) : null}
        </Box>

        {/* KANAN */}
        <Box
          sx={{
            flex: '1 1 auto',
            height: '100%',
            borderLeft: `1px solid ${theme.palette.divider}`,
            px: 2.5,
            pt: 2,
            pb: 2,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography
            sx={{
              color: 'text.disabled',
              fontFamily: 'Poppins, sans-serif',
              fontSize: 11,
              mb: 1.5,
              letterSpacing: 1,
              textTransform: 'uppercase'
            }}
          >
            {t('pos.orders')}
          </Typography>
          <CartPanel
            items={cart}
            onRemove={(cartId) => setCart((prev) => prev.filter((i) => i.cartId !== cartId))}
            onCheckout={() => setCheckoutOpen(true)}
          />
        </Box>
      </Box>

      <CustomizeDialog
        product={dialogProduct}
        open={!!dialogProduct}
        onClose={() => setDialogProduct(null)}
        onConfirm={(item) => setCart((prev) => [...prev, item])}
      />
      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        onSuccess={() => {
          setCart([])
          setCheckoutOpen(false)
        }}
      />
    </Box>
  )
}
