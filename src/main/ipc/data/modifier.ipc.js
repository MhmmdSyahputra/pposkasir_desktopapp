import { ipcMain } from 'electron'
import {
  modifierGroupGetAll,
  modifierGroupGetById,
  modifierGroupCreate,
  modifierGroupUpdate,
  modifierGroupDelete,
  productModifierGroupsGet,
  productModifierGroupsGetAll,
  productModifierGroupsSet
} from '../../db/repositories/modifier.repo.js'

export function registerModifierIpc() {
  ipcMain.handle('modifier:getAll', (_e, params) => {
    try {
      return { ok: true, data: modifierGroupGetAll(params) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('modifier:getById', (_e, id) => {
    try {
      const data = modifierGroupGetById(id)
      return data ? { ok: true, data } : { ok: false, error: 'Modifier tidak ditemukan' }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('modifier:create', (_e, payload) => {
    try {
      return { ok: true, data: modifierGroupCreate(payload) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('modifier:update', (_e, { id, data }) => {
    try {
      return { ok: true, data: modifierGroupUpdate(id, data) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('modifier:delete', (_e, id) => {
    try {
      return { ok: true, data: modifierGroupDelete(id) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('modifier:getProductGroups', (_e, productId) => {
    try {
      return { ok: true, data: productModifierGroupsGet(productId) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('modifier:getAllProductGroups', () => {
    try {
      return { ok: true, data: productModifierGroupsGetAll() }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('modifier:setProductGroups', (_e, { productId, groupIds }) => {
    try {
      return { ok: true, data: productModifierGroupsSet(productId, groupIds) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })
}
