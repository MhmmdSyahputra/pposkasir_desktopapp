import { ipcMain } from 'electron'
import {
  productGetAll,
  productGetById,
  productGetByKode,
  productCreate,
  productUpdate,
  productDelete,
  productAdjustStok
} from '../../db/repositories/product.repo.js'

export function registerProductIpc() {
  ipcMain.handle('product:getAll', (_e, params) => {
    try {
      return { ok: true, data: productGetAll(params) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('product:getById', (_e, id) => {
    try {
      const data = productGetById(id)
      return data ? { ok: true, data } : { ok: false, error: 'Produk tidak ditemukan' }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('product:getByKode', (_e, kode) => {
    try {
      const data = productGetByKode(kode)
      return data ? { ok: true, data } : { ok: false, error: 'Produk tidak ditemukan' }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('product:create', (_e, payload) => {
    try {
      return { ok: true, data: productCreate(payload) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('product:update', (_e, { id, data }) => {
    try {
      return { ok: true, data: productUpdate(id, data) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('product:delete', (_e, id) => {
    try {
      return { ok: true, data: productDelete(id) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('product:adjustStok', (_e, { id, delta }) => {
    try {
      return { ok: true, data: productAdjustStok(id, delta) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })
}
