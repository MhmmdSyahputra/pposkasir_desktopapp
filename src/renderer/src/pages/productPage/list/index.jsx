import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Menu,
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
  useTheme
} from '@mui/material'
import {
  AddRounded,
  DeleteOutlineRounded,
  EditOutlined,
  FileDownloadRounded,
  FileUploadRounded,
  MoreHorizRounded,
  SearchRounded,
  Inventory2Outlined,
  VisibilityOutlined
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../components/PageLayout'
import { useListProduct } from './hook/useListProduct'
import { exportRowsToExcel } from '../../../utils/excelExport'

const fmtRp = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(n)

// ── empty state ───────────────────────────────────────────────────────────
const EmptyState = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const cellSx = {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: 'text.secondary',
    fontSize: 13,
    fontFamily: 'Poppins, sans-serif',
    py: 1.25,
    px: 2
  }
  return (
    <TableRow>
      <TableCell colSpan={9} sx={{ ...cellSx, py: 8, textAlign: 'center', borderBottom: 0 }}>
        <Inventory2Outlined
          sx={{ fontSize: 44, color: 'text.disabled', display: 'block', mx: 'auto', mb: 1.5 }}
        />
        <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
          {t('product.empty_title')}
        </Typography>
        <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 0.5 }}>
          {t('product.empty_hint')}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

