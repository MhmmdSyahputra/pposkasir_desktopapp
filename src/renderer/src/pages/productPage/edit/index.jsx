import { useRef, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material'
import Chip from '@mui/material/Chip'
import {
  SaveRounded,
  DeleteOutlineRounded,
  AddPhotoAlternateRounded,
  DeleteRounded,
  InfoOutlined,
  TuneRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../components/PageLayout'
import { useEditProduct } from './hook/useEditProduct'

// ── section card wrapper ──────────────────────────────────────────────────
// eslint-disable-next-line react/prop-types
const SectionCard = ({ title, children }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 2.5
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Box>
  )
}

export const EditProductPage = () => {
  const ADD_CATEGORY_VALUE = '__add_new_category__'
  const ADD_UNIT_VALUE = '__add_new_unit__'

  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation()
  const isDark = theme.palette.mode === 'dark'
  const {
    form,
    handleChange,
    handleToggleAktif,
    handleSubmit,
    handleDelete,
    images,
    addImages,
    removeImage,
    categories,
    units,
    loading,
    saving,
    errors,
    modifierGroups,
    selectedModifierIds,
    toggleModifier,
    createCategoryQuick,
    createUnitQuick
  } = useEditProduct()

  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [unitDialogOpen, setUnitDialogOpen] = useState(false)
  const [quickCategoryName, setQuickCategoryName] = useState('')
  const [quickUnitName, setQuickUnitName] = useState('')
  const [quickUnitAbbr, setQuickUnitAbbr] = useState('')
  const [quickCategoryError, setQuickCategoryError] = useState('')
  const [quickUnitError, setQuickUnitError] = useState('')
  const [quickCategorySaving, setQuickCategorySaving] = useState(false)
  const [quickUnitSaving, setQuickUnitSaving] = useState(false)

  // ── shared styles ─────────────────────────────────────────────────────
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: theme.palette.custom.inputBg,
      borderRadius: 1.5,
      '& fieldset': { borderColor: theme.palette.custom.inputBorder },
      '&:hover fieldset': { borderColor: theme.palette.custom.inputBorderHover },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }
    },
    '& .MuiInputBase-input': {
      color: 'text.primary',
      fontSize: 13,
      fontFamily: 'Poppins, sans-serif'
    },
    '& .MuiInputLabel-root': { color: 'text.disabled', fontSize: 13 },
    '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
    '& .MuiFormHelperText-root': {
      color: 'text.disabled',
      fontSize: 11,
      fontFamily: 'Poppins, sans-serif'
    }
  }

  const menuPaperSx = {
    PaperProps: {
      sx: {
        bgcolor: isDark ? '#1a1f2c' : '#ffffff',
        border: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
        '& .MuiMenuItem-root': {
          fontSize: 13,
          fontFamily: 'Poppins, sans-serif',
          '&:hover': { bgcolor: `${theme.palette.primary.main}14` },
          '&.Mui-selected': {
            bgcolor: `${theme.palette.primary.main}1f`,
            color: 'primary.main'
          }
        }
      }
    }
  }

  const selectInnerSx = {
    color: 'text.primary',
    fontSize: 13,
    fontFamily: 'Poppins, sans-serif'
  }

  const ghostBtn = {
    fontSize: 13,
    fontWeight: 500,
    textTransform: 'none',
    color: 'text.secondary',
    borderRadius: 2,
    px: 1.5,
    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)' }
  }

  const primaryBtn = {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 2,
    px: 2,
    bgcolor: 'primary.main',
    color: '#ffffff',
    boxShadow: 'none',
    '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' }
  }

  const dangerBtn = {
    fontSize: 13,
    fontWeight: 500,
    textTransform: 'none',
    color: 'error.main',
    borderRadius: 2,
    px: 1.5,
    bgcolor: isDark ? 'rgba(224,92,92,0.08)' : 'rgba(211,47,47,0.06)',
    '&:hover': { bgcolor: isDark ? 'rgba(224,92,92,0.15)' : 'rgba(211,47,47,0.12)' }
  }

  const rpAdornmentSx = { color: 'text.secondary', fontSize: 13, fontFamily: 'inherit' }

  // ── drag & drop handlers ──────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    addImages(e.dataTransfer.files)
  }

  const handleCategorySelect = (e) => {
    if (e.target.value === ADD_CATEGORY_VALUE) {
      setQuickCategoryError('')
      setQuickCategoryName('')
      setCategoryDialogOpen(true)
      return
    }
    handleChange('kategori')(e)
  }

  const handleUnitSelect = (e) => {
    if (e.target.value === ADD_UNIT_VALUE) {
      setQuickUnitError('')
      setQuickUnitName('')
      setQuickUnitAbbr('')
      setUnitDialogOpen(true)
      return
    }
    handleChange('satuan')(e)
  }

  const handleQuickAddCategory = async () => {
    const nama = quickCategoryName.trim()
    if (!nama) {
      setQuickCategoryError(t('product.quick_add_name_required'))
      return
    }

    setQuickCategorySaving(true)
    setQuickCategoryError('')
    const res = await createCategoryQuick({ nama })
    setQuickCategorySaving(false)

    if (!res.ok) {
      setQuickCategoryError(res.error || t('product.quick_add_failed'))
      return
    }

    setCategoryDialogOpen(false)
  }

  const handleQuickAddUnit = async () => {
    const nama = quickUnitName.trim()
    const singkatan = quickUnitAbbr.trim()

    if (!nama) {
      setQuickUnitError(t('product.quick_add_name_required'))
      return
    }
    if (!singkatan) {
      setQuickUnitError(t('product.quick_add_abbr_required'))
      return
    }

    setQuickUnitSaving(true)
    setQuickUnitError('')
    const res = await createUnitQuick({ nama, singkatan })
    setQuickUnitSaving(false)

    if (!res.ok) {
      setQuickUnitError(res.error || t('product.quick_add_failed'))
      return
    }

    setUnitDialogOpen(false)
  }

  if (loading) {
    return (
      <PageLayout
        breadcrumbs={[
          { label: t('product.breadcrumb'), path: '/produk/list' },
          { label: t('product.edit_title') }
        ]}
        title={t('product.edit_title')}
      >
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 2.5,
                mb: 2.5
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={48}
                  sx={{ mb: 2, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                />
              ))}
            </Box>
          </Box>
          <Box sx={{ width: 272, flexShrink: 0 }}>
            <Skeleton
              variant="rounded"
              height={180}
              sx={{ mb: 2, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
            />
            <Skeleton
              variant="rounded"
              height={96}
              sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
            />
          </Box>
        </Box>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: t('product.breadcrumb'), path: '/produk/list' },
        { label: t('product.edit_title') }
      ]}
      title={t('product.edit_title')}
      actions={
        <>
          <Button
            size="medium"
            startIcon={<DeleteOutlineRounded sx={{ fontSize: 15 }} />}
            onClick={() => setDeleteOpen(true)}
            sx={dangerBtn}
          >
            {t('product.delete_title')}
          </Button>
          <Button size="medium" onClick={() => navigate('/produk/list')} sx={ghostBtn}>
            {t('common.cancel')}
          </Button>
          <Button
            size="medium"
            variant="contained"
            startIcon={saving ? null : <SaveRounded sx={{ fontSize: 15 }} />}
            onClick={handleSubmit}
            disabled={saving}
            sx={primaryBtn}
          >
            {saving ? <CircularProgress size={16} color="inherit" /> : t('common.save_changes')}
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* LEFT: single merged form card */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SectionCard title={t('product.form_section_info')}>
            {/* Kategori (8) + Satuan (4) */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <FormControl size="medium" sx={{ ...inputSx, flex: 8 }}>
                <InputLabel>{t('product.select_category')}</InputLabel>
                <Select
                  label={t('product.select_category')}
                  value={form.kategori}
                  onChange={handleCategorySelect}
                  MenuProps={menuPaperSx}
                  sx={selectInnerSx}
                >
                  <MenuItem value="">— {t('product.select_category')} —</MenuItem>
                  <MenuItem value={ADD_CATEGORY_VALUE}>
                    {t('product.quick_add_category_cta')}
                  </MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.nama}>
                      {c.nama}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="medium" sx={{ ...inputSx, flex: 4 }}>
                <InputLabel>{t('product.select_unit')}</InputLabel>
                <Select
                  label={t('product.select_unit')}
                  value={form.satuan}
                  onChange={handleUnitSelect}
                  MenuProps={menuPaperSx}
                  sx={selectInnerSx}
                >
                  <MenuItem value="">— {t('product.select_unit')} —</MenuItem>
                  <MenuItem value={ADD_UNIT_VALUE}>{t('product.quick_add_unit_cta')}</MenuItem>
                  {units.map((u) => (
                    <MenuItem key={u.id} value={u.nama}>
                      {u.nama}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Nama (8) + Kode (4) */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <FormControl size="medium" sx={{ ...inputSx, flex: 8 }}>
                <TextField
                  label={t('product.col_name')}
                  size="medium"
                  fullWidth
                  required
                  value={form.nama}
                  onChange={handleChange('nama')}
                  error={Boolean(errors.nama)}
                  helperText={errors.nama || ' '}
                  sx={inputSx}
                />
              </FormControl>
              <FormControl size="medium" sx={{ ...inputSx, flex: 4 }}>
                <TextField
                  label={t('product.col_code')}
                  size="medium"
                  fullWidth
                  disabled
                  value={form.kode}
                  helperText={t('product.code_locked')}
                  sx={inputSx}
                />
              </FormControl>
            </Stack>

            {/* Harga Beli + Harga Jual */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <FormControl size="medium" sx={{ ...inputSx, flex: 1 }}>
                <InputLabel htmlFor="edit-harga-beli">{t('product.purchase_price')}</InputLabel>
                <OutlinedInput
                  id="edit-harga-beli"
                  label={t('product.purchase_price')}
                  type="text"
                  value={form.harga_beli}
                  onChange={handleChange('harga_beli')}
                  startAdornment={
                    <InputAdornment position="start">
                      <Typography sx={rpAdornmentSx}>Rp</Typography>
                    </InputAdornment>
                  }
                />
              </FormControl>

              <FormControl size="medium" sx={{ ...inputSx, flex: 1 }}>
                <InputLabel htmlFor="edit-harga-jual">{t('product.col_price')}</InputLabel>
                <OutlinedInput
                  id="edit-harga-jual"
                  label={t('product.col_price')}
                  type="text"
                  value={form.harga_jual}
                  onChange={handleChange('harga_jual')}
                  startAdornment={
                    <InputAdornment position="start">
                      <Typography sx={rpAdornmentSx}>Rp</Typography>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Stack>

            {/* Stok + Minimal Stok */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <TextField
                label={t('product.current_stock')}
                size="medium"
                type="text"
                fullWidth
                value={form.stok}
                onChange={handleChange('stok')}
                sx={inputSx}
              />
              <TextField
                label={t('product.min_stock')}
                size="medium"
                type="text"
                fullWidth
                value={form.min_stok}
                onChange={handleChange('min_stok')}
                sx={inputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t('product.min_stock_hint')} placement="top">
                        <InfoOutlined sx={{ color: 'text.disabled', fontSize: 16 }} />
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
              />
            </Stack>

            {/* Barcode */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <TextField
                label={t('product.barcode_sku')}
                size="medium"
                fullWidth
                value={form.barcode}
                onChange={handleChange('barcode')}
                placeholder={t('product.barcode_placeholder')}
                sx={inputSx}
              />
            </Stack>

            <TextField
              label={t('common.description')}
              size="medium"
              fullWidth
              multiline
              minRows={3}
              value={form.deskripsi}
              onChange={handleChange('deskripsi')}
              sx={inputSx}
            />

            {errors.general && (
              <Typography
                sx={{
                  mt: 1.5,
                  color: 'error.main',
                  fontSize: 12,
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {errors.general}
              </Typography>
            )}
          </SectionCard>

          {/* ── Modifier / Pilihan Tambahan ───────────────────────────────── */}
          <SectionCard title={t('product.modifier_section')}>
            {modifierGroups.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 3,
                  gap: 1
                }}
              >
                <TuneRounded sx={{ fontSize: 28, color: 'text.disabled' }} />
                <Typography
                  sx={{
                    color: 'text.disabled',
                    fontSize: 12,
                    fontFamily: 'Poppins, sans-serif',
                    textAlign: 'center'
                  }}
                >
                  {t('product.no_modifier')}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.disabled',
                    fontSize: 11,
                    fontFamily: 'Poppins, sans-serif',
                    textAlign: 'center'
                  }}
                >
                  {t('product.no_modifier_hint')}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {modifierGroups.map((g) => {
                  const active = selectedModifierIds.includes(g.id)
                  return (
                    <Box
                      key={g.id}
                      onClick={() => toggleModifier(g.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.25,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                        bgcolor: active
                          ? alpha(theme.palette.primary.main, 0.06)
                          : theme.palette.custom.inputBg,
                        transition: 'all 0.15s',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.04)
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          flexShrink: 0,
                          border: `2px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                          bgcolor: active ? theme.palette.primary.main : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {active && (
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#fff' }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: active ? 'primary.main' : 'text.primary',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        >
                          {g.nama}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: 'text.disabled',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        >
                          {g.tipe === 'single'
                            ? t('modifier.type_single')
                            : t('modifier.type_multiple')}{' '}
                          · {g.options?.length ?? 0} opsi{g.wajib ? ` · ${t('pos.required')}` : ''}
                        </Typography>
                      </Box>
                      {g.wajib ? (
                        <Chip
                          label={t('pos.required')}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 10,
                            fontWeight: 600,
                            fontFamily: 'inherit',
                            bgcolor: 'rgba(211,47,47,0.1)',
                            color: 'error.main',
                            border: '1px solid rgba(211,47,47,0.3)'
                          }}
                        />
                      ) : null}
                    </Box>
                  )
                })}
              </Box>
            )}
          </SectionCard>
        </Box>

        {/* RIGHT: sidebar */}
        <Box sx={{ width: 272, flexShrink: 0 }}>
          {/* Foto Produk */}
          <SectionCard title={`${t('product.photo_section')} (${images.length}/10)`}>
            <Box
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => images.length < 10 && fileInputRef.current?.click()}
              sx={{
                border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: dragOver
                  ? alpha(theme.palette.primary.main, 0.06)
                  : theme.palette.custom.inputBg,
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                cursor: images.length < 10 ? 'pointer' : 'default',
                transition: 'all 0.15s',
                '&:hover':
                  images.length < 10
                    ? {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                      }
                    : {}
              }}
            >
              <AddPhotoAlternateRounded
                sx={{
                  fontSize: 32,
                  color: dragOver ? theme.palette.primary.main : 'text.disabled',
                  transition: 'color 0.15s'
                }}
              />

              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 12,
                  fontFamily: 'Poppins, sans-serif',
                  textAlign: 'center',
                  lineHeight: 1.5
                }}
              >
                {images.length >= 10
                  ? t('product.photo_max')
                  : dragOver
                    ? t('product.photo_drop')
                    : t('product.photo_drag')}
              </Typography>

              {images.length < 10 && (
                <Typography
                  sx={{
                    color: 'text.disabled',
                    fontSize: 11,
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {t('product.photo_click')}
                </Typography>
              )}
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                addImages(e.target.files)
                e.target.value = ''
              }}
            />

            {images.length > 0 && (
              <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {images.map((img, idx) => (
                  <Tooltip key={img.id} title={img.name} placement="top">
                    <Box
                      sx={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover .del-btn': { opacity: 1 }
                      }}
                    >
                      {idx === 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            zIndex: 2,
                            bgcolor: theme.palette.primary.main,
                            borderRadius: 0.75,
                            px: 0.6,
                            py: 0.2
                          }}
                        >
                          <Typography
                            sx={{
                              color: '#fff',
                              fontSize: 9,
                              fontFamily: 'Poppins, sans-serif',
                              fontWeight: 700,
                              lineHeight: 1
                            }}
                          >
                            {t('product.photo_cover')}
                          </Typography>
                        </Box>
                      )}

                      <Box
                        component="img"
                        src={img.url}
                        alt={img.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      <Box
                        className="del-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(img.id)
                        }}
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(0,0,0,0.52)',
                          opacity: 0,
                          transition: 'opacity 0.15s',
                          cursor: 'pointer'
                        }}
                      >
                        <DeleteRounded sx={{ fontSize: 18, color: '#fff' }} />
                      </Box>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            )}

            {images.length > 0 && (
              <Typography
                sx={{
                  mt: 1,
                  color: 'text.disabled',
                  fontSize: 10,
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {t('product.photo_cover_hint')}
              </Typography>
            )}
          </SectionCard>

          {/* Status Produk */}
          <SectionCard title={t('product.status_section')}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontSize: 13,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600
                  }}
                >
                  {form.aktif
                    ? t('product.status_active_label')
                    : t('product.status_inactive_label')}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.disabled',
                    fontSize: 11,
                    fontFamily: 'Poppins, sans-serif',
                    mt: 0.3
                  }}
                >
                  {form.aktif ? t('product.status_active_desc') : t('product.status_inactive_desc')}
                </Typography>
              </Box>

              <Switch
                checked={form.aktif}
                onChange={handleToggleAktif}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: theme.palette.primary.main },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: theme.palette.primary.main
                  }
                }}
              />
            </Box>

            <Box
              sx={{
                mt: 1.5,
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                bgcolor: form.aktif
                  ? alpha(theme.palette.success?.main ?? '#4caf50', 0.1)
                  : alpha(theme.palette.text.disabled, 0.08),
                border: `1px solid ${form.aktif ? alpha(theme.palette.success?.main ?? '#4caf50', 0.3) : theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: form.aktif
                    ? (theme.palette.success?.main ?? '#4caf50')
                    : 'text.disabled',
                  flexShrink: 0
                }}
              />
              <Typography
                sx={{
                  color: form.aktif ? (theme.palette.success?.main ?? '#4caf50') : 'text.disabled',
                  fontSize: 11,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600
                }}
              >
                {form.aktif ? t('product.status_active_label') : t('product.status_inactive_label')}
              </Typography>
            </Box>
          </SectionCard>
        </Box>
      </Box>

      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#1a1f2c' : '#ffffff',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            minWidth: 360
          }
        }}
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
          {t('product.quick_add_category')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('category.col_name')}
            value={quickCategoryName}
            onChange={(e) => setQuickCategoryName(e.target.value)}
            error={Boolean(quickCategoryError)}
            helperText={quickCategoryError || ' '}
            sx={{ ...inputSx, mt: 0.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setCategoryDialogOpen(false)}
            sx={{ fontSize: 13, textTransform: 'none', color: 'text.secondary', borderRadius: 2 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleQuickAddCategory}
            disabled={quickCategorySaving}
            sx={{ ...primaryBtn, px: 1.75 }}
          >
            {quickCategorySaving ? <CircularProgress size={16} color="inherit" /> : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={unitDialogOpen}
        onClose={() => setUnitDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#1a1f2c' : '#ffffff',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            minWidth: 360
          }
        }}
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
          {t('product.quick_add_unit')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <TextField
              fullWidth
              label={t('unit.col_name')}
              value={quickUnitName}
              onChange={(e) => setQuickUnitName(e.target.value)}
              sx={inputSx}
            />
            <TextField
              fullWidth
              label={t('unit.abbreviation')}
              value={quickUnitAbbr}
              onChange={(e) => setQuickUnitAbbr(e.target.value)}
              error={Boolean(quickUnitError)}
              helperText={quickUnitError || ' '}
              sx={inputSx}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setUnitDialogOpen(false)}
            sx={{ fontSize: 13, textTransform: 'none', color: 'text.secondary', borderRadius: 2 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleQuickAddUnit}
            disabled={quickUnitSaving}
            sx={{ ...primaryBtn, px: 1.75 }}
          >
            {quickUnitSaving ? <CircularProgress size={16} color="inherit" /> : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirm dialog ──────────────────────────────────────── */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#1a1f2c' : '#ffffff',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
          {t('product.delete_title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13, fontFamily: 'Poppins, sans-serif' }}>
            {t('product.delete_confirm', { name: form.nama })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            size="small"
            onClick={() => setDeleteOpen(false)}
            sx={{ fontSize: 13, textTransform: 'none', color: 'text.secondary', borderRadius: 2 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleDelete}
            sx={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              bgcolor: 'error.main',
              '&:hover': { bgcolor: 'error.dark' }
            }}
          >
            {t('common.yes_delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  )
}
