import { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material'
import { FileDownloadRounded, TableViewRounded, InfoOutlined } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../productPage/components/PageLayout'
import { exportRowsToExcel } from '../../utils/excelExport'

export const TemplatePage = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const isDark = theme.palette.mode === 'dark'

  const [openProductModal, setOpenProductModal] = useState(false)
  const [openCategoryModal, setOpenCategoryModal] = useState(false)

  const handleDownloadProductTemplate = () => {
    exportRowsToExcel({
      fileBaseName: 'template_produk',
      sheetName: 'Template',
      columns: [
        { header: 'Kode Produk', key: 'kode' },
        { header: 'Nama Produk', key: 'nama' },
        { header: 'Kategori', key: 'kategori' },
        { header: 'Satuan', key: 'satuan' },
        { header: 'Harga Beli', key: 'harga_beli' },
        { header: 'Harga Jual', key: 'harga_jual' },
        { header: 'Stok', key: 'stok' },
        { header: 'Min Stok', key: 'min_stok' },
        { header: 'Barcode', key: 'barcode' },
        { header: 'Deskripsi', key: 'deskripsi' }
      ],
      rows: []
    })
    setOpenProductModal(false)
  }

  const handleDownloadCategoryTemplate = () => {
    exportRowsToExcel({
      fileBaseName: 'template_kategori',
      sheetName: 'Template',
      columns: [
        { header: 'Nama Kategori', key: 'nama' },
        { header: 'Deskripsi', key: 'deskripsi' }
      ],
      rows: []
    })
    setOpenCategoryModal(false)
  }

  const cardSx = {
    p: 3,
    borderRadius: 3,
    bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
    border: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    transition: 'all 0.2s',
    '&:hover': {
      bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
      borderColor: theme.palette.primary.main,
      transform: 'translateY(-2px)'
    }
  }

  const fieldsInfo = [
    { name: 'Kode Produk', req: false, desc: t('template.auto_generated') },
    { name: 'Nama Produk', req: true, desc: t('template.req_name_product') },
    { name: 'Kategori', req: false, desc: t('template.desc_category') },
    { name: 'Satuan', req: false, desc: t('template.desc_unit') },
    { name: 'Harga Beli', req: false, desc: t('template.desc_price') },
    { name: 'Harga Jual', req: false, desc: t('template.desc_price') },
    { name: 'Stok', req: false, desc: t('template.desc_stock') },
    { name: 'Min Stok', req: false, desc: t('template.desc_min_stock') },
    { name: 'Barcode', req: false, desc: t('template.desc_barcode') },
    { name: 'Deskripsi', req: false, desc: t('template.desc_extra') }
  ]

  const categoryFieldsInfo = [
    { name: 'Nama Kategori', req: true, desc: t('template.req_name_category') },
    { name: 'Deskripsi', req: false, desc: t('template.desc_category_info') }
  ]

  return (
    <PageLayout
      breadcrumbs={[{ label: t('template.breadcrumb') }]}
      title={t('template.page_title')}
    >
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 14, color: 'text.secondary', fontFamily: 'Poppins, sans-serif' }}>
          {t('template.description')}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3
        }}
      >
        {/* Template Produk */}
        <Box sx={cardSx}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: `${theme.palette.primary.main}1a`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TableViewRounded sx={{ fontSize: 32, color: 'primary.main' }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
              {t('template.product_title')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.5 }}>
              {t('template.product_desc')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            startIcon={<InfoOutlined />}
            onClick={() => setOpenProductModal(true)}
            sx={{
              mt: 'auto',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: 'none'
            }}
          >
            {t('template.view_detail')}
          </Button>
        </Box>

        {/* Template Kategori */}
        <Box sx={cardSx}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: `${theme.palette.primary.main}1a`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TableViewRounded sx={{ fontSize: 32, color: 'primary.main' }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
              {t('template.category_title')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.5 }}>
              {t('template.category_desc')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            startIcon={<InfoOutlined />}
            onClick={() => setOpenCategoryModal(true)}
            sx={{
              mt: 'auto',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: 'none'
            }}
          >
            {t('template.view_detail')}
          </Button>
        </Box>
      </Box>

      {/* Dialog Info Template Produk */}
      <Dialog
        open={openProductModal}
        onClose={() => setOpenProductModal(false)}
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
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
          {t('template.info_product')}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: theme.palette.divider }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            {t('template.info_desc')}
          </Typography>
          
          <List disablePadding>
            {fieldsInfo.map((field, idx) => (
              <ListItem key={idx} sx={{ px: 0, py: 1, borderBottom: idx !== fieldsInfo.length - 1 ? `1px dashed ${theme.palette.divider}` : 'none' }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                        {field.name}
                      </Typography>
                      <Chip 
                        label={field.req ? t('template.field_required') : t('template.field_optional')} 
                        size="small" 
                        color={field.req ? 'error' : 'default'}
                        variant={field.req ? 'filled' : 'outlined'}
                        sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography sx={{ fontSize: 12, color: 'text.disabled', fontFamily: 'Poppins, sans-serif' }}>
                      {field.desc}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenProductModal(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadRounded />}
            onClick={handleDownloadProductTemplate}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, boxShadow: 'none' }}
          >
            {t('template.download')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Info Template Kategori */}
      <Dialog
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
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
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
          {t('template.info_category')}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: theme.palette.divider }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            {t('template.info_desc')}
          </Typography>
          
          <List disablePadding>
            {categoryFieldsInfo.map((field, idx) => (
              <ListItem key={idx} sx={{ px: 0, py: 1, borderBottom: idx !== categoryFieldsInfo.length - 1 ? `1px dashed ${theme.palette.divider}` : 'none' }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                        {field.name}
                      </Typography>
                      <Chip 
                        label={field.req ? t('template.field_required') : t('template.field_optional')} 
                        size="small" 
                        color={field.req ? 'error' : 'default'}
                        variant={field.req ? 'filled' : 'outlined'}
                        sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography sx={{ fontSize: 12, color: 'text.disabled', fontFamily: 'Poppins, sans-serif' }}>
                      {field.desc}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCategoryModal(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadRounded />}
            onClick={handleDownloadCategoryTemplate}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, boxShadow: 'none' }}
          >
            {t('template.download')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  )
}
