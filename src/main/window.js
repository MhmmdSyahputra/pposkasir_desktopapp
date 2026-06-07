import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

export let mainWindow = null
export let mirrorWindow = null

export function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 900,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    // fullscreen: true,
    frame: false,
    center: true,
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      webSecurity: false,
      nodeIntegration: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // mainWindow.setFullScreen(true)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    if (mirrorWindow) {
      mirrorWindow.close()
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

export function createMirrorWindow() {
  if (mirrorWindow) {
    mirrorWindow.focus()
    return
  }

  mirrorWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      webSecurity: false,
      nodeIntegration: true
    }
  })

  mirrorWindow.on('ready-to-show', () => {
    mirrorWindow.show()
  })

  mirrorWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mirrorWindow.on('closed', () => {
    mirrorWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mirrorWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?route=/mirror`)
  } else {
    // For file:// URL we must pass the query parameter correctly.
    const url = new URL(`file://${join(__dirname, '../renderer/index.html')}`)
    url.search = '?route=/mirror'
    mirrorWindow.loadURL(url.href)
  }
}
