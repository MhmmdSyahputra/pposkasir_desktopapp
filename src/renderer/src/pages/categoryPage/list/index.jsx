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
  CategoryOutlined,
  DeleteOutlineRounded,
  EditOutlined,
  FileDownloadRounded,
  MoreHorizRounded,
  SearchRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../productPage/components/PageLayout'
import { useListCategory } from './hook/useListCategory'
import { exportRowsToExcel } from '../../../utils/excelExport'

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
      <TableCell colSpan={5} sx={{ ...cellSx, py: 8, textAlign: 'center', borderBottom: 0 }}>
        <CategoryOutlined
          sx={{ fontSize: 44, color: 'text.disabled', display: 'block', mx: 'auto', mb: 1.5 }}
        />
        <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
          {t('category.empty_title')}
        </Typography>
        <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 0.5 }}>
          {t('category.empty_hint')}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

// ── main component ────────────────────────────────────────────────────────
export const ListCategoryPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation()
  const isDark = theme.palette.mode === 'dark'
  const { rows, loading, search, setSearch, deleteCategory } = useListCategory()

  const COLUMNS = [
    { id: 'nama', label: t('category.col_name') },
    { id: 'deskripsi', label: t('category.col_desc') },
    { id: 'status', label: t('common.status'), width: 100, align: 'center' },
    { id: 'aksi', label: '', width: 48, align: 'center' }
  ]

  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuRow, setMenuRow] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const openMenu = (e, row) => {
    setMenuAnchor(e.currentTarget)
    setMenuRow(row)
  }
  const closeMenu = () => setMenuAnchor(null)

  const handleEdit = () => {
    navigate(`/kategori/edit/${menuRow.id}`)
    closeMenu()
  }
  const handleDeleteConfirm = async () => {
    await deleteCategory(menuRow.id)
    setDeleteOpen(false)
    setMenuRow(null)
  }

  const handleExport = () => {
    exportRowsToExcel({
      fileBaseName: 'kategori',
      sheetName: 'Kategori',
      columns: [
        { header: t('category.col_name'), key: 'nama' },
        { header: t('category.col_desc'), key: 'deskripsi', map: (row) => row.deskripsi || '-' },
        {
          header: t('common.status'),
          key: 'aktif',
          map: (row) => (row.aktif ? t('common.active') : t('common.inactive'))
        }
      ],
      rows
    })
  }

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

  return (
    <PageLayout
      breadcrumbs={[
        { label: t('category.breadcrumb_parent'), path: '/produk/list' },
        { label: t('category.breadcrumb') }
      ]}
      title={t('category.page_title')}
      actions={
        <>
          <Button
            size="small"
            startIcon={<FileDownloadRounded sx={{ fontSize: 15 }} />}
            onClick={handleExport}
            sx={ghostBtn}
          >
            {t('common.export_excel')}
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => navigate('/kategori/create')}
            sx={primaryBtn}
          >
            {t('category.add')}
          </Button>
        </>
      }
    >
      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder={t('category.search')}
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
      </Box>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <TableContainer
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table size="small" sx={{ minWidth: 480 }}>
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
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell padding="checkbox" sx={{ ...cellSx, pl: 2 }} />
                  {COLUMNS.map((col) => (
                    <TableCell key={col.id} sx={cellSx}>
                      <Skeleton
                        variant="text"
                        width={col.id === 'nama' ? '50%' : '70%'}
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
                  <TableCell sx={{ ...cellSx, color: 'text.primary', fontWeight: 600 }}>
                    {row.nama}
                  </TableCell>
                  <TableCell sx={{ ...cellSx, color: 'text.disabled' }}>
                    {row.deskripsi || '—'}
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
          {t('common.delete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13, fontFamily: 'Poppins, sans-serif' }}>
            {t('category.delete_confirm', { name: menuRow?.nama })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            size="small"
            onClick={() => setDeleteOpen(false)}
            sx={{
              fontSize: 13,
              textTransform: 'none',
              color: 'text.secondary',
              borderRadius: 2
            }}
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
              color: '#fff',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'error.dark', boxShadow: 'none' }
            }}
          >
            {t('common.yes_delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  )
}
