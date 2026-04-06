import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { getAppTheme } from '../theme/appTheme'

const ThemeModeContext = createContext({
  mode: 'dark',
  toggleMode: () => {}
})

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => useContext(ThemeModeContext)

// eslint-disable-next-line react/prop-types
export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('app-theme-mode') || 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    localStorage.setItem('app-theme-mode', mode)
  }, [mode])

  const toggleMode = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))

  const theme = useMemo(() => getAppTheme(mode), [mode])

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  )
}
