import { getDb } from '../database.js'

/**
 * CRUD operations for the `categories` table.
 * All methods are synchronous (better-sqlite3 API).
 */

export function categoryGetAll({ search = '' } = {}) {
  const db = getDb()
  if (search) {
    return db
      .prepare(`SELECT * FROM categories WHERE nama LIKE ? ORDER BY nama ASC`)
      .all(`%${search}%`)
  }
  return db.prepare(`SELECT * FROM categories ORDER BY nama ASC`).all()
}

export function categoryGetById(id) {
  return getDb().prepare(`SELECT * FROM categories WHERE id = ?`).get(id)
}

export function categoryCreate({ nama, deskripsi = '', aktif = 1 }) {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO categories (nama, deskripsi, aktif)
       VALUES (@nama, @deskripsi, @aktif)`
    )
    .run({ nama, deskripsi, aktif: aktif ? 1 : 0 })
  return categoryGetById(result.lastInsertRowid)
}

export function categoryUpdate(id, { nama, deskripsi, aktif }) {
  const db = getDb()
  const fields = []
  const params = {}

  if (nama !== undefined) {
    fields.push('nama = @nama')
    params.nama = nama
  }
  if (deskripsi !== undefined) {
    fields.push('deskripsi = @deskripsi')
    params.deskripsi = deskripsi
  }
  if (aktif !== undefined) {
    fields.push('aktif = @aktif')
    params.aktif = aktif ? 1 : 0
  }

  if (fields.length === 0) return categoryGetById(id)

  fields.push(`updated_at = datetime('now', 'localtime')`)
  params.id = id

  db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = @id`).run(params)
  return categoryGetById(id)
}

export function categoryDelete(id) {
  getDb().prepare(`DELETE FROM categories WHERE id = ?`).run(id)
  return { id }
}
