import { registerProductIpc } from './product.ipc.js'
import { registerCategoryIpc } from './category.ipc.js'
import { registerUnitIpc } from './unit.ipc.js'
import { registerImageIpc } from './image.ipc.js'
import { registerModifierIpc } from './modifier.ipc.js'
import { registerTransactionIpc } from './transaction.ipc.js'
import { registerAuthIpc } from './auth.ipc.js'
import { registerSystemIpc } from './system.ipc.js'

/**
 * Registers all local-data IPC handlers (SQLite layer).
 * Add new entity registrations here as the app grows.
 */
export function registerDataIpc() {
  registerProductIpc()
  registerCategoryIpc()
  registerUnitIpc()
  registerImageIpc()
  registerModifierIpc()
  registerTransactionIpc()
  registerAuthIpc()
  registerSystemIpc()
}
