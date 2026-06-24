import { getDb } from '../database.js'

/**
 * CRUD operations for the `expenses` table.
 * All methods are synchronous (better-sqlite3 API).
 */

export function expenseGetById(id) {
  return getDb().prepare(`SELECT * FROM expenses WHERE id = ?`).get(id)
}

export function expenseCreate({ kategori, jumlah, keterangan, kasir, images }) {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO expenses (kategori, jumlah, keterangan, kasir, images)
       VALUES (@kategori, @jumlah, @keterangan, @kasir, @images)`
    )
    .run({
      kategori,
      jumlah: Number(jumlah),
      keterangan: keterangan || '',
      kasir,
      images: images ? (typeof images === 'string' ? images : JSON.stringify(images)) : '[]'
    })
  return expenseGetById(result.lastInsertRowid)
}

export function expenseGetAll({ startDate, endDate, search, limit = 500, offset = 0 } = {}) {
  const db = getDb()
  const conditions = []
  const params = {}

  if (search) {
    conditions.push('(keterangan LIKE @search OR kasir LIKE @search)')
    params.search = `%${search}%`
  }

  if (startDate) {
    conditions.push('created_at >= @startDate')
    params.startDate = `${startDate} 00:00:00`
  }

  if (endDate) {
    conditions.push('created_at <= @endDate')
    params.endDate = `${endDate} 23:59:59`
  }

  let query = 'SELECT * FROM expenses'
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }
  query += ' ORDER BY created_at DESC LIMIT @limit OFFSET @offset'
  params.limit = limit
  params.offset = offset

  return db.prepare(query).all(params)
}

export function expenseGetReport({
  startDate = '',
  endDate = '',
  kategori = 'all',
  search = '',
  limit = 500,
  offset = 0
} = {}) {
  const db = getDb()
  const conditions = []
  const params = {}

  if (search) {
    conditions.push('(keterangan LIKE @search OR kasir LIKE @search OR kategori LIKE @search)')
    params.search = `%${search}%`
  }

  if (startDate) {
    conditions.push('created_at >= @startDate')
    params.startDate = `${startDate} 00:00:00`
  }

  if (endDate) {
    conditions.push('created_at <= @endDate')
    params.endDate = `${endDate} 23:59:59`
  }

  if (kategori && kategori !== 'all') {
    conditions.push('kategori = @kategori')
    params.kategori = kategori
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  params.limit = Math.max(1, Number(limit) || 500)
  params.offset = Math.max(0, Number(offset) || 0)

  const summary = db
    .prepare(
      `SELECT
         COUNT(*) AS jumlah_transaksi,
         COALESCE(SUM(jumlah), 0) AS total_pengeluaran,
         COALESCE(AVG(jumlah), 0) AS rata_rata_pengeluaran
       FROM expenses ${where}`
    )
    .get(params)

  const byCategory = db
    .prepare(
      `SELECT
         kategori,
         COUNT(*) AS jumlah,
         COALESCE(SUM(jumlah), 0) AS total
       FROM expenses ${where}
       GROUP BY kategori
       ORDER BY total DESC`
    )
    .all(params)

  const daily = db
    .prepare(
      `SELECT
         date(created_at) AS tanggal,
         COUNT(*) AS jumlah,
         COALESCE(SUM(jumlah), 0) AS total
       FROM expenses ${where}
       GROUP BY date(created_at)
       ORDER BY tanggal ASC`
    )
    .all(params)

  const rows = db
    .prepare(
      `SELECT * FROM expenses ${where}
       ORDER BY created_at DESC
       LIMIT @limit OFFSET @offset`
    )
    .all(params)

  const totalRows = db.prepare(`SELECT COUNT(*) AS cnt FROM expenses ${where}`).get(params).cnt

  return {
    summary,
    byCategory,
    daily,
    rows,
    totalRows,
    filters: { startDate, endDate, kategori, search }
  }
}

export function expenseDelete(id) {
  getDb().prepare(`DELETE FROM expenses WHERE id = ?`).run(id)
  return { id }
}

export function expenseCategoryCreate({ nama }) {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO expense_categories (nama)
       VALUES (@nama)`
    )
    .run({ nama })
  return db.prepare(`SELECT * FROM expense_categories WHERE id = ?`).get(result.lastInsertRowid)
}

export function expenseCategoryGetAll() {
  return getDb().prepare(`SELECT * FROM expense_categories ORDER BY nama ASC`).all()
}

export function expenseCategoryDelete(id) {
  getDb().prepare(`DELETE FROM expense_categories WHERE id = ?`).run(id)
  return { id }
}
