import { ipcMain } from 'electron'
import {
  categoryGetAll,
  categoryGetById,
  categoryCreate,
  categoryUpdate,
  categoryDelete
} from '../../db/repositories/category.repo.js'

export function registerCategoryIpc() {
  ipcMain.handle('category:getAll', (_e, params) => {
    try {
      return { ok: true, data: categoryGetAll(params) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('category:getById', (_e, id) => {
    try {
      const data = categoryGetById(id)
      return data ? { ok: true, data } : { ok: false, error: 'Kategori tidak ditemukan' }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('category:create', (_e, payload) => {
    try {
      return { ok: true, data: categoryCreate(payload) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('category:update', (_e, { id, data }) => {
    try {
      return { ok: true, data: categoryUpdate(id, data) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('category:delete', (_e, id) => {
    try {
      return { ok: true, data: categoryDelete(id) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })
}
