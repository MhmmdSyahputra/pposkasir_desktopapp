import { ipcMain, BrowserWindow, Notification, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { readFileSync } from 'fs'
import { app } from 'electron'

export function registerAppIpc() {
  const playMainNotificationCue = () => {
    try {
      shell.beep()
    } catch (error) {
      console.error('Failed to play main notification cue:', error)
    }
  }

  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  ipcMain.handle('get-my-config', async () => {
    try {
      const jsonPath = is.dev
        ? join(__dirname, '../../resources/assets/config/config.json')
        : join(process.resourcesPath, 'resources/assets/config/config.json')

      const content = readFileSync(jsonPath, 'utf8')
      return JSON.parse(content)
    } catch (err) {
      console.error('Gagal membaca config:', err)
      return null
    }
  })

  ipcMain.handle('get-assets-path', async () => {
    const assetsPathConfig = is.dev
      ? join(__dirname, '../../resources/assets')
      : join(process.resourcesPath, 'resources/assets')

    return assetsPathConfig
  })

  ipcMain.handle('get-notification-sound-path', async () => {
    const soundPath = is.dev
      ? join(__dirname, '../../resources/assets')
      : join(process.resourcesPath, 'resources/assets')

    return soundPath
  })

  ipcMain.handle('window:show-notification', async (event, payload = {}) => {
    try {
      const title = payload.title || 'PPOS Kasir Notification'
      const body = payload.body || ''

      if (!Notification.isSupported()) {
        return { status: false, message: 'Notification is not supported on this platform' }
      }

      const notification = new Notification({
        title,
        body,
        silent: Boolean(payload.silent)
      })

      // Ensure system cue is triggered from main process as well.
      if (!payload.silent) {
        playMainNotificationCue()
      }

      notification.on('click', () => {
        const window = BrowserWindow.fromWebContents(event.sender)
        if (!window || window.isDestroyed()) return
        if (window.isMinimized()) {
          window.restore()
        }
        window.show()
        window.focus()
      })

      notification.show()
      return { status: true }
    } catch (error) {
      console.error('Failed to show desktop notification:', error)
      return { status: false, message: error.message || 'Failed to show notification' }
    }
  })
}
