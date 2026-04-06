import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { getDb } from '../database.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalize = (value) => String(value || '').trim()

const sanitizeUser = (row) => {
  if (!row) return null

  return {
    id: row.id,
    email: row.email || '',
    username: row.username,
    role: row.role,
    aktif: Boolean(row.aktif),
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

const hashSecret = (secret) => {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(String(secret), salt, 64).toString('hex')
  return `${salt}:${hash}`
}

const verifySecret = (secret, storedHash) => {
  const raw = normalize(storedHash)
  if (!raw) return false

  const [salt, hash] = raw.split(':')
  if (!salt || !hash) return false

  const candidate = Buffer.from(scryptSync(String(secret), salt, 64).toString('hex'), 'hex')
  const expected = Buffer.from(hash, 'hex')
  if (candidate.length !== expected.length) return false

  return timingSafeEqual(candidate, expected)
}

const getUserByUsername = (username) => {
  const db = getDb()
  return db
    .prepare(`SELECT * FROM users WHERE username = ? COLLATE NOCASE LIMIT 1`)
    .get(normalize(username))
}

export function authLoginSuper({ username = '', password = '' }) {
  const user = getUserByUsername(username)
  if (!user || !user.aktif || user.role !== 'super') {
    throw new Error('Akun super admin tidak ditemukan')
  }

  if (!verifySecret(password, user.password_hash)) {
    throw new Error('Username atau password salah')
  }

  return sanitizeUser(user)
}

export function authLoginCashier({ username = '', pin = '' }) {
  const user = getUserByUsername(username)
  if (!user || !user.aktif || user.role !== 'cashier') {
    throw new Error('Akun kasir tidak ditemukan')
  }

  if (!verifySecret(pin, user.pin_hash)) {
    throw new Error('Username atau PIN salah')
  }

  return sanitizeUser(user)
}

export function authCashierCreate({ email = '', username = '', pin = '', createdBy = '' }) {
  const db = getDb()
  const normalizedUsername = normalize(username)
  const normalizedPin = normalize(pin)
  const normalizedEmail = normalize(email)

  if (!normalizedUsername || normalizedUsername.length < 4) {
    throw new Error('Username minimal 4 karakter')
  }

  if (!/^\d{6,12}$/.test(normalizedPin)) {
    throw new Error('PIN harus 6-12 digit angka')
  }

  if (normalizedEmail && !EMAIL_REGEX.test(normalizedEmail)) {
    throw new Error('Format email tidak valid')
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO users (email, username, role, password_hash, pin_hash, aktif, created_by)
         VALUES (@email, @username, 'cashier', '', @pin_hash, 1, @created_by)`
      )
      .run({
        email: normalizedEmail || null,
        username: normalizedUsername,
        pin_hash: hashSecret(normalizedPin),
        created_by: normalize(createdBy)
      })

    return authUserById(result.lastInsertRowid)
  } catch (error) {
    if (String(error.message || '').includes('UNIQUE')) {
      throw new Error('Username atau email sudah terdaftar')
    }
    throw error
  }
}

export function authCashierGetAll() {
  const db = getDb()
  return db
    .prepare(
      `SELECT id, email, username, role, aktif, created_by, created_at, updated_at
       FROM users
       WHERE role = 'cashier'
       ORDER BY datetime(created_at) DESC, username ASC`
    )
    .all()
    .map(sanitizeUser)
}

export function authUserById(id) {
  const db = getDb()
  const row = db
    .prepare(
      `SELECT id, email, username, role, aktif, created_by, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`
    )
    .get(id)

  return sanitizeUser(row)
}

const sanitizeSession = (row) => {
  if (!row) return null

  return {
    id: row.id,
    cashier_username: row.cashier_username,
    opened_by: row.opened_by,
    opened_at: row.opened_at,
    opening_cash: Number(row.opening_cash || 0),
    open_note: row.open_note || '',
    closed_at: row.closed_at || null,
    closing_cash:
      row.closing_cash === null || row.closing_cash === undefined ? null : Number(row.closing_cash),
    close_note: row.close_note || '',
    total_transactions: Number(row.total_transactions || 0),
    total_sales: Number(row.total_sales || 0),
    total_cash_sales: Number(row.total_cash_sales || 0),
    expected_cash: Number(row.expected_cash || 0),
    cash_difference: Number(row.cash_difference || 0),
    is_active: !row.closed_at
  }
}

export function authGetActiveCashierSession({ username = '' }) {
  const db = getDb()
  const normalizedUsername = normalize(username)
  if (!normalizedUsername) return null

  const row = db
    .prepare(
      `SELECT *
       FROM cashier_sessions
       WHERE cashier_username = ? COLLATE NOCASE
         AND closed_at IS NULL
       ORDER BY id DESC
       LIMIT 1`
    )
    .get(normalizedUsername)

  return sanitizeSession(row)
}

export function authOpenCashierSession({
  username = '',
  openingCash = 0,
  note = '',
  openedBy = ''
}) {
  const db = getDb()
  const normalizedUsername = normalize(username)
  if (!normalizedUsername) throw new Error('Username kasir wajib diisi')

  const existingActive = authGetActiveCashierSession({ username: normalizedUsername })
  if (existingActive) {
    throw new Error('Kasir masih memiliki sesi aktif. Tutup sesi sebelumnya terlebih dahulu')
  }

  const result = db
    .prepare(
      `INSERT INTO cashier_sessions
         (cashier_username, opened_by, opening_cash, open_note)
       VALUES
         (@cashier_username, @opened_by, @opening_cash, @open_note)`
    )
    .run({
      cashier_username: normalizedUsername,
      opened_by: normalize(openedBy) || normalizedUsername,
      opening_cash: Math.max(0, Number(openingCash) || 0),
      open_note: normalize(note)
    })

  return sanitizeSession(
    db.prepare(`SELECT * FROM cashier_sessions WHERE id = ? LIMIT 1`).get(result.lastInsertRowid)
  )
}

export function authCloseCashierSession({ sessionId, closingCash = 0, note = '' }) {
  const db = getDb()
  const id = Number(sessionId)
  if (!id) throw new Error('Sesi kasir tidak valid')

  const session = db.prepare(`SELECT * FROM cashier_sessions WHERE id = ? LIMIT 1`).get(id)
  if (!session) throw new Error('Sesi kasir tidak ditemukan')
  if (session.closed_at) throw new Error('Sesi kasir ini sudah ditutup')

  const summary = db
    .prepare(
      `SELECT
         COUNT(*) AS total_transactions,
         COALESCE(SUM(total), 0) AS total_sales,
         COALESCE(SUM(CASE WHEN metode_bayar = 'tunai' THEN total ELSE 0 END), 0) AS total_cash_sales
       FROM transactions
       WHERE status = 'selesai'
         AND kasir = @kasir
         AND datetime(created_at) >= datetime(@opened_at)
         AND datetime(created_at) <= datetime('now', 'localtime')`
    )
    .get({ kasir: session.cashier_username, opened_at: session.opened_at })

  const openingCash = Number(session.opening_cash || 0)
  const totalCashSales = Number(summary.total_cash_sales || 0)
  const expectedCash = openingCash + totalCashSales
  const finalClosingCash = Math.max(0, Number(closingCash) || 0)
  const cashDifference = finalClosingCash - expectedCash

  db.prepare(
    `UPDATE cashier_sessions
     SET
       closed_at = datetime('now', 'localtime'),
       closing_cash = @closing_cash,
       close_note = @close_note,
       total_transactions = @total_transactions,
       total_sales = @total_sales,
       total_cash_sales = @total_cash_sales,
       expected_cash = @expected_cash,
       cash_difference = @cash_difference
     WHERE id = @id`
  ).run({
    id,
    closing_cash: finalClosingCash,
    close_note: normalize(note),
    total_transactions: Number(summary.total_transactions || 0),
    total_sales: Number(summary.total_sales || 0),
    total_cash_sales: totalCashSales,
    expected_cash: expectedCash,
    cash_difference: cashDifference
  })

  return sanitizeSession(db.prepare(`SELECT * FROM cashier_sessions WHERE id = ? LIMIT 1`).get(id))
}

export function authGetCashierSessionHistory({ username = '', limit = 20 }) {
  const db = getDb()
  const normalizedUsername = normalize(username)
  if (!normalizedUsername) return []

  return db
    .prepare(
      `SELECT *
       FROM cashier_sessions
       WHERE cashier_username = ? COLLATE NOCASE
       ORDER BY id DESC
       LIMIT ?`
    )
    .all(normalizedUsername, Math.max(1, Number(limit) || 20))
    .map(sanitizeSession)
}
