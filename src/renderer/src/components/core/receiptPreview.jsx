/* eslint-disable react/prop-types */
import { Box, Divider, Typography, useTheme } from '@mui/material'
import { ReceiptLongOutlined } from '@mui/icons-material'

export const ReceiptPreview = ({ settings, order, compact = false }) => {
  const theme = useTheme()
  const visibility = settings?.visibility || {}
  const infoRows = [
    { key: 'orderNumber', label: order.labels.orderNumber, value: order.orderNumber },
    { key: 'date', label: order.labels.date, value: order.date },
    { key: 'cashier', label: order.labels.cashier, value: order.cashier }
  ]
  const totalRows = [
    { key: 'subtotal', label: order.labels.subtotal, value: order.subtotal },
    { key: 'discount', label: order.labels.discount, value: order.discount },
    { key: 'total', label: order.labels.total, value: order.total },
    { key: 'cash', label: order.labels.cash, value: order.cash },
    { key: 'change', label: order.labels.change, value: order.change }
  ].filter((row) => row.value && row.value !== 'Rp0')

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px dashed ${theme.palette.divider}`,
        bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#fcfcfc',
        p: compact ? 1.75 : 2,
        fontFamily: 'monospace'
      }}
    >
      <Box sx={{ textAlign: 'center', pb: 1.5 }}>
        {visibility.headerLine1 && settings.headerLine1 ? (
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{settings.headerLine1}</Typography>
        ) : null}
        {visibility.headerLine2 && settings.headerLine2 ? (
          <Typography sx={{ fontSize: 12 }}>{settings.headerLine2}</Typography>
        ) : null}
        {visibility.headerLine3 && settings.headerLine3 ? (
          <Typography sx={{ fontSize: 12 }}>{settings.headerLine3}</Typography>
        ) : null}
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {infoRows
        .filter((row) => visibility[row.key] && row.value)
        .map((row) => (
          <Box
            key={row.key}
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6, gap: 1 }}
          >
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{row.label}</Typography>
            <Typography sx={{ fontSize: 12 }}>{row.value}</Typography>
          </Box>
        ))}

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ mb: 1 }}>
        {order.items.map((item) => (
          <Box
            key={item.key}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'start',
              gap: 1,
              mb: 0.9
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{item.name}</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>
                {item.qtyText}
              </Typography>
              {item.note ? (
                <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25, pl: 1 }}>
                  - {item.note}
                </Typography>
              ) : null}
            </Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{item.subtotal}</Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {totalRows
        .filter((row) => visibility[row.key])
        .map((row) => {
          const isGrandTotal = row.key === 'total'
          return (
            <Box
              key={row.key}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.7,
                gap: 1
              }}
            >
              <Typography
                sx={{
                  fontSize: isGrandTotal ? 12.5 : 12,
                  fontWeight: isGrandTotal ? 700 : 500,
                  color: isGrandTotal ? 'text.primary' : 'text.secondary'
                }}
              >
                {row.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: isGrandTotal ? 12.5 : 12,
                  fontWeight: isGrandTotal ? 700 : 500,
                  color: isGrandTotal ? 'text.primary' : 'inherit'
                }}
              >
                {row.value}
              </Typography>
            </Box>
          )
        })}

      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <ReceiptLongOutlined sx={{ color: 'text.disabled', fontSize: 18, mb: 0.5 }} />
        {visibility.footerLine1 && settings.footerLine1 ? (
          <Typography sx={{ fontSize: 12 }}>{settings.footerLine1}</Typography>
        ) : null}
        {visibility.footerLine2 && settings.footerLine2 ? (
          <Typography sx={{ fontSize: 12 }}>{settings.footerLine2}</Typography>
        ) : null}
        {visibility.footerLine3 && settings.footerLine3 ? (
          <Typography sx={{ fontSize: 12 }}>{settings.footerLine3}</Typography>
        ) : null}
      </Box>
    </Box>
  )
}
