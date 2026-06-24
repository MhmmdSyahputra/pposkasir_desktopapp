import { ipcMain } from 'electron'
import {
  customerCreate,
  customerGetAll,
  customerUpdate,
  customerDelete,
  debtPaymentCreate,
  debtPaymentGetHistory
} from '../../db/repositories/customer.repo.js'

export function registerCustomerIpc() {
  ipcMain.handle('customer:create', (_event, payload) => {
    try {
      return { ok: true, data: customerCreate(payload) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('customer:getAll', () => {
    try {
      return { ok: true, data: customerGetAll() }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('customer:update', (_event, payload) => {
    try {
      return { ok: true, data: customerUpdate(payload) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('customer:delete', (_event, id) => {
    try {
      return { ok: true, data: customerDelete(id) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('customer:debtPaymentCreate', (_event, payload) => {
    try {
      return { ok: true, data: debtPaymentCreate(payload) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('customer:debtPaymentGetHistory', (_event, customerId) => {
    try {
      return { ok: true, data: debtPaymentGetHistory(customerId) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })
}
