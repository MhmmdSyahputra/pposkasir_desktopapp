import { getDb } from '../database.js'

// ── helpers ──────────────────────────────────────────────────────────────────

function _normalizeCartItem(item) {
  const productId = item.product_id ?? item.id ?? null
  const productName = item.nama_produk ?? item.name ?? ''
  const unitPrice = Number(item.harga_satuan ?? item.price ?? 0) || 0
  const basePrice =
    Number(item.harga_dasar ?? item.basePrice ?? item.harga_satuan ?? item.price ?? 0) || 0
  const quantity = Number(item.qty ?? 1) || 1
  const lineSubtotal = Number(item.subtotal ?? unitPrice * quantity) || 0

  return {
    productId,
    productName,
    unitPrice,
    basePrice,
    quantity,
    lineSubtotal,
    note: item.catatan ?? item.note ?? '',
    modifierSummary: item.modifier_summary ?? item.summaryLabel ?? ''
  }
}

function _generateNoTrx(db) {
  const today = new Date()
  const ymd =
    String(today.getFullYear()) +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0')
  const prefix = `TRX-${ymd}-`
  const last = db
    .prepare(
      `SELECT no_transaksi FROM transactions
       WHERE no_transaksi LIKE ?
       ORDER BY id DESC LIMIT 1`
    )
    .get(`${prefix}%`)
  let seq = 1
  if (last) {
    const parts = last.no_transaksi.split('-')
    seq = parseInt(parts[parts.length - 1], 10) + 1
  }
  return `${prefix}${String(seq).padStart(4, '0')}`
}

