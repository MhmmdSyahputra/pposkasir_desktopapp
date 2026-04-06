import { ipcMain } from 'electron'
import {
  authLoginSuper,
  authLoginCashier,
  authCashierCreate,
  authCashierGetAll,
  authGetActiveCashierSession,
  authOpenCashierSession,
  authCloseCashierSession,
  authGetCashierSessionHistory
} from '../../db/repositories/auth.repo.js'

export function registerAuthIpc() {
  ipcMain.handle('auth:loginSuper', (_e, payload) => {
    try {
      return { ok: true, data: authLoginSuper(payload || {}) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('auth:loginCashier', (_e, payload) => {
    try {
      return { ok: true, data: authLoginCashier(payload || {}) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('auth:cashierCreate', (_e, payload) => {
    try {
      return { ok: true, data: authCashierCreate(payload || {}) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('auth:cashierGetAll', () => {
    try {
      return { ok: true, data: authCashierGetAll() }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('auth:getActiveCashierSession', (_e, payload) => {
    try {
      return { ok: true, data: authGetActiveCashierSession(payload || {}) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('auth:openCashierSession', (_e, payload) => {
    try {
      return { ok: true, data: authOpenCashierSession(payload || {}) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('auth:closeCashierSession', (_e, payload) => {
    try {
      return { ok: true, data: authCloseCashierSession(payload || {}) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('auth:getCashierSessionHistory', (_e, payload) => {
    try {
      return { ok: true, data: authGetCashierSessionHistory(payload || {}) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })
}