// ── main component ────────────────────────────────────────────────────────
export const ListProductPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation()
  const isDark = theme.palette.mode === 'dark'

  const COLUMNS = [
    { id: 'kode', label: t('product.col_code'), width: 140 },
    { id: 'nama', label: t('product.col_name') },
    { id: 'kategori', label: t('product.col_category'), width: 140 },
    { id: 'satuan', label: t('product.col_unit'), width: 90 },
    { id: 'harga_jual', label: t('product.col_price'), width: 140, align: 'right' },
    { id: 'stok', label: t('product.col_stock'), width: 80, align: 'right' },
    { id: 'status', label: t('product.col_status'), width: 100, align: 'center' },
    { id: 'aksi', label: '', width: 48, align: 'center' }
  ]

  const { rows, loading, search, setSearch, kategori, setKategori, categories, deleteProduct } =
    useListProduct()

  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuRow, setMenuRow] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const openMenu = (e, row) => {
    setMenuAnchor(e.currentTarget)
    setMenuRow(row)
  }
  const closeMenu = () => setMenuAnchor(null)

  const handleEdit = () => {
    navigate(`/produk/edit/${menuRow.id}`)
    closeMenu()
  }

  const handleOpenDetail = () => {
    setDetailOpen(true)
    closeMenu()
  }

  const parseImages = (imagesRaw) => {
    if (!imagesRaw) return []
    if (Array.isArray(imagesRaw)) return imagesRaw

    try {
      const parsed = JSON.parse(imagesRaw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const detailImages = parseImages(menuRow?.images)
  const handleDeleteConfirm = async () => {
    await deleteProduct(menuRow.id)
    setDeleteOpen(false)
    setMenuRow(null)
  }

  const handleExport = () => {
    exportRowsToExcel({
      fileBaseName: 'produk',
      sheetName: 'Produk',
      columns: [
        { header: t('product.col_code'), key: 'kode' },
        { header: t('product.col_name'), key: 'nama' },
        { header: t('product.col_category'), key: 'kategori' },
        { header: t('product.col_unit'), key: 'satuan' },
        { header: t('product.col_price'), key: 'harga_jual' },
        { header: t('product.col_stock'), key: 'stok' },
        {
          header: t('product.col_status'),
          key: 'aktif',
          map: (row) => (row.aktif ? t('common.active') : t('common.inactive'))
        }
      ],
      rows
    })
  }

  // ── dynamic styles ──────────────────────────────────────────────────────
  const cellSx = {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: 'text.secondary',
    fontSize: 13,
    fontFamily: 'Poppins, sans-serif',
    py: 1.25,
    px: 2
  }

  const headCellSx = {
    ...cellSx,
    bgcolor: isDark ? '#0c1018' : theme.palette.custom.subtle,
    color: 'text.disabled',
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap'
  }

  const menuPaperSx = {
    PaperProps: {
      sx: {
        bgcolor: isDark ? '#1a1f2c' : '#ffffff',
        border: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
        fontSize: 13,
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

  const selectSx = {
    minWidth: 160,
    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
    borderRadius: 2,
    '& .MuiSelect-select': {
      py: '7.5px',
      fontSize: 13,
      color: 'text.primary',
      fontFamily: 'Poppins, sans-serif'
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.custom.inputBorderHover
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: t('product.breadcrumb'), path: '/produk/list' },
        { label: t('product.page_title') }
      ]}
      title={t('product.page_title')}
      actions={
        <>
          <Button
            size="small"
            startIcon={<FileDownloadRounded sx={{ fontSize: 15 }} />}
            sx={ghostBtn}
            onClick={handleExport}
          >
            {t('common.export_excel')}
          </Button>
          <Button
            size="small"
            startIcon={<FileUploadRounded sx={{ fontSize: 15 }} />}
            sx={ghostBtn}
          >
            {t('product.import')}
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => navigate('/produk/create')}
            sx={primaryBtn}
          >
            {t('product.add')}
          </Button>
        </>
      }
    >
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder={t('product.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ fontSize: 17, color: 'text.disabled' }} />
              </InputAdornment>
            )
          }}
          sx={{
            width: 260,
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.custom.inputBg,
              borderRadius: 2,
              '& fieldset': { borderColor: theme.palette.custom.inputBorder },
              '&:hover fieldset': { borderColor: theme.palette.custom.inputBorderHover },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
            },
            '& input': {
              color: 'text.primary',
              fontSize: 13,
              fontFamily: 'Poppins, sans-serif'
            },
            '& input::placeholder': { color: 'text.disabled', opacity: 1 }
          }}
        />

        <Select
          size="small"
          displayEmpty
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          renderValue={(v) => (v === '' ? t('product.all_categories') : v)}
          MenuProps={menuPaperSx}
          sx={selectSx}
        >
          <MenuItem value="">{t('product.all_categories')}</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.nama}>
              {c.nama}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <TableContainer
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ ...headCellSx, pl: 2 }}>
                <Checkbox
                  size="small"
                  sx={{ color: 'text.disabled', '&.Mui-checked': { color: 'primary.main' } }}
                />
              </TableCell>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align ?? 'left'}
                  sx={{ ...headCellSx, width: col.width ?? 'auto' }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell padding="checkbox" sx={{ ...cellSx, pl: 2 }} />
                  {COLUMNS.map((col) => (
                    <TableCell key={col.id} sx={cellSx}>
                      <Skeleton
                        variant="text"
                        width={col.id === 'nama' ? '70%' : '55%'}
                        sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <EmptyState />
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    cursor: 'default',
                    '&:hover': { bgcolor: theme.palette.custom.rowHover },
                    '&:last-child td': { borderBottom: 0 }
                  }}
                >
                  <TableCell padding="checkbox" sx={{ ...cellSx, pl: 2 }}>
                    <Checkbox
                      size="small"
                      sx={{ color: 'text.disabled', '&.Mui-checked': { color: 'primary.main' } }}
                    />
                  </TableCell>
                  <TableCell sx={{ ...cellSx, color: 'text.disabled' }}>{row.kode}</TableCell>
                  <TableCell sx={{ ...cellSx, color: 'text.primary', fontWeight: 600 }}>
                    {row.nama}
                  </TableCell>
                  <TableCell sx={cellSx}>{row.kategori}</TableCell>
                  <TableCell sx={{ ...cellSx, textTransform: 'uppercase', fontSize: 11 }}>
                    {row.satuan}
                  </TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'right' }}>
                    {fmtRp(row.harga_jual)}
                  </TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'right' }}>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: 'inherit',
                        color:
                          row.stok <= 5
                            ? 'error.main'
                            : row.stok <= 20
                              ? 'warning.main'
                              : 'primary.main'
                      }}
                    >
                      {row.stok}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'center' }}>
                    <Chip
                      label={row.aktif ? t('common.active') : t('common.inactive')}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        bgcolor: row.aktif
                          ? `${theme.palette.primary.main}1a`
                          : theme.palette.custom.inputBg,
                        color: row.aktif ? 'primary.main' : 'text.disabled',
                        border: `1px solid ${row.aktif ? `${theme.palette.primary.main}47` : theme.palette.divider}`
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'center', p: '4px 8px' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => openMenu(e, row)}
                      sx={{
                        color: 'text.disabled',
                        '&:hover': { color: 'text.primary', bgcolor: theme.palette.custom.inputBg }
                      }}
                    >
                      <MoreHorizRounded fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* ── Row action menu ─────────────────────────────────────── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#1a1f2c' : '#ffffff',
            border: `1px solid ${theme.palette.divider}`,
            minWidth: 140,
            '& .MuiMenuItem-root': {
              fontSize: 13,
              fontFamily: 'Poppins, sans-serif',
              gap: 1.25,
              '&:hover': { bgcolor: `${theme.palette.primary.main}14` }
            }
          }
        }}
      >
        <MenuItem onClick={handleOpenDetail}>
          <VisibilityOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
          {t('product.detail_action')}
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteOpen(true)
            closeMenu()
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteOutlineRounded sx={{ fontSize: 16 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* ── Product detail dialog ────────────────────────────────── */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#1a1f2c' : '#ffffff',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
          {t('product.detail_title')}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
              mt: 0.5
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {t('product.col_code')}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{menuRow?.kode || '-'}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {t('product.col_name')}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{menuRow?.nama || '-'}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {t('product.col_category')}
              </Typography>
              <Typography sx={{ fontSize: 13 }}>{menuRow?.kategori || '-'}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {t('product.col_unit')}
              </Typography>
              <Typography sx={{ fontSize: 13, textTransform: 'uppercase' }}>
                {menuRow?.satuan || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {t('product.col_price')}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {fmtRp(menuRow?.harga_jual || 0)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {t('product.purchase_price')}
              </Typography>
              <Typography sx={{ fontSize: 13 }}>{fmtRp(menuRow?.harga_beli || 0)}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {t('product.col_stock')}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{menuRow?.stok ?? 0}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {t('product.min_stock')}
              </Typography>
              <Typography sx={{ fontSize: 13 }}>{menuRow?.min_stok ?? 0}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {t('product.barcode_sku')}
              </Typography>
              <Typography sx={{ fontSize: 13 }}>{menuRow?.barcode || '-'}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {t('product.col_status')}
              </Typography>
              <Typography sx={{ fontSize: 13 }}>
                {menuRow?.aktif ? t('common.active') : t('common.inactive')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
              {t('common.description')}
            </Typography>
            <Typography sx={{ fontSize: 13, mt: 0.5 }}>{menuRow?.deskripsi || '-'}</Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: 11, color: 'text.disabled', mb: 1 }}>
              {t('product.photo_section')}
            </Typography>
            {detailImages.length === 0 ? (
              <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>-</Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {detailImages.map((img, idx) => (
                  <Box
                    key={`${img}-${idx}`}
                    component="img"
                    src={`ppos://localhost/${img}`}
                    alt={`product-${idx + 1}`}
                    sx={{
                      width: 74,
                      height: 74,
                      borderRadius: 1,
                      objectFit: 'cover',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button size="small" onClick={() => setDetailOpen(false)} sx={{ textTransform: 'none' }}>
            {t('common.cancel')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirm dialog ────────────────────────────────── */}
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
            {t('product.delete_confirm', { name: menuRow?.nama })}
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
            onClick={handleDeleteConfirm}
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
