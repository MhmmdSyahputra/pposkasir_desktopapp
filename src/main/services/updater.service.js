import { autoUpdater } from 'electron-updater'
import { ipcMain, dialog, app, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import { mainWindow } from '../window.js'
import https from 'https'

// Helper function to check if version B is newer than version A (semver)
function isNewerVersion(current, latest) {
  const cParts = current.replace(/^v/, '').split('.').map(Number)
  const lParts = latest.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < Math.max(cParts.length, lParts.length); i++) {
    const cVal = cParts[i] || 0
    const lVal = lParts[i] || 0
    if (lVal > cVal) return true
    if (cVal > lVal) return false
  }
  return false
}

// Check for updates on Microsoft Store by comparing local version to GitHub Releases
function checkMicrosoftStoreUpdate(silent = false) {
  const options = {
    hostname: 'api.github.com',
    path: '/repos/MhmmdSyahputra/pposkasir_desktopapp/releases/latest',
    headers: {
      'User-Agent': 'Electron-P-POS-App'
    }
  }

  https
    .get(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) return sendError(silent)

          const release = JSON.parse(data)
          const latestVersion = release.tag_name ? release.tag_name.replace(/^v/, '') : ''
          const currentVersion = app.getVersion()

          if (latestVersion && isNewerVersion(currentVersion, latestVersion)) {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send(
                'update:notification',
                `Versi baru v${latestVersion} telah tersedia di Microsoft Store!`,
                'info'
              )
            }

            dialog
              .showMessageBox(mainWindow, {
                type: 'info',
                title: 'Pembaruan Tersedia',
                message: `Versi baru v${latestVersion} telah tersedia di Microsoft Store!\n\nApakah Anda ingin membuka Microsoft Store untuk melakukan pembaruan sekarang?`,
                buttons: ['Perbarui Sekarang', 'Nanti']
              })
              .then((result) => {
                if (result.response === 0) {
                  shell.openExternal('ms-windows-store://pdp/?ProductId=9MW3S77V0PBQ')
                }
              })
          } else if (!silent) {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send(
                'update:notification',
                `Aplikasi sudah versi terbaru (v${currentVersion})`,
                'success'
              )
            }
          }
        } catch (e) {
          sendError(silent)
        }
      })
    })
    .on('error', () => sendError(silent))
}

function sendError(silent) {
  if (silent) return
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(
      'update:notification',
      'Terjadi kesalahan saat memeriksa pembaruan di Microsoft Store',
      'error'
    )
  }
}

export function setupAutoUpdater() {
  autoUpdater.autoDownload = false
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'MhmmdSyahputra',
    repo: 'pposkasir_desktopapp',
    private: true,
    token: process.env.GH_TOKEN
  })

  if (is.dev) {
    autoUpdater.forceDevUpdateConfig = true
  }

  // IPC: manual check updates dari renderer
  ipcMain.on('check-for-updates', () => {
    if (is.dev) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(
          'update:notification',
          'Aplikasi dalam mode development. Auto-update hanya tersedia untuk versi production yang sudah di-package.',
          'info'
        )
      }
      return
    }

    if (process.windowsStore) {
      checkMicrosoftStoreUpdate(false)
    } else {
      autoUpdater.checkForUpdates()
    }
  })

  // Event: Update tersedia
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version)

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        'update:notification',
        `Versi baru ${info.version} tersedia!`,
        'info'
      )
    }

    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update tersedia',
        message: `Versi baru ${info.version} tersedia. Mau download sekarang?`,
        buttons: ['Ya', 'Nanti']
      })
      .then((result) => {
        if (result.response === 0) {
          console.log('Starting update download...')
          autoUpdater.downloadUpdate()
        } else {
          console.log('Update skipped by user')
        }
      })
  })

  // Event: Sudah versi terbaru
  autoUpdater.on('update-not-available', (info) => {
    console.log('App is up to date. Current version:', info.version)

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        'update:notification',
        `Aplikasi sudah versi terbaru (${info.version})`,
        'success'
      )
    }
  })

  // Event: Error updater
  autoUpdater.on('error', (err) => {
    console.error('Auto updater error:', err)

    if (mainWindow && !mainWindow.isDestroyed()) {
      const errMsg = err == null ? 'Unknown error' : (err.stack || err.message || err).toString()
      mainWindow.webContents.send(
        'update:notification',
        `Terjadi kesalahan saat memeriksa pembaruan: ${errMsg}`,
        'error'
      )
    }
  })

  // Event: Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    const progress = Math.round(progressObj.percent)
    console.log(`Download progress: ${progress}%`)

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:download-progress', progress)
    }
  })

  // Event: Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version)

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        'update:notification',
        `Update ${info.version} siap diinstall`,
        'success'
      )
    }

    dialog
      .showMessageBox(mainWindow, {
        title: 'Update Siap',
        message: `Update versi ${info.version} telah diunduh. Aplikasi akan restart untuk instalasi.`,
        buttons: ['Install Sekarang', 'Nanti']
      })
      .then((result) => {
        if (result.response === 0) {
          console.log('Installing update and restarting...')
          autoUpdater.quitAndInstall()
        }
      })
  })

  // Auto-check updates senyap 5 detik setelah startup di mode production
  setTimeout(() => {
    if (!is.dev) {
      if (process.windowsStore) {
        checkMicrosoftStoreUpdate(true)
      } else {
        autoUpdater.checkForUpdates()
      }
    }
  }, 5000)
}
