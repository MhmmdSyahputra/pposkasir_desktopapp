import { MemoryRouter as Router, Routes, Route } from 'react-router-dom'
import { appRoutes } from './routes/appRoutes'
import { sidebarRoutes } from './routes/sidebarRoutes'
import { Box, useTheme } from '@mui/material'
import { TitleBar } from './components/core/titlebar'
import { Sidebar } from './components/core/sidebar'
import { NotificationProvider } from './components/core/notificationProvider'
import { useAuth } from './context/authContext'
import { LoginPage } from './pages/loginPage'

// eslint-disable-next-line react/prop-types
const SidebarLayout = ({ children }) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default'
      }}
    >
      <Sidebar routes={sidebarRoutes} />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh'
        }}
      >
        <TitleBar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            overflow: 'hidden',
            height: 'calc(100vh - 40px)',
            borderLeft: `1px solid ${theme.palette.divider}`
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

const renderRoute = (route, key) => {
  const { element, path } = route

  // if (!isProtected && (path === '/login' || path === '/xyz/info')) {
  //   return <Route key={key} path={path} element={<LoginOnlyLayout>{element}</LoginOnlyLayout>} />
  // }

  // if (!isProtected) {
  //   return <Route key={key} path={path} element={<SidebarLogLayout>{element}</SidebarLogLayout>} />
  // }

  return <Route key={key} path={path} element={<SidebarLayout>{element}</SidebarLayout>} />
}

const App = () => {
  const { isAuthenticated } = useAuth()

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {!isAuthenticated ? (
            <Route path="*" element={<LoginPage />} />
          ) : (
            <>
              {appRoutes.filter((r) => r.active).map((route, i) => renderRoute(route, i))}
              {/* 404 */}
              <Route path="*" element={<p>not found</p>} />
            </>
          )}
        </Routes>
      </Router>
    </NotificationProvider>
  )
}

export default App