function _getItems(db, transactionId) {
  return db
    .prepare(`SELECT * FROM transaction_items WHERE transaction_id = ? ORDER BY id ASC`)
    .all(transactionId)
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * Create a new transaction with its line items atomically.
 * @param {object} payload
 * @param {Array}  payload.items – cart items
 * @param {number} payload.subtotal
 * @param {number} payload.diskon
 * @param {number} payload.pajak
 * @param {number} payload.total
 * @param {number} payload.bayar
 * @param {number} payload.kembalian
 * @param {string} payload.metode_bayar – tunai | qris | kartu | transfer
 * @param {string} [payload.catatan]
 * @param {string} [payload.kasir]
 */
export function transactionCreate({
  items = [],
  subtotal = 0,
  diskon = 0,
  pajak = 0,
  total = 0,
  bayar = 0,
  kembalian = 0,
  metode_bayar = 'tunai',
  catatan = '',
  kasir = '',
  nama_pelanggan = ''
}) {
  const db = getDb()
  const normalizedItems = items.map(_normalizeCartItem)
  const insertTransactionStmt = db.prepare(
    `INSERT INTO transactions
       (no_transaksi, subtotal, diskon, pajak, total, bayar, kembalian, metode_bayar, catatan, kasir, status, nama_pelanggan)
     VALUES
       (@no_transaksi, @subtotal, @diskon, @pajak, @total, @bayar, @kembalian, @metode_bayar, @catatan, @kasir, 'selesai', @nama_pelanggan)`
  )

  const itemStmt = db.prepare(
    `INSERT INTO transaction_items
       (transaction_id, product_id, nama_produk, harga_satuan, harga_dasar, qty, subtotal, catatan, modifier_summary)
     VALUES
       (@transaction_id, @product_id, @nama_produk, @harga_satuan, @harga_dasar, @qty, @subtotal, @catatan, @modifier_summary)`
  )
  const productStockStmt = db.prepare(`SELECT id, nama, stok FROM products WHERE id = ?`)
  const decrementStockStmt = db.prepare(
    `UPDATE products
     SET stok = stok - @quantity,
         updated_at = datetime('now', 'localtime')
     WHERE id = @productId`
  )

  const txId = db.transaction(() => {
    for (const item of normalizedItems) {
      if (!item.productId) continue

      const product = productStockStmt.get(item.productId)
      if (!product) {
        throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan`)
      }

      if (Number(product.stok) < item.quantity) {
        throw new Error(
          `Stok ${product.nama} tidak cukup. Tersedia ${product.stok}, diminta ${item.quantity}`
        )
      }
    }

    const result = insertTransactionStmt.run({
      no_transaksi: _generateNoTrx(db),
      subtotal,
      diskon,
      pajak,
      total,
      bayar,
      kembalian,
      metode_bayar,
      catatan,
      kasir,
      nama_pelanggan
    })

    const newTxId = result.lastInsertRowid

    for (const item of normalizedItems) {
      itemStmt.run({
        transaction_id: newTxId,
        product_id: item.productId,
        nama_produk: item.productName,
        harga_satuan: item.unitPrice,
        harga_dasar: item.basePrice,
        qty: item.quantity,
        subtotal: item.lineSubtotal,
        catatan: item.note,
        modifier_summary: item.modifierSummary
      })

      if (!item.productId) continue

      decrementStockStmt.run({
        productId: item.productId,
        quantity: item.quantity
      })
    }

    return newTxId
  })()

  return transactionGetById(txId)
}

export function transactionGetById(id) {
  const db = getDb()
  const trx = db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(id)
  if (!trx) return null
  trx.items = _getItems(db, id)
  return trx
}

/**
 * List transactions with optional filters.
 * @param {object} opts
 * @param {string} [opts.search]      – no_transaksi or kasir
 * @param {string} [opts.status]      – selesai | batal
 * @param {string} [opts.tanggal]     – exact date YYYY-MM-DD
 * @param {number} [opts.limit]
 * @param {number} [opts.offset]
 */
export function transactionGetAll({
  search = '',
  status = '',
  tanggal = '',
  limit = 50,
  offset = 0
} = {}) {
  const db = getDb()
  const conditions = []
  const params = {}

  if (search) {
    conditions.push(`(t.no_transaksi LIKE @search OR t.kasir LIKE @search)`)
    params.search = `%${search}%`
  }
  if (status) {
    conditions.push(`t.status = @status`)
    params.status = status
  }
  if (tanggal) {
    conditions.push(`date(t.created_at) = @tanggal`)
    params.tanggal = tanggal
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  params.limit = limit
  params.offset = offset

  const rows = db
    .prepare(
      `SELECT t.*, (SELECT COUNT(*) FROM transaction_items ti WHERE ti.transaction_id = t.id) AS item_count
       FROM transactions t ${where}
       ORDER BY t.created_at DESC
       LIMIT @limit OFFSET @offset`
    )
    .all(params)

  const total = db.prepare(`SELECT COUNT(*) as cnt FROM transactions t ${where}`).get(params).cnt

  return { rows, total }
}

export function transactionGetStats({ tanggal = '' } = {}) {
  const db = getDb()
  const where = tanggal
    ? `WHERE date(t.created_at) = @tanggal AND t.status = 'selesai'`
    : `WHERE t.status = 'selesai'`
  const params = tanggal ? { tanggal } : {}

  const summary = db
    .prepare(
      `SELECT
         COUNT(*)          AS jumlah,
         COALESCE(SUM(t.total), 0) AS omzet,
         COALESCE(SUM(t.diskon), 0) AS total_diskon
       FROM transactions t ${where}`
    )
    .get(params)

  const byMethod = db
    .prepare(
      `SELECT
         t.metode_bayar,
         COUNT(*) AS jumlah,
         COALESCE(SUM(t.total), 0) AS total
       FROM transactions t ${where}
       GROUP BY t.metode_bayar
       ORDER BY total DESC`
    )
    .all(params)

  const topProducts = db
    .prepare(
      `SELECT
         ti.nama_produk,
         COALESCE(SUM(ti.qty), 0) AS qty,
         COALESCE(SUM(ti.subtotal), 0) AS total
       FROM transaction_items ti
       JOIN transactions t ON t.id = ti.transaction_id
       ${where}
       GROUP BY ti.nama_produk
       ORDER BY qty DESC
       LIMIT 5`
    )
    .all(params)

  return { ...summary, byMethod, topProducts }
}

/**
 * Get report dataset with summary, breakdown, and detail rows.
 * @param {object} opts
 * @param {string} [opts.startDate] - YYYY-MM-DD
 * @param {string} [opts.endDate] - YYYY-MM-DD
 * @param {string} [opts.status] - all | selesai | batal
 * @param {string} [opts.metode] - all | tunai | qris | kartu | transfer
 * @param {string} [opts.search]
 * @param {number} [opts.limit]
 * @param {number} [opts.offset]
 */
export function transactionGetReport({
  startDate = '',
  endDate = '',
  status = 'all',
  metode = 'all',
  search = '',
  limit = 500,
  offset = 0
} = {}) {
  const db = getDb()
  const conditions = []
  const params = {}

  if (startDate) {
    conditions.push(`date(t.created_at) >= @startDate`)
    params.startDate = startDate
  }
  if (endDate) {
    conditions.push(`date(t.created_at) <= @endDate`)
    params.endDate = endDate
  }
  if (status && status !== 'all') {
    conditions.push(`t.status = @status`)
    params.status = status
  }
  if (metode && metode !== 'all') {
    conditions.push(`t.metode_bayar = @metode`)
    params.metode = metode
  }
  if (search) {
    conditions.push(`(t.no_transaksi LIKE @search OR t.kasir LIKE @search)`)
    params.search = `%${search}%`
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  params.limit = Math.max(1, Number(limit) || 500)
  params.offset = Math.max(0, Number(offset) || 0)

  const summary = db
    .prepare(
      `SELECT
         COUNT(*) AS total_transaksi,
         COALESCE(SUM(CASE WHEN t.status = 'selesai' THEN 1 ELSE 0 END), 0) AS transaksi_selesai,
         COALESCE(SUM(CASE WHEN t.status = 'batal' THEN 1 ELSE 0 END), 0) AS transaksi_batal,
         COALESCE(SUM(CASE WHEN t.status = 'selesai' THEN t.subtotal ELSE 0 END), 0) AS subtotal_bruto,
         COALESCE(SUM(CASE WHEN t.status = 'selesai' THEN t.diskon ELSE 0 END), 0) AS total_diskon,
         COALESCE(SUM(CASE WHEN t.status = 'selesai' THEN t.total ELSE 0 END), 0) AS omzet_bersih,
         COALESCE(AVG(CASE WHEN t.status = 'selesai' THEN t.total ELSE NULL END), 0) AS rata_rata_transaksi
       FROM transactions t ${where}`
    )
    .get(params)

  const byMethod = db
    .prepare(
      `SELECT
         t.metode_bayar,
         COUNT(*) AS jumlah,
         COALESCE(SUM(CASE WHEN t.status = 'selesai' THEN t.total ELSE 0 END), 0) AS total
       FROM transactions t ${where}
       GROUP BY t.metode_bayar
       ORDER BY total DESC, jumlah DESC`
    )
    .all(params)

  const daily = db
    .prepare(
      `SELECT
         date(t.created_at) AS tanggal,
         COUNT(*) AS jumlah,
         COALESCE(SUM(CASE WHEN t.status = 'selesai' THEN t.total ELSE 0 END), 0) AS total
       FROM transactions t ${where}
       GROUP BY date(t.created_at)
       ORDER BY tanggal ASC`
    )
    .all(params)

  const topProducts = db
    .prepare(
      `SELECT
         ti.nama_produk,
         COALESCE(SUM(ti.qty), 0) AS qty,
         COALESCE(SUM(ti.subtotal), 0) AS total
       FROM transaction_items ti
       JOIN transactions t ON t.id = ti.transaction_id
       ${where}
       GROUP BY ti.nama_produk
       ORDER BY qty DESC, total DESC
       LIMIT 10`
    )
    .all(params)

  const rows = db
    .prepare(
      `SELECT
         t.*,
         (SELECT COUNT(*) FROM transaction_items ti WHERE ti.transaction_id = t.id) AS item_count
       FROM transactions t ${where}
       ORDER BY t.created_at DESC
       LIMIT @limit OFFSET @offset`
    )
    .all(params)

  const totalRows = db
    .prepare(`SELECT COUNT(*) AS cnt FROM transactions t ${where}`)
    .get(params).cnt

  return {
    summary,
    byMethod,
    daily,
    topProducts,
    rows,
    totalRows,
    filters: { startDate, endDate, status, metode, search }
  }
}

export function transactionVoid(id) {
  const db = getDb()
  db.transaction((transactionId) => {
    const trx = db.prepare(`SELECT id, status FROM transactions WHERE id = ?`).get(transactionId)
    if (!trx) throw new Error('Transaksi tidak ditemukan')
    if (trx.status === 'batal') return

    const restoreStockStmt = db.prepare(
      `UPDATE products
       SET stok = stok + @quantity,
           updated_at = datetime('now', 'localtime')
       WHERE id = @productId`
    )

    for (const item of _getItems(db, transactionId)) {
      if (!item.product_id) continue
      restoreStockStmt.run({
        productId: item.product_id,
        quantity: Number(item.qty) || 0
      })
    }

    db.prepare(`UPDATE transactions SET status = 'batal' WHERE id = ?`).run(transactionId)
  })(id)

  return transactionGetById(id)
}
