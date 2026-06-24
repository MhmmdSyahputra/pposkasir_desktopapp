import { getDb } from '../database.js'

export function customerCreate({ nama, telepon, alamat }) {
  const db = getDb()
  const stmt = db.prepare(
    `INSERT INTO customers (nama, telepon, alamat, total_hutang)
     VALUES (@nama, @telepon, @alamat, 0)`
  )
  const result = stmt.run({ nama, telepon, alamat })
  return customerGetById(result.lastInsertRowid)
}

export function customerGetById(id) {
  const db = getDb()
  return db.prepare(`SELECT * FROM customers WHERE id = ?`).get(id)
}

export function customerGetAll() {
  const db = getDb()
  return db.prepare(`SELECT * FROM customers ORDER BY nama ASC`).all()
}

export function customerUpdate({ id, nama, telepon, alamat }) {
  const db = getDb()
  const stmt = db.prepare(
    `UPDATE customers
     SET nama = @nama, telepon = @telepon, alamat = @alamat
     WHERE id = @id`
  )
  stmt.run({ id, nama, telepon, alamat })
  return customerGetById(id)
}

export function customerDelete(id) {
  const db = getDb()
  const stmt = db.prepare(`DELETE FROM customers WHERE id = ?`)
  const result = stmt.run(id)
  return result.changes > 0
}

export function debtPaymentCreate({ customerId, jumlahBayar, metodeBayar, keterangan, kasir }) {
  const db = getDb()
  const insertPaymentStmt = db.prepare(
    `INSERT INTO debt_payments (customer_id, jumlah_bayar, metode_bayar, keterangan, kasir)
     VALUES (@customerId, @jumlahBayar, @metodeBayar, @keterangan, @kasir)`
  )
  const updateCustomerStmt = db.prepare(
    `UPDATE customers
     SET total_hutang = total_hutang - @jumlahBayar
     WHERE id = @customerId`
  )

  const paymentId = db.transaction(() => {
    const res = insertPaymentStmt.run({ customerId, jumlahBayar, metodeBayar, keterangan, kasir })
    updateCustomerStmt.run({ customerId, jumlahBayar })
    return res.lastInsertRowid
  })()

  return db.prepare(`SELECT * FROM debt_payments WHERE id = ?`).get(paymentId)
}

export function debtPaymentGetHistory(customerId) {
  const db = getDb()
  return db
    .prepare(`SELECT * FROM debt_payments WHERE customer_id = ? ORDER BY created_at DESC`)
    .all(customerId)
}
