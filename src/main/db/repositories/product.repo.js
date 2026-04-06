import { getDb } from '../database.js'

/**
 * CRUD operations for the `products` table.
 * All methods are synchronous (better-sqlite3 API).
 */

export function productGetAll({ search = '', kategori = '', aktif = null } = {}) {
  const db = getDb()
  const conditions = []
  const params = {}

  if (search) {
    conditions.push(`(nama LIKE @search OR kode LIKE @search OR barcode LIKE @search)`)
    params.search = `%${search}%`
  }
  if (kategori) {
    conditions.push(`kategori = @kategori`)
    params.kategori = kategori
  }
  if (aktif !== null) {
    conditions.push(`aktif = @aktif`)
    params.aktif = aktif ? 1 : 0
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  return db.prepare(`SELECT * FROM products ${where} ORDER BY nama ASC`).all(params)
}

export function productGetById(id) {
  return getDb().prepare(`SELECT * FROM products WHERE id = ?`).get(id)
}

export function productGetByKode(kode) {
  return getDb().prepare(`SELECT * FROM products WHERE kode = ?`).get(kode)
}

export function productCreate({
  kode,
  nama,
  kategori = '',
  satuan = '',
  harga_beli = 0,
  harga_jual = 0,
  stok = 0,
  min_stok = 0,
  barcode = '',
  deskripsi = '',
  aktif = 1,
  images = '[]'
}) {
  const db = getDb()

  // Auto-generate kode if not provided
  const finalKode = kode || _generateKode(db)

  const result = db
    .prepare(
      `INSERT INTO products
         (kode, nama, kategori, satuan, harga_beli, harga_jual, stok, min_stok, barcode, deskripsi, aktif, images)
       VALUES
         (@kode, @nama, @kategori, @satuan, @harga_beli, @harga_jual, @stok, @min_stok, @barcode, @deskripsi, @aktif, @images)`
    )
    .run({
      kode: finalKode,
      nama,
      kategori,
      satuan,
      harga_beli: Number(harga_beli) || 0,
      harga_jual: Number(harga_jual) || 0,
      stok: Number(stok) || 0,
      min_stok: Number(min_stok) || 0,
      barcode,
      deskripsi,
      aktif: aktif ? 1 : 0,
      images
    })

  return productGetById(result.lastInsertRowid)
}

export function productUpdate(id, data) {
  const db = getDb()
  const allowed = [
    'kode',
    'nama',
    'kategori',
    'satuan',
    'harga_beli',
    'harga_jual',
    'stok',
    'min_stok',
    'barcode',
    'deskripsi',
    'aktif',
    'images'
  ]

  const fields = []
  const params = { id }

  for (const key of allowed) {
    if (data[key] === undefined) continue

    let val = data[key]
    if (key === 'aktif') val = val ? 1 : 0
    if (['harga_beli', 'harga_jual', 'stok', 'min_stok'].includes(key)) val = Number(val) || 0

    fields.push(`${key} = @${key}`)
    params[key] = val
  }

  if (fields.length === 0) return productGetById(id)

  fields.push(`updated_at = datetime('now', 'localtime')`)
  db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = @id`).run(params)
  return productGetById(id)
}

export function productDelete(id) {
  getDb().prepare(`DELETE FROM products WHERE id = ?`).run(id)
  return { id }
}

export function productAdjustStok(id, delta) {
  const db = getDb()
  db.prepare(
    `UPDATE products
     SET stok = MAX(0, stok + @delta),
         updated_at = datetime('now', 'localtime')
     WHERE id = @id`
  ).run({ id, delta })
  return productGetById(id)
}

// ── private ─────────────────────────────────────────────────────────────────

function _generateKode(db) {
  const row = db
    .prepare(`SELECT kode FROM products WHERE kode LIKE 'PRD-%' ORDER BY id DESC LIMIT 1`)
    .get()

  if (!row) return 'PRD-0001'

  const num = parseInt(row.kode.replace('PRD-', ''), 10)
  return `PRD-${String(num + 1).padStart(4, '0')}`
}
