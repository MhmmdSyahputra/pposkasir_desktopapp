import { ipcMain } from 'electron'
import {
  unitGetAll,
  unitGetById,
  unitCreate,
  unitUpdate,
  unitDelete
} from '../../db/repositories/unit.repo.js'

export function registerUnitIpc() {
  ipcMain.handle('unit:getAll', (_e, params) => {
    try {
      return { ok: true, data: unitGetAll(params) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('unit:getById', (_e, id) => {
    try {
      const data = unitGetById(id)
      return data ? { ok: true, data } : { ok: false, error: 'Satuan tidak ditemukan' }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('unit:create', (_e, payload) => {
    try {
      return { ok: true, data: unitCreate(payload) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('unit:update', (_e, { id, data }) => {
    try {
      return { ok: true, data: unitUpdate(id, data) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('unit:delete', (_e, id) => {
    try {
      return { ok: true, data: unitDelete(id) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })
}
