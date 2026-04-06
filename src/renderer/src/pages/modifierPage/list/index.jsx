import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
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
  DeleteOutlineRounded,
  EditOutlined,
  ExpandMoreRounded,
  FileDownloadRounded,
  MoreHorizRounded,
  SearchRounded,
  TuneRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../productPage/components/PageLayout'
import { useListModifier } from './hook/useListModifier'
import { exportRowsToExcel } from '../../../utils/excelExport'

const fmtRp = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(n)

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
      <TableCell colSpan={8} sx={{ ...cellSx, py: 8, textAlign: 'center', borderBottom: 0 }}>
        <TuneRounded
          sx={{ fontSize: 44, color: 'text.disabled', display: 'block', mx: 'auto', mb: 1.5 }}
        />
        <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
          {t('modifier.empty_title')}
        </Typography>
        <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 0.5 }}>
          {t('modifier.empty_hint')}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export const ListModifierPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation()
  const isDark = theme.palette.mode === 'dark'
  const { rows, loading, search, setSearch, deleteModifier } = useListModifier()

  const COLUMNS = [
    { id: 'nama', label: t('modifier.col_name') },
    { id: 'tipe', label: t('modifier.col_type'), width: 140 },
    { id: 'wajib', label: t('modifier.col_required'), width: 90, align: 'center' },
    { id: 'opsi', label: t('modifier.col_options'), width: 60, align: 'right' },
    { id: 'aktif', label: t('common.status'), width: 100, align: 'center' },
    { id: 'aksi', label: '', width: 48, align: 'center' }
  ]

  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuRow, setMenuRow] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [expanded, setExpanded] = useState({})

  const openMenu = (e, row) => {
    setMenuAnchor(e.currentTarget)
    setMenuRow(row)
  }
  const closeMenu = () => setMenuAnchor(null)

  const handleEdit = () => {
    navigate(`/modifier/edit/${menuRow.id}`)
    closeMenu()
  }
  const handleDeleteConfirm = async () => {
    await deleteModifier(menuRow.id)
    setDeleteOpen(false)
    setMenuRow(null)
  }

  const handleExport = () => {
    exportRowsToExcel({
      fileBaseName: 'modifier',
      sheetName: 'Modifier',
      columns: [
        { header: t('modifier.col_name'), key: 'nama' },
        {
          header: t('modifier.col_type'),
          key: 'tipe',
          map: (row) =>
            row.tipe === 'single' ? t('modifier.type_single') : t('modifier.type_multiple')
        },
        {
          header: t('modifier.col_required'),
          key: 'wajib',
          map: (row) => (row.wajib ? t('modifier.col_required') : t('pos.optional'))
        },
        {
          header: t('modifier.col_options'),
          key: 'options',
          map: (row) => row.options?.length ?? 0
        },
        {
          header: t('common.status'),
          key: 'aktif',
          map: (row) => (row.aktif ? t('common.active') : t('common.inactive'))
        }
      ],
      rows
    })
  }

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

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
          '&.Mui-selected': { bgcolor: `${theme.palette.primary.main}1f`, color: 'primary.main' }
        }
      }
    }
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: t('modifier.breadcrumb_parent'), path: '/produk/list' },
        { label: t('modifier.breadcrumb') }
      ]}
      title={t('modifier.page_title')}
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
            onClick={() => navigate('/modifier/create')}
            sx={primaryBtn}
          >
            {t('modifier.add')}
          </Button>
        </>
      }
    >
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <TextField
          size="small"
          placeholder={t('modifier.search')}
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

      {/* ── Table ────────────────────────────────────────────────────── */}
      <TableContainer
        sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}
      >
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ ...headCellSx, pl: 2 }}>
                <Checkbox
                  size="small"
                  sx={{ color: 'text.disabled', '&.Mui-checked': { color: 'primary.main' } }}
                />
              </TableCell>
              <TableCell sx={{ ...headCellSx, width: 32 }} />
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
                  <TableCell sx={cellSx} />
                  {COLUMNS.map((col) => (
                    <TableCell key={col.id} sx={cellSx}>
                      <Skeleton
                        variant="text"
                        width="60%"
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
                <>
                  <TableRow
                    key={row.id}
                    sx={{
                      cursor: 'default',
                      '&:hover': { bgcolor: theme.palette.custom.rowHover },
                      '&:last-child td': expanded[row.id] ? {} : { borderBottom: 0 }
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ ...cellSx, pl: 2 }}>
                      <Checkbox
                        size="small"
                        sx={{ color: 'text.disabled', '&.Mui-checked': { color: 'primary.main' } }}
                      />
                    </TableCell>
                    {/* expand toggle */}
                    <TableCell sx={{ ...cellSx, p: '4px 4px 4px 8px', width: 32 }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleExpand(row.id)}
                        sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}
                      >
                        <ExpandMoreRounded
                          fontSize="small"
                          sx={{
                            transition: 'transform 0.2s',
                            transform: expanded[row.id] ? 'rotate(180deg)' : 'none'
                          }}
                        />
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: 'text.primary', fontWeight: 600 }}>
                      {row.nama}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={
                          row.tipe === 'single'
                            ? t('modifier.type_single')
                            : t('modifier.type_multiple')
                        }
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: 'inherit',
                          bgcolor:
                            row.tipe === 'single'
                              ? `${theme.palette.primary.main}1a`
                              : 'rgba(156,39,176,0.12)',
                          color: row.tipe === 'single' ? 'primary.main' : '#9c27b0',
                          border: `1px solid ${row.tipe === 'single' ? `${theme.palette.primary.main}47` : 'rgba(156,39,176,0.35)'}`
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, textAlign: 'center' }}>
                      {row.wajib ? (
                        <Chip
                          label={t('modifier.col_required')}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: 'inherit',
                            bgcolor: 'rgba(211,47,47,0.1)',
                            color: 'error.main',
                            border: '1px solid rgba(211,47,47,0.3)'
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{ fontSize: 12, color: 'text.disabled', fontFamily: 'inherit' }}
                        >
                          {t('pos.optional')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, textAlign: 'right' }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'primary.main',
                          fontFamily: 'inherit'
                        }}
                      >
                        {row.options?.length ?? 0}
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
                          '&:hover': {
                            color: 'text.primary',
                            bgcolor: theme.palette.custom.inputBg
                          }
                        }}
                      >
                        <MoreHorizRounded fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* expanded options list */}
                  <TableRow key={`${row.id}-opts`}>
                    <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                      <Collapse in={!!expanded[row.id]} timeout="auto" unmountOnExit>
                        <Box
                          sx={{
                            px: 3,
                            py: 1.5,
                            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                            borderTop: `1px solid ${theme.palette.divider}`,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1
                          }}
                        >
                          {row.options?.length === 0 ? (
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: 'text.disabled',
                                fontFamily: 'Poppins, sans-serif'
                              }}
                            >
                              {t('modifier.no_options')}
                            </Typography>
                          ) : (
                            row.options?.map((opt) => (
                              <Chip
                                key={opt.id}
                                label={`${opt.emoji ? opt.emoji + ' ' : ''}${opt.nama}${opt.harga_tambah > 0 ? ' +' + fmtRp(opt.harga_tambah) : ''}`}
                                size="small"
                                sx={{
                                  height: 24,
                                  fontSize: 12,
                                  fontFamily: 'Poppins, sans-serif',
                                  bgcolor: theme.palette.custom.inputBg,
                                  color: 'text.primary',
                                  border: `1px solid ${theme.palette.divider}`
                                }}
                              />
                            ))
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Row action menu ──────────────────────────────────────────── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        PaperProps={menuPaperSx.PaperProps}
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

      {/* ── Delete confirm dialog ─────────────────────────────────────── */}
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
          {t('modifier.delete_title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13, fontFamily: 'Poppins, sans-serif' }}>
            {t('modifier.delete_confirm', { name: menuRow?.nama })}
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
