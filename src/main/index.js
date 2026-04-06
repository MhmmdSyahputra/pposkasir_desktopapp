import { app, ipcMain, protocol, net } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow } from './window.js'
import { registerAppIpc } from './ipc/app.ipc.js'
import { registerDeviceIpc } from './ipc/device.ipc.js'
import { registerWindowIpc } from './ipc/window.ipc.js'
import {
  startNetworkMonitoring,
  stopNetworkMonitoring,
  registerNetworkIpc
} from './services/network.service.js'
import { setupAutoUpdater } from './services/updater.service.js'
import { logAppToServer } from './services/logger.service.js'
import { getDb, closeDb } from './db/database.js'
import { registerDataIpc } from './ipc/data/index.js'

// Register ppos:// scheme before app is ready (required by Electron)
protocol.registerSchemesAsPrivileged([
  { scheme: 'ppos', privileges: { secure: true, standard: true, supportFetchAPI: true } }
])

// Initialise local database (runs migrations)
getDb()

registerAppIpc()
registerDeviceIpc()
registerWindowIpc()
registerNetworkIpc()
registerDataIpc()

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  // Serve local product images via ppos://localhost/<relativePath>
  protocol.handle('ppos', (request) => {
    const url = new URL(request.url)
    const relativePath = decodeURIComponent(url.pathname.replace(/^\//, ''))
    const filePath = join(app.getPath('userData'), relativePath).replace(/\\/g, '/')
    return net.fetch(`file:///${filePath}`)
  })

  logAppToServer()
  startNetworkMonitoring()
  setupAutoUpdater()

  app.on('activate', function () {
    const { BrowserWindow } = require('electron')
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopNetworkMonitoring()
  closeDb()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
