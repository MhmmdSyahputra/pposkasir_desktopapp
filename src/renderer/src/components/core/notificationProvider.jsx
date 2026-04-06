/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

// type Severity = 'success' | 'info' | 'warning' | 'error'

const NotificationContext = createContext({
  show: (opts) => {
    console.log(opts)
  }
})

export const useNotifier = () => useContext(NotificationContext)

export const NotificationProvider = ({
  children,
  defaultAnchorOrigin = { vertical: 'bottom', horizontal: 'right' }
}) => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState({
    message: '',
    severity: 'info',
    duration: 4000,
    anchorOrigin: defaultAnchorOrigin
  })

  const show = (opts) => {
    setOptions((prev) => ({
      ...prev,
      ...opts,
      anchorOrigin: opts?.anchorOrigin
        ? { ...prev.anchorOrigin, ...opts.anchorOrigin }
        : prev.anchorOrigin
    }))
    setOpen(true)
  }

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') return
    setOpen(false)
  }

  return (
    <NotificationContext.Provider value={{ show }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={options.duration ?? 4000}
        onClose={handleClose}
        anchorOrigin={options.anchorOrigin ?? defaultAnchorOrigin}
      >
        <Alert onClose={handleClose} severity={options.severity ?? 'info'} sx={{ width: '100%' }}>
          <div style={{ fontWeight: 700 }}>{options.message}</div>
          {options.description && (
            <div style={{ fontSize: 13, opacity: 0.9 }}>{options.description}</div>
          )}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
