import { ipcMain } from 'electron'
import { systemResetAllData, systemSeedDummyData } from '../../db/repositories/system.repo.js'

export function registerSystemIpc() {
  ipcMain.handle('system:resetAllData', (_e, payload) => {
    try {
      return { ok: true, data: systemResetAllData(payload || {}) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('system:seedDummyData', (_e, payload) => {
    try {
      return { ok: true, data: systemSeedDummyData(payload || {}) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })
}
