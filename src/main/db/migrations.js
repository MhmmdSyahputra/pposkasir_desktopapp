import { randomBytes, scryptSync } from 'crypto'

const hashSecret = (secret) => {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(String(secret), salt, 64).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Database migrations – executed once per schema version.
 * Add new migrations to the end of the array; never modify existing entries.
 */
export const migrations = [
  {
    version: 1,
    description: 'Initial schema – categories and products',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          nama       TEXT    NOT NULL UNIQUE,
          deskripsi  TEXT,
          aktif      INTEGER NOT NULL DEFAULT 1,
          created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
          updated_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        CREATE TABLE IF NOT EXISTS products (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          kode        TEXT    UNIQUE,
          nama        TEXT    NOT NULL,
          kategori    TEXT,
          satuan      TEXT,
          harga_beli  REAL    NOT NULL DEFAULT 0,
          harga_jual  REAL    NOT NULL DEFAULT 0,
          stok        REAL    NOT NULL DEFAULT 0,
          min_stok    REAL    NOT NULL DEFAULT 0,
          barcode     TEXT,
          deskripsi   TEXT,
          aktif       INTEGER NOT NULL DEFAULT 1,
          created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
          updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        CREATE INDEX IF NOT EXISTS idx_products_kategori ON products (kategori);
        CREATE INDEX IF NOT EXISTS idx_products_aktif    ON products (aktif);
        CREATE INDEX IF NOT EXISTS idx_products_kode     ON products (kode);
      `)
    }
  },
  {
    version: 2,
    description: 'Add units table',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS units (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          nama       TEXT    NOT NULL UNIQUE,
          singkatan  TEXT    NOT NULL,
          deskripsi  TEXT,
          aktif      INTEGER NOT NULL DEFAULT 1,
          created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
          updated_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
        );
      `)
    }
  },
  {
    version: 3,
    description: 'Add images column to products',
    up: (db) => {
      db.exec(`ALTER TABLE products ADD COLUMN images TEXT DEFAULT '[]'`)
    }
  },
  {
    version: 4,
    description: 'Modifier groups, options, and product-modifier mapping',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS modifier_groups (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          nama       TEXT    NOT NULL,
          tipe       TEXT    NOT NULL DEFAULT 'single',
          wajib      INTEGER NOT NULL DEFAULT 0,
          min_pilih  INTEGER NOT NULL DEFAULT 0,
          max_pilih  INTEGER NOT NULL DEFAULT 1,
          urutan     INTEGER NOT NULL DEFAULT 0,
          aktif      INTEGER NOT NULL DEFAULT 1,
          created_at TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
          updated_at TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS modifier_options (
          id           INTEGER PRIMARY KEY AUTOINCREMENT,
          group_id     INTEGER NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
          nama         TEXT    NOT NULL,
          harga_tambah INTEGER NOT NULL DEFAULT 0,
          emoji        TEXT    NOT NULL DEFAULT '',
          urutan       INTEGER NOT NULL DEFAULT 0,
          aktif        INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS product_modifier_groups (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL REFERENCES products(id)        ON DELETE CASCADE,
          group_id   INTEGER NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
          urutan     INTEGER NOT NULL DEFAULT 0,
          UNIQUE(product_id, group_id)
        );

        CREATE INDEX IF NOT EXISTS idx_modifier_options_group ON modifier_options(group_id);
        CREATE INDEX IF NOT EXISTS idx_prod_mod_product       ON product_modifier_groups(product_id);
      `)
    }
  },
  {
    version: 5,
    description: 'Transactions and transaction items',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS transactions (
          id             INTEGER PRIMARY KEY AUTOINCREMENT,
          no_transaksi   TEXT    NOT NULL UNIQUE,
          subtotal       INTEGER NOT NULL DEFAULT 0,
          diskon         INTEGER NOT NULL DEFAULT 0,
          pajak          INTEGER NOT NULL DEFAULT 0,
          total          INTEGER NOT NULL DEFAULT 0,
          bayar          INTEGER NOT NULL DEFAULT 0,
          kembalian      INTEGER NOT NULL DEFAULT 0,
          metode_bayar   TEXT    NOT NULL DEFAULT 'tunai',
          catatan        TEXT    NOT NULL DEFAULT '',
          status         TEXT    NOT NULL DEFAULT 'selesai',
          kasir          TEXT    NOT NULL DEFAULT '',
          created_at     TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS transaction_items (
          id               INTEGER PRIMARY KEY AUTOINCREMENT,
          transaction_id   INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
          product_id       INTEGER,
          nama_produk      TEXT    NOT NULL,
          harga_satuan     INTEGER NOT NULL,
          harga_dasar      INTEGER NOT NULL DEFAULT 0,
          qty              INTEGER NOT NULL DEFAULT 1,
          subtotal         INTEGER NOT NULL DEFAULT 0,
          catatan          TEXT    NOT NULL DEFAULT '',
          modifier_summary TEXT    NOT NULL DEFAULT '',
          created_at       TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE INDEX IF NOT EXISTS idx_transactions_created  ON transactions(created_at);
        CREATE INDEX IF NOT EXISTS idx_transactions_status   ON transactions(status);
        CREATE INDEX IF NOT EXISTS idx_trx_items_transaction ON transaction_items(transaction_id);
      `)
    }
  },
  {
    version: 6,
    description: 'Users auth table and default super admin account',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id            INTEGER PRIMARY KEY AUTOINCREMENT,
          email         TEXT,
          username      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
          role          TEXT    NOT NULL CHECK(role IN ('super', 'cashier')),
          password_hash TEXT    NOT NULL DEFAULT '',
          pin_hash      TEXT    NOT NULL DEFAULT '',
          aktif         INTEGER NOT NULL DEFAULT 1,
          created_by    TEXT    NOT NULL DEFAULT '',
          created_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
          updated_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
          ON users(email)
          WHERE email IS NOT NULL AND email <> '';

        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      `)

      const existingSuper = db
        .prepare(`SELECT id FROM users WHERE username = ? COLLATE NOCASE LIMIT 1`)
        .get('adminppos')

      if (!existingSuper) {
        db.prepare(
          `INSERT INTO users (email, username, role, password_hash, pin_hash, aktif, created_by)
           VALUES (@email, @username, @role, @password_hash, @pin_hash, @aktif, @created_by)`
        ).run({
          email: null,
          username: 'adminppos',
          role: 'super',
          password_hash: hashSecret('12345678'),
          pin_hash: '',
          aktif: 1,
          created_by: 'system'
        })
      }
    }
  },
  {
    version: 7,
    description: 'Cashier shift sessions for open and close tracking',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS cashier_sessions (
          id                 INTEGER PRIMARY KEY AUTOINCREMENT,
          cashier_username   TEXT    NOT NULL,
          opened_by          TEXT    NOT NULL DEFAULT '',
          opened_at          TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
          opening_cash       INTEGER NOT NULL DEFAULT 0,
          open_note          TEXT    NOT NULL DEFAULT '',
          closed_at          TEXT,
          closing_cash       INTEGER,
          close_note         TEXT    NOT NULL DEFAULT '',
          total_transactions INTEGER NOT NULL DEFAULT 0,
          total_sales        INTEGER NOT NULL DEFAULT 0,
          total_cash_sales   INTEGER NOT NULL DEFAULT 0,
          expected_cash      INTEGER NOT NULL DEFAULT 0,
          cash_difference    INTEGER NOT NULL DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_cashier_sessions_user_time
          ON cashier_sessions(cashier_username, opened_at DESC);

        CREATE INDEX IF NOT EXISTS idx_cashier_sessions_active
          ON cashier_sessions(cashier_username, closed_at);
      `)
    }
  }
]
