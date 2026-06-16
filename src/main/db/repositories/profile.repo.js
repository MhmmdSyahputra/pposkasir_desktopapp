import { getDb } from '../database.js'

/**
 * CRUD operations for the `store_profile` table.
 */
export const profileRepo = {
  /**
   * Get the store profile (row with id=1).
   */
  getProfile() {
    const db = getDb()
    const stmt = db.prepare('SELECT * FROM store_profile WHERE id = 1 LIMIT 1')
    return stmt.get() || null
  },

  /**
   * Insert or update the store profile.
   * @param {Object} data - The profile data { storeName, businessType, phoneNumber, address }
   */
  upsertProfile(data) {
    const db = getDb()
    const existing = this.getProfile()

    if (existing) {
      const stmt = db.prepare(`
        UPDATE store_profile 
        SET nama_toko = @nama_toko, 
            lini_bisnis = @lini_bisnis, 
            telepon = @telepon, 
            alamat = @alamat,
            updated_at = datetime('now', 'localtime')
        WHERE id = 1
      `)
      stmt.run({
        nama_toko: data.storeName || existing.nama_toko,
        lini_bisnis: data.businessType || existing.lini_bisnis,
        telepon: data.phoneNumber || existing.telepon,
        alamat: data.address || existing.alamat
      })
    } else {
      const stmt = db.prepare(`
        INSERT INTO store_profile (id, nama_toko, lini_bisnis, telepon, alamat)
        VALUES (1, @nama_toko, @lini_bisnis, @telepon, @alamat)
      `)
      stmt.run({
        nama_toko: data.storeName || '',
        lini_bisnis: data.businessType || '',
        telepon: data.phoneNumber || '',
        alamat: data.address || ''
      })
    }

    return this.getProfile()
  }
}
