import { ipcMain, BrowserWindow } from 'electron'
import { createMirrorWindow, mirrorWindow, mainWindow } from '../window.js'

export function registerWindowIpc() {
  ipcMain.on('window-minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.minimize()
  })

  ipcMain.on('window-maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window?.isMaximized()) {
      window.unmaximize()
    } else {
      window?.maximize()
    }
  })

  ipcMain.on('window-fullscreen', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window?.isFullScreen()) {
      window.setFullScreen(false)
    } else {
      window?.setFullScreen(true)
    }
  })

  ipcMain.on('window-close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      window.hide()
      // If closing the main window, also hide the mirror window immediately
      if (window === mainWindow && mirrorWindow && !mirrorWindow.isDestroyed()) {
        mirrorWindow.hide()
      }
      window.close()
    }
  })

  ipcMain.on('window-open-mirror', () => {
    createMirrorWindow()
  })

  ipcMain.on('window-toggle-mirror', () => {
    if (mirrorWindow && !mirrorWindow.isDestroyed()) {
      mirrorWindow.close()
    } else {
      createMirrorWindow()
    }
  })

  ipcMain.on('window-close-mirror', () => {
    if (mirrorWindow) {
      mirrorWindow.close()
    }
  })

  ipcMain.on('window-sync-mirror-cart', (event, data) => {
    if (mirrorWindow && !mirrorWindow.isDestroyed()) {
      mirrorWindow.webContents.send('window-on-mirror-cart-updated', data)
    }
  })
}
