import { ipcMain, app } from 'electron'
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

/**
 * IPC handlers for local product image management.
 * Images are stored at: {userData}/product-images/{productId}_{uuid}.{ext}
 * Renderer references them via the ppos:// custom protocol.
 */
export function registerImageIpc() {
  ipcMain.handle('image:save', (_e, { buffer, ext, productId }) => {
    try {
      const dir = join(app.getPath('userData'), 'product-images')
      mkdirSync(dir, { recursive: true })
      const filename = `${productId}_${randomUUID()}.${ext.toLowerCase()}`
      writeFileSync(join(dir, filename), Buffer.from(buffer))
      return { ok: true, data: `product-images/${filename}` }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('image:delete', (_e, relativePath) => {
    try {
      if (relativePath) {
        const fullPath = join(app.getPath('userData'), relativePath)
        if (existsSync(fullPath)) unlinkSync(fullPath)
      }
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })
}
