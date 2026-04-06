import { getDb } from '../database.js'

/**
 * CRUD operations for the `units` table.
 * All methods are synchronous (better-sqlite3 API).
 */

export function unitGetAll({ search = '' } = {}) {
  const db = getDb()
  if (search) {
    return db
      .prepare(
        `SELECT * FROM units
         WHERE nama LIKE @s OR singkatan LIKE @s
         ORDER BY nama ASC`
      )
      .all({ s: `%${search}%` })
  }
  return db.prepare(`SELECT * FROM units ORDER BY nama ASC`).all()
}

export function unitGetById(id) {
  return getDb().prepare(`SELECT * FROM units WHERE id = ?`).get(id)
}

export function unitCreate({ nama, singkatan, deskripsi = '', aktif = 1 }) {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO units (nama, singkatan, deskripsi, aktif)
       VALUES (@nama, @singkatan, @deskripsi, @aktif)`
    )
    .run({ nama, singkatan, deskripsi, aktif: aktif ? 1 : 0 })
  return unitGetById(result.lastInsertRowid)
}

export function unitUpdate(id, { nama, singkatan, deskripsi, aktif }) {
  const db = getDb()
  const fields = []
  const params = {}

  if (nama !== undefined) {
    fields.push('nama = @nama')
    params.nama = nama
  }
  if (singkatan !== undefined) {
    fields.push('singkatan = @singkatan')
    params.singkatan = singkatan
  }
  if (deskripsi !== undefined) {
    fields.push('deskripsi = @deskripsi')
    params.deskripsi = deskripsi
  }
  if (aktif !== undefined) {
    fields.push('aktif = @aktif')
    params.aktif = aktif ? 1 : 0
  }

  if (fields.length === 0) return unitGetById(id)

  fields.push(`updated_at = datetime('now', 'localtime')`)
  params.id = id

  db.prepare(`UPDATE units SET ${fields.join(', ')} WHERE id = @id`).run(params)
  return unitGetById(id)
}

export function unitDelete(id) {
  getDb().prepare(`DELETE FROM units WHERE id = ?`).run(id)
  return { id }
}
