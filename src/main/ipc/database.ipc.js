import { ipcMain, dialog, app } from 'electron'
import { join } from 'path'
import { copyFileSync, existsSync } from 'fs'
import { closeDb, getDb } from '../db/database.js'

export function registerDatabaseBackupIpc() {
  // Export / Backup Database
  ipcMain.handle('database:backup-export', async () => {
    try {
      const dbPath = join(app.getPath('userData'), 'pposkasir.db')
      if (!existsSync(dbPath)) {
        throw new Error('Database file tidak ditemukan')
      }

      const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Ekspor Backup Database',
        defaultPath: join(app.getPath('downloads'), `ppos_backup_${Date.now()}.db`),
        filters: [
          { name: 'SQLite Database', extensions: ['db', 'sqlite'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (canceled || !filePath) {
        return { success: false, message: 'Ekspor dibatalkan' }
      }

      // Close WAL / journal state checkpoint
      const db = getDb()
      db.pragma('wal_checkpoint(TRUNCATE)')

      // Copy file
      copyFileSync(dbPath, filePath)
      return { success: true, filePath }
    } catch (error) {
      console.error('Failed to export backup database:', error)
      return { success: false, error: error.message }
    }
  })

  // Import / Restore Database
  ipcMain.handle('database:backup-import', async () => {
    try {
      const { filePaths, canceled } = await dialog.showOpenDialog({
        title: 'Impor / Restore Database',
        properties: ['openFile'],
        filters: [
          { name: 'SQLite Database', extensions: ['db', 'sqlite'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (canceled || filePaths.length === 0) {
        return { success: false, message: 'Impor dibatalkan' }
      }

      const selectedFilePath = filePaths[0]
      if (!existsSync(selectedFilePath)) {
        throw new Error('File database impor tidak ditemukan')
      }

      // Close target DB connection so we can overwrite it safely
      closeDb()

      const targetDbPath = join(app.getPath('userData'), 'pposkasir.db')

      // Overwrite database file
      copyFileSync(selectedFilePath, targetDbPath)

      // Re-initialize database to verify migration and check if it runs correctly
      getDb()

      return { success: true }
    } catch (error) {
      console.error('Failed to import database:', error)
      return { success: false, error: error.message }
    }
  })
}
