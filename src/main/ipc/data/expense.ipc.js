import { ipcMain } from 'electron'
import {
  expenseCreate,
  expenseGetAll,
  expenseDelete,
  expenseCategoryCreate,
  expenseCategoryGetAll,
  expenseCategoryDelete,
  expenseGetReport
} from '../../db/repositories/expense.repo.js'

export function registerExpenseIpc() {
  ipcMain.handle('expense:getReport', (_e, params) => {
    try {
      return { ok: true, data: expenseGetReport(params) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('expense:create', (_e, payload) => {
    try {
      return { ok: true, data: expenseCreate(payload) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('expense:getAll', (_e, params) => {
    try {
      return { ok: true, data: expenseGetAll(params) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('expense:delete', (_e, id) => {
    try {
      return { ok: true, data: expenseDelete(id) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('expense-category:create', (_e, payload) => {
    try {
      return { ok: true, data: expenseCategoryCreate(payload) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('expense-category:getAll', () => {
    try {
      return { ok: true, data: expenseCategoryGetAll() }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('expense-category:delete', (_e, id) => {
    try {
      return { ok: true, data: expenseCategoryDelete(id) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })
}
