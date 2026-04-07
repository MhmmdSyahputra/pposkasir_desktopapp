import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { RestartAltRounded, SaveRounded } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../productPage/components/PageLayout'
import { useNotifier } from '../../components/core/notificationProvider'
import {
  defaultReceiptSettings,
  receiptSettingsService
} from '../../services/receiptSettingsService'
import { ReceiptPreview } from '../../components/core/receiptPreview'

const SectionCard = ({ title, subtitle, children, sx }) => {
  const theme = useTheme()

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        ...sx
      }}
    >
      <Box sx={{ px: 2.25, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{title}</Typography>
        {subtitle ? (
          <Typography sx={{ mt: 0.25, fontSize: 12, color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Box sx={{ p: 2.25 }}>{children}</Box>
    </Paper>
  )
}

export const ReceiptSettingsPage = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { show } = useNotifier()
  const [form, setForm] = useState(defaultReceiptSettings)

  useEffect(() => {
    setForm(receiptSettingsService.get())
  }, [])

  const infoRows = useMemo(
    () => [
      { key: 'orderNumber', label: t('receipt_settings.field_order_number'), value: 'TRX-000123' },
      { key: 'date', label: t('receipt_settings.field_date'), value: '07/04/2026 14:35' },
      { key: 'cashier', label: t('receipt_settings.field_cashier'), value: 'adminppos' }
    ],
    [t]
  )

  const totalRows = useMemo(
    () => [
      { key: 'subtotal', label: t('receipt_settings.field_subtotal'), value: 'Rp28.000' },
      { key: 'discount', label: t('receipt_settings.field_discount'), value: 'Rp2.000' },
      { key: 'total', label: t('receipt_settings.field_total'), value: 'Rp26.000' },
      { key: 'cash', label: t('receipt_settings.field_cash'), value: 'Rp30.000' },
      { key: 'change', label: t('receipt_settings.field_change'), value: 'Rp4.000' }
    ],
    [t]
  )

  const handleLineChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleToggle = (field) => (_event, checked) => {
    setForm((prev) => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [field]: checked
      }
    }))
  }

  const handleReset = () => {
    setForm(receiptSettingsService.reset())
    show({ message: t('receipt_settings.reset_success'), severity: 'success' })
  }

  const handleSave = () => {
    const saved = receiptSettingsService.save(form)
    setForm(saved)
    show({
      message: t('receipt_settings.save_success'),
      description: t('receipt_settings.save_note'),
      severity: 'success'
    })
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: t('settings.page_title'), path: '/settings' },
        { label: t('receipt_settings.page_title') }
      ]}
      title={t('receipt_settings.page_title')}
      actions={
        <>
          <Button startIcon={<RestartAltRounded />} onClick={handleReset} sx={{ textTransform: 'none' }}>
            {t('receipt_settings.reset_button')}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveRounded />}
            onClick={handleSave}
            sx={{ textTransform: 'none' }}
          >
            {t('common.save')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Alert severity="info">{t('receipt_settings.page_hint')}</Alert>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(320px, 420px)' },
            gap: 2,
            alignItems: 'start'
          }}
        >
          <Stack spacing={2} sx={{ minWidth: 0 }}>
            <SectionCard
              title={t('receipt_settings.header_title')}
              subtitle={t('receipt_settings.header_subtitle')}
            >
              <Stack spacing={1.25}>
                <TextField
                  size="small"
                  label={t('receipt_settings.header_line_1')}
                  value={form.headerLine1}
                  onChange={handleLineChange('headerLine1')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.visibility.headerLine1}
                      onChange={handleToggle('headerLine1')}
                    />
                  }
                  label={t('receipt_settings.show_this_line')}
                />
                <TextField
                  size="small"
                  label={t('receipt_settings.header_line_2')}
                  value={form.headerLine2}
                  onChange={handleLineChange('headerLine2')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.visibility.headerLine2}
                      onChange={handleToggle('headerLine2')}
                    />
                  }
                  label={t('receipt_settings.show_this_line')}
                />
                <TextField
                  size="small"
                  label={t('receipt_settings.header_line_3')}
                  value={form.headerLine3}
                  onChange={handleLineChange('headerLine3')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.visibility.headerLine3}
                      onChange={handleToggle('headerLine3')}
                    />
                  }
                  label={t('receipt_settings.show_this_line')}
                />
              </Stack>
            </SectionCard>

            <SectionCard
              title={t('receipt_settings.visibility_title')}
              subtitle={t('receipt_settings.visibility_subtitle')}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.25 }}>
                {[...infoRows, ...totalRows].map((row) => (
                  <Paper
                    key={row.key}
                    variant="outlined"
                    sx={{
                      px: 1.25,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography sx={{ fontSize: 13 }}>{row.label}</Typography>
                    <Switch checked={form.visibility[row.key]} onChange={handleToggle(row.key)} />
                  </Paper>
                ))}
              </Box>
            </SectionCard>

            <SectionCard
              title={t('receipt_settings.footer_title')}
              subtitle={t('receipt_settings.footer_subtitle')}
            >
              <Stack spacing={1.25}>
                <TextField
                  size="small"
                  label={t('receipt_settings.footer_line_1')}
                  value={form.footerLine1}
                  onChange={handleLineChange('footerLine1')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.visibility.footerLine1}
                      onChange={handleToggle('footerLine1')}
                    />
                  }
                  label={t('receipt_settings.show_this_line')}
                />
                <TextField
                  size="small"
                  label={t('receipt_settings.footer_line_2')}
                  value={form.footerLine2}
                  onChange={handleLineChange('footerLine2')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.visibility.footerLine2}
                      onChange={handleToggle('footerLine2')}
                    />
                  }
                  label={t('receipt_settings.show_this_line')}
                />
                <TextField
                  size="small"
                  label={t('receipt_settings.footer_line_3')}
                  value={form.footerLine3}
                  onChange={handleLineChange('footerLine3')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.visibility.footerLine3}
                      onChange={handleToggle('footerLine3')}
                    />
                  }
                  label={t('receipt_settings.show_this_line')}
                />
              </Stack>
            </SectionCard>
          </Stack>

          <SectionCard
            title={t('receipt_settings.preview_title')}
            subtitle={t('receipt_settings.preview_subtitle')}
            sx={{
              position: { xs: 'static', lg: 'sticky' },
              top: { lg: 12 },
              alignSelf: 'start'
            }}
          >
            <ReceiptPreview
              settings={form}
              order={{
                orderNumber: 'TRX-000123',
                date: '07/04/2026 14:35',
                cashier: 'adminppos',
                subtotal: 'Rp28.000',
                discount: 'Rp2.000',
                total: 'Rp26.000',
                cash: 'Rp30.000',
                change: 'Rp4.000',
                items: [
                  {
                    key: 'preview-item-1',
                    name: 'Nasi Goreng Spesial',
                    qtyText: '1 x Rp22.000',
                    note: 'Level Pedas: Pedas',
                    subtotal: 'Rp22.000'
                  },
                  {
                    key: 'preview-item-2',
                    name: 'Es Teh Manis',
                    qtyText: '1 x Rp6.000',
                    note: '',
                    subtotal: 'Rp6.000'
                  }
                ],
                labels: {
                  orderNumber: t('receipt_settings.field_order_number'),
                  date: t('receipt_settings.field_date'),
                  cashier: t('receipt_settings.field_cashier'),
                  subtotal: t('receipt_settings.field_subtotal'),
                  discount: t('receipt_settings.field_discount'),
                  total: t('receipt_settings.field_total'),
                  cash: t('receipt_settings.field_cash'),
                  change: t('receipt_settings.field_change')
                }
              }}
            />
          </SectionCard>
        </Box>
      </Stack>
    </PageLayout>
  )
}