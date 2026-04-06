import { getDb } from '../database.js'

// ── Modifier Group CRUD ───────────────────────────────────────────────────

export function modifierGroupGetAll({ search = '' } = {}) {
  const db = getDb()
  const rows = search
    ? db
        .prepare(`SELECT * FROM modifier_groups WHERE nama LIKE ? ORDER BY urutan ASC, nama ASC`)
        .all(`%${search}%`)
    : db.prepare(`SELECT * FROM modifier_groups ORDER BY urutan ASC, nama ASC`).all()

  const optStmt = db.prepare(
    `SELECT * FROM modifier_options WHERE group_id = ? ORDER BY urutan ASC, id ASC`
  )
  return rows.map((g) => ({ ...g, options: optStmt.all(g.id) }))
}

export function modifierGroupGetById(id) {
  const db = getDb()
  const group = db.prepare(`SELECT * FROM modifier_groups WHERE id = ?`).get(id)
  if (!group) return null
  group.options = db
    .prepare(`SELECT * FROM modifier_options WHERE group_id = ? ORDER BY urutan ASC, id ASC`)
    .all(id)
  return group
}

export function modifierGroupCreate({
  nama,
  tipe = 'single',
  wajib = 0,
  min_pilih = 0,
  max_pilih = 1,
  urutan = 0,
  aktif = 1,
  options = []
}) {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO modifier_groups (nama, tipe, wajib, min_pilih, max_pilih, urutan, aktif)
       VALUES (@nama, @tipe, @wajib, @min_pilih, @max_pilih, @urutan, @aktif)`
    )
    .run({ nama, tipe, wajib: wajib ? 1 : 0, min_pilih, max_pilih, urutan, aktif: aktif ? 1 : 0 })

  const groupId = result.lastInsertRowid
  _insertOptions(db, groupId, options)
  return modifierGroupGetById(groupId)
}

export function modifierGroupUpdate(
  id,
  { nama, tipe, wajib, min_pilih, max_pilih, urutan, aktif, options }
) {
  const db = getDb()
  const fields = []
  const params = { id }

  if (nama !== undefined) {
    fields.push('nama = @nama')
    params.nama = nama
  }
  if (tipe !== undefined) {
    fields.push('tipe = @tipe')
    params.tipe = tipe
  }
  if (wajib !== undefined) {
    fields.push('wajib = @wajib')
    params.wajib = wajib ? 1 : 0
  }
  if (min_pilih !== undefined) {
    fields.push('min_pilih = @min_pilih')
    params.min_pilih = min_pilih
  }
  if (max_pilih !== undefined) {
    fields.push('max_pilih = @max_pilih')
    params.max_pilih = max_pilih
  }
  if (urutan !== undefined) {
    fields.push('urutan = @urutan')
    params.urutan = urutan
  }
  if (aktif !== undefined) {
    fields.push('aktif = @aktif')
    params.aktif = aktif ? 1 : 0
  }

  if (fields.length > 0) {
    fields.push(`updated_at = datetime('now','localtime')`)
    db.prepare(`UPDATE modifier_groups SET ${fields.join(', ')} WHERE id = @id`).run(params)
  }

  if (options !== undefined) {
    db.prepare(`DELETE FROM modifier_options WHERE group_id = ?`).run(id)
    _insertOptions(db, id, options)
  }

  return modifierGroupGetById(id)
}

export function modifierGroupDelete(id) {
  // options + product_modifier_groups cascade via FK ON DELETE CASCADE
  getDb().prepare(`DELETE FROM modifier_groups WHERE id = ?`).run(id)
  return { id }
}

// ── Product ↔ Modifier Group mapping ─────────────────────────────────────

export function productModifierGroupsGetAll() {
  const db = getDb()
  const links = db
    .prepare(
      `SELECT pmg.product_id, pmg.group_id, pmg.urutan
       FROM product_modifier_groups pmg
       JOIN modifier_groups mg ON mg.id = pmg.group_id
       WHERE mg.aktif = 1
       ORDER BY pmg.product_id ASC, pmg.urutan ASC`
    )
    .all()
  if (links.length === 0) return {}

  const groupIds = [...new Set(links.map((l) => l.group_id))]
  const grpStmt = db.prepare(`SELECT * FROM modifier_groups WHERE id = ?`)
  const optStmt = db.prepare(
    `SELECT * FROM modifier_options WHERE group_id = ? AND aktif = 1 ORDER BY urutan ASC, id ASC`
  )
  const grpCache = {}
  for (const gid of groupIds) {
    const g = grpStmt.get(gid)
    if (g) grpCache[gid] = { ...g, options: optStmt.all(gid) }
  }

  const result = {}
  for (const link of links) {
    const pid = link.product_id
    if (!result[pid]) result[pid] = []
    if (grpCache[link.group_id]) result[pid].push(grpCache[link.group_id])
  }
  return result
}

export function productModifierGroupsGet(productId) {
  const db = getDb()
  const links = db
    .prepare(
      `SELECT pmg.group_id, pmg.urutan
       FROM product_modifier_groups pmg
       WHERE pmg.product_id = ?
       ORDER BY pmg.urutan ASC`
    )
    .all(productId)

  const grpStmt = db.prepare(`SELECT * FROM modifier_groups WHERE id = ?`)
  const optStmt = db.prepare(
    `SELECT * FROM modifier_options WHERE group_id = ? ORDER BY urutan ASC, id ASC`
  )

  return links
    .map((l) => {
      const group = grpStmt.get(l.group_id)
      if (!group) return null
      return { ...group, options: optStmt.all(group.id), urutan: l.urutan }
    })
    .filter(Boolean)
}

export function productModifierGroupsSet(productId, groupIds = []) {
  const db = getDb()
  const del = db.prepare(`DELETE FROM product_modifier_groups WHERE product_id = ?`)
  const ins = db.prepare(
    `INSERT OR IGNORE INTO product_modifier_groups (product_id, group_id, urutan) VALUES (?, ?, ?)`
  )

  db.transaction(() => {
    del.run(productId)
    groupIds.forEach((gid, idx) => ins.run(productId, gid, idx))
  })()

  return productModifierGroupsGet(productId)
}

// ── helpers ───────────────────────────────────────────────────────────────

function _insertOptions(db, groupId, options) {
  const stmt = db.prepare(
    `INSERT INTO modifier_options (group_id, nama, harga_tambah, emoji, urutan, aktif)
     VALUES (@group_id, @nama, @harga_tambah, @emoji, @urutan, @aktif)`
  )
  options.forEach((opt, idx) => {
    stmt.run({
      group_id: groupId,
      nama: opt.nama,
      harga_tambah: Number(opt.harga_tambah) || 0,
      emoji: opt.emoji || '',
      urutan: opt.urutan ?? idx,
      aktif: opt.aktif !== undefined ? (opt.aktif ? 1 : 0) : 1
    })
  })
}
