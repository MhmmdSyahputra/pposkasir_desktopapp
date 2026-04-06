import { ipcMain } from 'electron'
import {
  transactionCreate,
  transactionGetById,
  transactionGetAll,
  transactionGetStats,
  transactionGetReport,
  transactionVoid
} from '../../db/repositories/transaction.repo.js'

export function registerTransactionIpc() {
  ipcMain.handle('transaction:create', (_e, payload) => {
    try {
      return { ok: true, data: transactionCreate(payload) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('transaction:getById', (_e, id) => {
    try {
      const data = transactionGetById(id)
      return data ? { ok: true, data } : { ok: false, error: 'Transaksi tidak ditemukan' }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('transaction:getAll', (_e, params) => {
    try {
      return { ok: true, data: transactionGetAll(params) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('transaction:getStats', (_e, params) => {
    try {
      return { ok: true, data: transactionGetStats(params) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('transaction:getReport', (_e, params) => {
    try {
      return { ok: true, data: transactionGetReport(params) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('transaction:void', (_e, id) => {
    try {
      return { ok: true, data: transactionVoid(id) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })
}
