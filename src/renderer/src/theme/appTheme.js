import { createTheme } from '@mui/material'

const baseTypography = {
  fontFamily: 'Poppins, sans-serif',
  button: { textTransform: 'none' }
}

const baseComponents = {
  MuiCssBaseline: {
    styleOverrides: {
      '*, *::before, *::after': { boxSizing: 'border-box' },
      '*::-webkit-scrollbar': { width: 6, height: 6 },
      '*::-webkit-scrollbar-track': { background: 'transparent' }
    }
  }
}

// ── Dark ─────────────────────────────────────────────────────────────────
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1a73e8', dark: '#1557b0', contrastText: '#ffffff' },
    error: { main: '#e05c5c' },
    warning: { main: '#f5a623' },
    background: {
      default: '#0f1117',
      paper: '#14181d'
    },
    divider: 'rgba(255,255,255,0.08)',
    text: {
      primary: '#e6edf5',
      secondary: '#8b98a8',
      disabled: 'rgba(255,255,255,0.28)'
    },
    custom: {
      subtle: '#0c1018',
      elevation1: '#1a1f2c',
      inputBg: 'rgba(255,255,255,0.035)',
      inputBorder: 'rgba(255,255,255,0.1)',
      inputBorderHover: 'rgba(255,255,255,0.22)',
      scrollThumb: 'rgba(255,255,255,0.1)',
      scrollThumbHover: 'rgba(255,255,255,0.18)',
      rowHover: 'rgba(255,255,255,0.025)',
      iconSubdued: 'rgba(255,255,255,0.35)'
    }
  },
  typography: baseTypography,
  components: baseComponents
})

// ── Light ────────────────────────────────────────────────────────────────
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a73e8', dark: '#1557b0', contrastText: '#ffffff' },
    error: { main: '#d32f2f' },
    warning: { main: '#e67e00' },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff'
    },
    divider: 'rgba(0,0,0,0.09)',
    text: {
      primary: '#1a202c',
      secondary: '#5a6478',
      disabled: 'rgba(0,0,0,0.38)'
    },
    custom: {
      subtle: '#f0f3f7',
      elevation1: '#ffffff',
      inputBg: 'rgba(0,0,0,0.025)',
      inputBorder: 'rgba(0,0,0,0.18)',
      inputBorderHover: 'rgba(0,0,0,0.35)',
      scrollThumb: 'rgba(0,0,0,0.12)',
      scrollThumbHover: 'rgba(0,0,0,0.2)',
      rowHover: 'rgba(0,0,0,0.025)',
      iconSubdued: 'rgba(0,0,0,0.38)'
    }
  },
  typography: baseTypography,
  components: baseComponents
})

export const getAppTheme = (mode) => (mode === 'dark' ? darkTheme : lightTheme)
