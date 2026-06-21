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
  const products = db.prepare(`SELECT * FROM products ${where} ORDER BY nama ASC`).all(params)

  const bundleIds = products.filter((p) => p.is_bundle).map((p) => p.id)
  if (bundleIds.length > 0) {
    const items = db
      .prepare(
        `
      SELECT b.*, p.nama as product_nama, p.kode as product_kode, p.stok as product_stok
      FROM product_bundle_items b 
      LEFT JOIN products p ON b.product_id = p.id
      WHERE b.bundle_id IN (${bundleIds.join(',')})
    `
      )
      .all()
    const map = {}
    for (const item of items) {
      if (!map[item.bundle_id]) map[item.bundle_id] = []
      map[item.bundle_id].push(item)
    }
    for (const p of products) {
      if (p.is_bundle) {
        p.bundle_items = map[p.id] || []
        // Calculate virtual stock for bundle
        if (p.bundle_items.length > 0) {
          p.stok = Math.min(
            ...p.bundle_items.map((item) => Math.floor((item.product_stok || 0) / (item.qty || 1)))
          )
        } else {
          p.stok = 0
        }
      }
    }
  }
  return products
}

export function productGetById(id) {
  const product = getDb().prepare(`SELECT * FROM products WHERE id = ?`).get(id)
  if (product && product.is_bundle) {
    product.bundle_items = getDb()
      .prepare(
        `
      SELECT b.*, p.nama as product_nama, p.kode as product_kode, p.stok as product_stok
      FROM product_bundle_items b 
      LEFT JOIN products p ON b.product_id = p.id
      WHERE b.bundle_id = ?
    `
      )
      .all(id)
    if (product.bundle_items.length > 0) {
      product.stok = Math.min(
        ...product.bundle_items.map((item) =>
          Math.floor((item.product_stok || 0) / (item.qty || 1))
        )
      )
    } else {
      product.stok = 0
    }
  }
  return product
}

export function productGetByKode(kode) {
  const product = getDb().prepare(`SELECT * FROM products WHERE kode = ?`).get(kode)
  if (product && product.is_bundle) {
    product.bundle_items = getDb()
      .prepare(
        `
      SELECT b.*, p.nama as product_nama, p.kode as product_kode
      FROM product_bundle_items b 
      LEFT JOIN products p ON b.product_id = p.id
      WHERE b.bundle_id = ?
    `
      )
      .all(product.id)
  }
  return product
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
  images = '[]',
  is_bundle = 0,
  bundle_items = []
}) {
  const db = getDb()

  // Auto-generate kode if not provided
  const finalKode = kode || _generateKode(db)

  let newId
  db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO products
           (kode, nama, kategori, satuan, harga_beli, harga_jual, stok, min_stok, barcode, deskripsi, aktif, images, is_bundle)
         VALUES
           (@kode, @nama, @kategori, @satuan, @harga_beli, @harga_jual, @stok, @min_stok, @barcode, @deskripsi, @aktif, @images, @is_bundle)`
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
        images,
        is_bundle: is_bundle ? 1 : 0
      })

    newId = result.lastInsertRowid

    if (is_bundle && Array.isArray(bundle_items) && bundle_items.length > 0) {
      const insertBundleItem = db.prepare(
        `INSERT INTO product_bundle_items (bundle_id, product_id, qty) VALUES (?, ?, ?)`
      )
      for (const item of bundle_items) {
        if (item.product_id) {
          insertBundleItem.run(newId, item.product_id, Number(item.qty) || 1)
        }
      }
    }
  })()

  return productGetById(newId)
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
    'images',
    'is_bundle'
  ]

  const fields = []
  const params = { id }

  for (const key of allowed) {
    if (data[key] === undefined) continue

    let val = data[key]
    if (key === 'aktif' || key === 'is_bundle') val = val ? 1 : 0
    if (['harga_beli', 'harga_jual', 'stok', 'min_stok'].includes(key)) val = Number(val) || 0

    fields.push(`${key} = @${key}`)
    params[key] = val
  }

  if (fields.length === 0 && data.bundle_items === undefined) return productGetById(id)

  db.transaction(() => {
    if (fields.length > 0) {
      fields.push(`updated_at = datetime('now', 'localtime')`)
      db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = @id`).run(params)
    }

    if (data.is_bundle !== undefined ? data.is_bundle : false) {
      if (Array.isArray(data.bundle_items)) {
        db.prepare(`DELETE FROM product_bundle_items WHERE bundle_id = ?`).run(id)
        const insertBundleItem = db.prepare(
          `INSERT INTO product_bundle_items (bundle_id, product_id, qty) VALUES (?, ?, ?)`
        )
        for (const item of data.bundle_items) {
          if (item.product_id) {
            insertBundleItem.run(id, item.product_id, Number(item.qty) || 1)
          }
        }
      }
    } else if (data.is_bundle === false || data.is_bundle === 0) {
      // If it was changed from bundle to normal, clear items
      db.prepare(`DELETE FROM product_bundle_items WHERE bundle_id = ?`).run(id)
    }
  })()

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

export function productBulkCreate(productsArray) {
  const db = getDb()
  let insertedCount = 0

  const insert = db.prepare(`
    INSERT INTO products
      (kode, nama, kategori, satuan, harga_beli, harga_jual, stok, min_stok, barcode, deskripsi, aktif, images)
    VALUES
      (@kode, @nama, @kategori, @satuan, @harga_beli, @harga_jual, @stok, @min_stok, @barcode, @deskripsi, @aktif, @images)
  `)

  const transaction = db.transaction((products) => {
    for (const p of products) {
      // Auto-generate kode if not provided
      const finalKode = p.kode || _generateKode(db)

      insert.run({
        kode: finalKode,
        nama: p.nama,
        kategori: p.kategori || '',
        satuan: p.satuan || '',
        harga_beli: Number(p.harga_beli) || 0,
        harga_jual: Number(p.harga_jual) || 0,
        stok: Number(p.stok) || 0,
        min_stok: Number(p.min_stok) || 0,
        barcode: p.barcode || '',
        deskripsi: p.deskripsi || '',
        aktif: p.aktif !== undefined ? (p.aktif ? 1 : 0) : 1,
        images: p.images || '[]'
      })
      insertedCount++
    }
  })

  transaction(productsArray)
  return { count: insertedCount }
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
