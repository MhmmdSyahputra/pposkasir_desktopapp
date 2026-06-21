import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tabs,
  Tab
} from '@mui/material'
import {
  RestartAltRounded,
  SaveRounded,
  PrintRounded,
  CheckCircleRounded,
  ComputerRounded
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../productPage/components/PageLayout'
import { useNotifier } from '../../components/core/notificationProvider'
import {
  defaultReceiptSettings,
  receiptSettingsService
} from '../../services/receiptSettingsService'
import { ReceiptPreview } from '../../components/core/receiptPreview'

/* eslint-disable react/prop-types */
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
  const { show } = useNotifier()
  const [form, setForm] = useState(defaultReceiptSettings)
  const [printingTest, setPrintingTest] = useState(false)
  const [printers, setPrinters] = useState([])
  const [loadingPrinters, setLoadingPrinters] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const fetchPrinters = async () => {
    try {
      setLoadingPrinters(true)
      const result = await window.api.systemPrinter.getSystemPrinters()
      if (result.success) {
        setPrinters(result.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingPrinters(false)
    }
  }

  const handleSetDefaultPrinter = async (printerName) => {
    try {
      const result = await window.api.systemPrinter.setSystemDefaultPrinter(printerName)
      if (result.success) {
        show({
          message: `Printer ${printerName} berhasil di set sebagai default`,
          severity: 'success'
        })
        fetchPrinters()
      } else {
        show({ message: result.error || 'Gagal mengubah default printer', severity: 'error' })
      }
    } catch (err) {
      show({ message: err.message, severity: 'error' })
    }
  }

  const handleTestPrintSystem = async (printerName) => {
    try {
      const result = await window.api.systemPrinter.testPrintSystem(printerName)
      if (result.success) {
        show({ message: `Test page dikirim ke ${printerName}`, severity: 'success' })
      } else {
        show({ message: result.error || 'Gagal melakukan test print', severity: 'error' })
      }
    } catch (err) {
      show({ message: err.message, severity: 'error' })
    }
  }

  useEffect(() => {
    if (form.printerType === 'system') {
      fetchPrinters()
    }
  }, [form.printerType])

  const handlePrinterTypeChange = (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, printerType: value }))
  }

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

  const handlePrintTestReceipt = async () => {
    setPrintingTest(true)
    try {
      const visibility = form.visibility || {}

      const itemsHtml = [
        { name: 'Nasi Goreng Spesial', qtyText: '1 x Rp22.000', subtotal: 'Rp22.000' },
        { name: 'Es Teh Manis', qtyText: '1 x Rp6.000', subtotal: 'Rp6.000' }
      ]
        .map(
          (item) => `
            <div class="item">
              <div class="item-name">${item.name}</div>
              <div class="item-row">
                <span>${item.qtyText}</span>
                <span>${item.subtotal}</span>
              </div>
            </div>`
        )
        .join('')

      const infoHtml = [
        ['No. Transaksi', 'TEST-0001', visibility.orderNumber],
        ['Tanggal', new Date().toLocaleString(), visibility.date],
        ['Kasir', 'System Test', visibility.cashier]
      ]
        .filter((row) => row[2])
        .map(
          ([label, value]) =>
            `<div class="item-row"><span>${label}</span><span>${value}</span></div>`
        )
        .join('')

      const totalHtml = [
        ['Subtotal', 'Rp28.000', visibility.subtotal],
        ['Diskon', 'Rp2.000', visibility.discount],
        ['TOTAL', 'Rp26.000', visibility.total, true],
        ['Bayar', 'Rp30.000', visibility.cash],
        ['Kembalian', 'Rp4.000', visibility.change]
      ]
        .filter((row) => row[2])
        .map(
          ([label, value, , emph]) =>
            `<div class="item-row" style="${emph ? 'font-weight: bold; font-size: 13px; margin: 4px 0;' : ''}"><span>${label}</span><span>${value}</span></div>`
        )
        .join('')

      const contentHTML = `
        <div style="font-size: 11px;">
          ${infoHtml}
        </div>
        <div class="line"></div>
        <div>
          ${itemsHtml}
        </div>
        <div class="line"></div>
        <div>
          ${totalHtml}
        </div>
      `

      const payload = {
        header1: visibility.headerLine1 ? form.headerLine1 : '',
        header2: visibility.headerLine2 ? form.headerLine2 : '',
        header3: visibility.headerLine3 ? form.headerLine3 : '',
        contentHTML,
        footer1: visibility.footerLine1 ? form.footerLine1 : '',
        footer2: visibility.footerLine2 ? form.footerLine2 : '',
        footer3: visibility.footerLine3 ? form.footerLine3 : '',
        paperSize: form.paperSize || '80mm',
        paddingLeft: form.paddingLeft || 0,
        paddingRight: form.paddingRight || 0,
        headerAlign: form.headerAlign || 'center',
        footerAlign: form.footerAlign || 'center',
        printerType: form.printerType || 'thermal'
      }

      await window.api.printOrderReceipt(payload)
      show({
        message: t('receipt_settings.test_receipt_success'),
        severity: 'success'
      })
    } catch (err) {
      show({
        message: t('receipt_settings.test_receipt_failed', { error: err.message }),
        severity: 'error'
      })
    } finally {
      setPrintingTest(false)
    }
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
          <Button
            startIcon={<RestartAltRounded />}
            onClick={handleReset}
            sx={{ textTransform: 'none' }}
          >
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
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ minHeight: 40 }}>
                <Tab
                  label="Pengaturan Struk"
                  sx={{ textTransform: 'none', minHeight: 40, fontWeight: 600 }}
                />
                <Tab
                  label="Daftar Printer Windows"
                  sx={{ textTransform: 'none', minHeight: 40, fontWeight: 600 }}
                />
              </Tabs>
            </Box>

            {activeTab === 0 && (
              <Stack spacing={2}>
                <SectionCard
                  title={t('receipt_settings.printer_settings_title')}
                  subtitle={t('receipt_settings.printer_settings_subtitle')}
                >
                  <Stack spacing={2}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{ fontSize: 13, mb: 1, fontWeight: 500 }}>
                        {t('receipt_settings.printer_type')}
                      </FormLabel>
                      <RadioGroup
                        row
                        value={form.printerType || 'system'}
                        onChange={handlePrinterTypeChange}
                      >
                        <FormControlLabel
                          value="system"
                          control={<Radio size="small" />}
                          label={t('receipt_settings.printer_type_system')}
                          slotProps={{ typography: { fontSize: 13 } }}
                        />
                        <FormControlLabel
                          value="thermal"
                          control={<Radio size="small" />}
                          label={t('receipt_settings.printer_type_thermal')}
                          slotProps={{ typography: { fontSize: 13 } }}
                        />
                      </RadioGroup>
                    </FormControl>

                    <FormControl component="fieldset" sx={{ mt: 1 }}>
                      <FormLabel component="legend" sx={{ fontSize: 13, mb: 1, fontWeight: 500 }}>
                        Ukuran Kertas (Lebar Printer)
                      </FormLabel>
                      <RadioGroup
                        row
                        value={form.paperSize || '80mm'}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, paperSize: e.target.value }))
                        }
                      >
                        <FormControlLabel
                          value="80mm"
                          control={<Radio size="small" />}
                          label="80mm"
                          slotProps={{ typography: { fontSize: 13 } }}
                        />
                        <FormControlLabel
                          value="58mm"
                          control={<Radio size="small" />}
                          label="58mm"
                          slotProps={{ typography: { fontSize: 13 } }}
                        />
                      </RadioGroup>
                    </FormControl>

                    <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Jarak Kiri Tambahan (Left) - mm"
                        value={form.paddingLeft ?? 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10)
                          setForm((prev) => ({ ...prev, paddingLeft: isNaN(val) ? 0 : val }))
                        }}
                        slotProps={{
                          htmlInput: { min: 0, max: 50 }
                        }}
                        helperText="Geser isi struk ke kanan"
                      />
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Jarak Kanan Tambahan (Right) - mm"
                        value={form.paddingRight ?? 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10)
                          setForm((prev) => ({ ...prev, paddingRight: isNaN(val) ? 0 : val }))
                        }}
                        slotProps={{
                          htmlInput: { min: 0, max: 50 }
                        }}
                        helperText="Geser isi struk ke kiri"
                      />
                    </Stack>

                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={1.5}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handlePrintTestReceipt}
                          disabled={printingTest}
                          startIcon={
                            printingTest ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <PrintRounded />
                            )
                          }
                          sx={{ textTransform: 'none' }}
                        >
                          {printingTest
                            ? t('receipt_settings.printing_test')
                            : t('receipt_settings.print_test_receipt')}
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </SectionCard>

                <SectionCard
                  title={t('receipt_settings.header_title')}
                  subtitle={t('receipt_settings.header_subtitle')}
                >
                  <Stack spacing={1.25}>
                    <FormControl component="fieldset" sx={{ mb: 1 }}>
                      <FormLabel component="legend" sx={{ fontSize: 13, mb: 1, fontWeight: 500 }}>
                        Perataan Header (Alignment)
                      </FormLabel>
                      <RadioGroup
                        row
                        value={form.headerAlign || 'center'}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, headerAlign: e.target.value }))
                        }
                      >
                        <FormControlLabel
                          value="left"
                          control={<Radio size="small" />}
                          label="Rata Kiri"
                          slotProps={{ typography: { fontSize: 13 } }}
                        />
                        <FormControlLabel
                          value="center"
                          control={<Radio size="small" />}
                          label="Rata Tengah"
                          slotProps={{ typography: { fontSize: 13 } }}
                        />
                        <FormControlLabel
                          value="right"
                          control={<Radio size="small" />}
                          label="Rata Kanan"
                          slotProps={{ typography: { fontSize: 13 } }}
                        />
                      </RadioGroup>
                    </FormControl>

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
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      gap: 1.25
                    }}
                  >
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
                        <Switch
                          checked={form.visibility[row.key]}
                          onChange={handleToggle(row.key)}
                        />
                      </Paper>
                    ))}
                  </Box>
                </SectionCard>

                <SectionCard
                  title={t('receipt_settings.footer_title')}
                  subtitle={t('receipt_settings.footer_subtitle')}
                >
                  <Stack spacing={1.25}>
                    <FormControl component="fieldset" sx={{ mb: 1 }}>
                      <FormLabel component="legend" sx={{ fontSize: 13, mb: 1, fontWeight: 500 }}>
                        Perataan Footer (Alignment)
                      </FormLabel>
                      <RadioGroup
                        row
                        value={form.footerAlign || 'center'}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, footerAlign: e.target.value }))
                        }
                      >
                        <FormControlLabel
                          value="left"
                          control={<Radio size="small" />}
                          label="Rata Kiri"
                          slotProps={{ typography: { fontSize: 13 } }}
                        />
                        <FormControlLabel
                          value="center"
                          control={<Radio size="small" />}
                          label="Rata Tengah"
                          slotProps={{ typography: { fontSize: 13 } }}
                        />
                        <FormControlLabel
                          value="right"
                          control={<Radio size="small" />}
                          label="Rata Kanan"
                          slotProps={{ typography: { fontSize: 13 } }}
                        />
                      </RadioGroup>
                    </FormControl>

                    <TextField
                      size="small"
                      multiline
                      minRows={2}
                      maxRows={4}
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
                      multiline
                      minRows={2}
                      maxRows={4}
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
                      multiline
                      minRows={2}
                      maxRows={4}
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
            )}

            {activeTab === 1 && (
              <Stack spacing={2}>
                <SectionCard
                  title="Daftar Printer Windows"
                  subtitle="Pilih printer yang akan digunakan sebagai default Windows untuk cetak struk"
                >
                  <Box
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        bgcolor: 'action.hover',
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                          Daftar System Printer
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={fetchPrinters}
                        disabled={loadingPrinters}
                        sx={{ textTransform: 'none', fontSize: 12 }}
                      >
                        {loadingPrinters ? 'Memuat...' : 'Refresh'}
                      </Button>
                    </Box>
                    <List sx={{ p: 0, overflow: 'auto' }}>
                      {printers.map((printer, idx) => {
                        const isDefault = printer.isDefault
                        return (
                          <ListItem
                            key={idx}
                            divider={idx !== printers.length - 1}
                            sx={{
                              py: 1.5,
                              px: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: 1,
                              bgcolor: isDefault ? 'success.main' + '0A' : 'transparent'
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <ComputerRounded
                                  sx={{
                                    color: isDefault ? 'success.main' : 'text.secondary',
                                    fontSize: 28
                                  }}
                                />
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      <Typography
                                        sx={{
                                          fontSize: 14,
                                          fontWeight: isDefault ? 700 : 500,
                                          color: isDefault ? 'success.main' : 'text.primary'
                                        }}
                                      >
                                        {printer.name}
                                      </Typography>
                                      {isDefault && (
                                        <Chip
                                          size="small"
                                          label="Default"
                                          color="success"
                                          sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                                        />
                                      )}
                                    </Box>
                                  }
                                  secondary={printer.description || 'System Printer'}
                                  slotProps={{ secondary: { sx: { fontSize: 12 } } }}
                                />
                              </Box>
                              <Stack direction="row" spacing={1}>
                                {!isDefault && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleSetDefaultPrinter(printer.name)}
                                    sx={{
                                      textTransform: 'none',
                                      fontSize: 11,
                                      py: 0.5,
                                      boxShadow: 'none'
                                    }}
                                  >
                                    Set as Default
                                  </Button>
                                )}
                                <Button
                                  size="small"
                                  variant={isDefault ? 'outlined' : 'text'}
                                  color="secondary"
                                  onClick={() => handleTestPrintSystem(printer.name)}
                                  startIcon={<PrintRounded sx={{ fontSize: 14 }} />}
                                  sx={{ textTransform: 'none', fontSize: 11, py: 0.5 }}
                                >
                                  Test Print
                                </Button>
                              </Stack>
                            </Box>
                          </ListItem>
                        )
                      })}
                      {printers.length === 0 && !loadingPrinters && (
                        <ListItem sx={{ py: 3, justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                            Tidak ada printer terdeteksi.
                          </Typography>
                        </ListItem>
                      )}
                    </List>
                  </Box>
                </SectionCard>
              </Stack>
            )}
          </Box>

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
