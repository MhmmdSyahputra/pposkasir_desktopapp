import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { migrations } from './migrations.js'

let _db = null

/**
 * Returns the singleton DB instance.
 * Opens and migrates the database on first call.
 */
export function getDb() {
  if (_db) return _db

  const dbPath = join(app.getPath('userData'), 'pposkasir.db')
  _db = new Database(dbPath)

  // Enable WAL mode for better performance
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  _runMigrations(_db)

  return _db
}

/**
 * Closes the database (call on app quit).
 */
export function closeDb() {
  if (_db) {
    _db.close()
    _db = null
  }
}

// ── private ─────────────────────────────────────────────────────────────────

function _runMigrations(db) {
  // Create version-tracking table if not yet present
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version     INTEGER PRIMARY KEY,
      description TEXT,
      applied_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `)

  const alreadyApplied = db
    .prepare('SELECT version FROM _migrations')
    .all()
    .map((r) => r.version)

  for (const migration of migrations) {
    if (alreadyApplied.includes(migration.version)) continue

    const apply = db.transaction(() => {
      migration.up(db)
      db.prepare('INSERT INTO _migrations (version, description) VALUES (?, ?)').run(
        migration.version,
        migration.description
      )
    })

    apply()
    console.log(`[DB] Migration v${migration.version} applied: ${migration.description}`)
  }
}
