import React, { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Popover,
  TextField,
  Button,
  useTheme,
  alpha,
  InputAdornment
} from '@mui/material'
import {
  ChevronLeftRounded,
  ChevronRightRounded,
  CalendarTodayRounded,
  ClearRounded
} from '@mui/icons-material'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

export const DatePicker = ({
  value,
  onChange,
  label,
  placeholder = 'Pick a date',
  size = 'small',
  sx = {}
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [anchorEl, setAnchorEl] = useState(null)
  
  // Parse value (YYYY-MM-DD) or use current date
  const parsedDate = useMemo(() => {
    if (!value) return null
    const [y, m, d] = value.split('-').map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }, [value])

  const [currentMonth, setCurrentMonth] = useState(parsedDate ? parsedDate.getMonth() : new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(parsedDate ? parsedDate.getFullYear() : new Date().getFullYear())

  // Reset calendar view when opened
  useEffect(() => {
    if (anchorEl) {
      if (parsedDate) {
        setCurrentMonth(parsedDate.getMonth())
        setCurrentYear(parsedDate.getFullYear())
      } else {
        const now = new Date()
        setCurrentMonth(now.getMonth())
        setCurrentYear(now.getFullYear())
      }
    }
  }, [anchorEl, parsedDate])

  const open = Boolean(anchorEl)

  const handleOpen = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  const handleSelectDate = (day) => {
    const y = currentYear
    const m = String(currentMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    handleClose()
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    handleClose()
  }

  const handleToday = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    handleClose()
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const displayValue = parsedDate
    ? parsedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''

  return (
    <>
      <TextField
        label={label}
        size={size}
        placeholder={placeholder}
        value={displayValue}
        onClick={handleOpen}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              {value && (
                <IconButton size="small" onClick={handleClear} sx={{ mr: -0.5 }}>
                  <ClearRounded sx={{ fontSize: 16 }} />
                </IconButton>
              )}
              <IconButton size="small" onClick={handleOpen} edge="end" sx={{ pointerEvents: 'none' }}>
                <CalendarTodayRounded sx={{ fontSize: 16, color: 'text.disabled' }} />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            cursor: 'pointer',
            bgcolor: theme.palette.custom?.inputBg || (isDark ? '#1a1f2c' : '#ffffff'),
            borderRadius: 2,
            '& input': { cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 13 },
            '& fieldset': { borderColor: theme.palette.custom?.inputBorder || theme.palette.divider },
            '&:hover fieldset': { borderColor: theme.palette.custom?.inputBorderHover || theme.palette.primary?.main },
            ...sx
          }
        }}
        InputLabelProps={{ shrink: true, sx: { fontFamily: 'Poppins, sans-serif' } }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              borderRadius: 3,
              bgcolor: isDark ? '#1a1f2c' : '#ffffff',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              width: 280,
              fontFamily: 'Poppins, sans-serif'
            }
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
            {MONTHS[currentMonth]} {currentYear}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={handlePrevMonth} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}>
              <ChevronLeftRounded sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" onClick={handleNextMonth} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}>
              <ChevronRightRounded sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
          {DAYS.map((d) => (
            <Typography key={d} align="center" sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', fontFamily: 'inherit' }}>
              {d}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
          {blanks.map((b) => (
            <Box key={`blank-${b}`} />
          ))}
          {days.map((d) => {
            const isSelected = parsedDate && parsedDate.getDate() === d && parsedDate.getMonth() === currentMonth && parsedDate.getFullYear() === currentYear
            const isToday = new Date().getDate() === d && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear

            return (
              <Box
                key={d}
                onClick={() => handleSelectDate(d)}
                sx={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: 1.5,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  fontWeight: isSelected ? 600 : 400,
                  bgcolor: isSelected ? 'primary.main' : 'transparent',
                  color: isSelected ? '#fff' : (isToday ? 'primary.main' : 'text.primary'),
                  border: isToday && !isSelected ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                {d}
              </Box>
            )
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button size="small" onClick={handleClear} sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 12 }}>
            Clear
          </Button>
          <Button size="small" onClick={handleToday} sx={{ textTransform: 'none', fontSize: 12 }}>
            Today
          </Button>
        </Box>
      </Popover>
    </>
  )
}
