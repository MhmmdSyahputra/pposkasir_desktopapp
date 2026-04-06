import { app } from 'electron'
import { existsSync, rmSync } from 'fs'
import { join } from 'path'
import { getDb } from '../database.js'
import { authLoginSuper } from './auth.repo.js'

const RESET_TABLES = [
  'transaction_items',
  'transactions',
  'product_modifier_groups',
  'modifier_options',
  'modifier_groups',
  'products',
  'categories',
  'units',
  'cashier_sessions'
]

export function systemResetAllData({ username = '', password = '' } = {}) {
  authLoginSuper({ username, password })

  const db = getDb()

  const runReset = db.transaction(() => {
    for (const table of RESET_TABLES) {
      db.prepare(`DELETE FROM ${table}`).run()
    }

    // Remove cashier accounts but keep super admin account(s).
    db.prepare(`DELETE FROM users WHERE role = 'cashier'`).run()

    // Reset AUTOINCREMENT counters for cleared tables.
    for (const table of RESET_TABLES) {
      db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(table)
    }
  })

  runReset()

  // Remove stored product images to keep storage in sync with reset state.
  const imageDir = join(app.getPath('userData'), 'product-images')
  if (existsSync(imageDir)) {
    rmSync(imageDir, { recursive: true, force: true })
  }

  return { ok: true }
}

export function systemSeedDummyData({ count = 10 } = {}) {
  const db = getDb()

  const seedCategories = [
    { nama: 'Makanan Utama', deskripsi: 'Menu utama harian' },
    { nama: 'Minuman Dingin', deskripsi: 'Pilihan minuman dingin' },
    { nama: 'Minuman Panas', deskripsi: 'Pilihan minuman panas' },
    { nama: 'Camilan', deskripsi: 'Snack dan gorengan' },
    { nama: 'Dessert', deskripsi: 'Makanan penutup' },
    { nama: 'Nasi', deskripsi: 'Olahan berbasis nasi' },
    { nama: 'Mie', deskripsi: 'Olahan berbasis mie' },
    { nama: 'Ayam', deskripsi: 'Menu ayam favorit' },
    { nama: 'Kopi', deskripsi: 'Minuman kopi' },
    { nama: 'Paket Hemat', deskripsi: 'Bundling menu hemat' }
  ]

  const seedUnits = [
    { nama: 'Porsi', singkatan: 'prs', deskripsi: 'Sajian per porsi' },
    { nama: 'Cup', singkatan: 'cup', deskripsi: 'Gelas cup plastik' },
    { nama: 'Gelas', singkatan: 'gls', deskripsi: 'Gelas standar' },
    { nama: 'Botol', singkatan: 'btl', deskripsi: 'Kemasan botol' },
    { nama: 'Potong', singkatan: 'ptg', deskripsi: 'Per potong' },
    { nama: 'Mangkuk', singkatan: 'mkg', deskripsi: 'Sajian per mangkuk' },
    { nama: 'Tusuk', singkatan: 'tsk', deskripsi: 'Satuan tusuk sate' },
    { nama: 'Pack', singkatan: 'pck', deskripsi: 'Kemasan pack' },
    { nama: 'Liter', singkatan: 'ltr', deskripsi: 'Satuan liter' },
    { nama: 'Gram', singkatan: 'gr', deskripsi: 'Satuan gram' }
  ]

  const seedModifiers = [
    {
      nama: 'Level Pedas',
      options: [
        { nama: 'Tidak Pedas', harga_tambah: 0 },
        { nama: 'Sedang', harga_tambah: 0 },
        { nama: 'Pedas', harga_tambah: 1000 },
        { nama: 'Sangat Pedas', harga_tambah: 2000 }
      ]
    },
    {
      nama: 'Jenis Nasi',
      options: [
        { nama: 'Nasi Putih', harga_tambah: 0 },
        { nama: 'Nasi Uduk', harga_tambah: 3000 },
        { nama: 'Nasi Merah', harga_tambah: 4000 }
      ]
    },
    {
      nama: 'Pilihan Sambal',
      options: [
        { nama: 'Sambal Bawang', harga_tambah: 0 },
        { nama: 'Sambal Matah', harga_tambah: 1500 },
        { nama: 'Sambal Ijo', harga_tambah: 1500 }
      ]
    },
    {
      nama: 'Topping Tambahan',
      options: [
        { nama: 'Telur', harga_tambah: 3000 },
        { nama: 'Keju', harga_tambah: 3500 },
        { nama: 'Sosis', harga_tambah: 3000 }
      ]
    },
    {
      nama: 'Ukuran Minuman',
      options: [
        { nama: 'Regular', harga_tambah: 0 },
        { nama: 'Large', harga_tambah: 3000 }
      ]
    },
    {
      nama: 'Level Es',
      options: [
        { nama: 'Tanpa Es', harga_tambah: 0 },
        { nama: 'Es Normal', harga_tambah: 0 },
        { nama: 'Extra Es', harga_tambah: 1000 }
      ]
    },
    {
      nama: 'Level Gula',
      options: [
        { nama: 'Tanpa Gula', harga_tambah: 0 },
        { nama: 'Less Sugar', harga_tambah: 0 },
        { nama: 'Normal', harga_tambah: 0 }
      ]
    },
    {
      nama: 'Pilihan Kuah',
      options: [
        { nama: 'Kuah Bening', harga_tambah: 0 },
        { nama: 'Kuah Kental', harga_tambah: 1000 }
      ]
    },
    {
      nama: 'Extra Protein',
      options: [
        { nama: 'Ayam Suwir', harga_tambah: 4000 },
        { nama: 'Bakso', harga_tambah: 5000 },
        { nama: 'Sapi Slice', harga_tambah: 7000 }
      ]
    },
    {
      nama: 'Side Dish',
      options: [
        { nama: 'Kerupuk', harga_tambah: 1000 },
        { nama: 'Tempe Goreng', harga_tambah: 3000 },
        { nama: 'Tahu Crispy', harga_tambah: 3000 }
      ]
    }
  ]

  const seedProducts = [
    {
      kode: 'MKN-NASGOR',
      nama: 'Nasi Goreng Spesial',
      kategori: 'Nasi',
      satuan: 'Porsi',
      harga_beli: 14000,
      harga_jual: 22000,
      stok: 35,
      min_stok: 5,
      barcode: '899100100001',
      deskripsi: 'Nasi goreng dengan telur, ayam, dan acar',
      modifierName: 'Level Pedas'
    },
    {
      kode: 'MKN-GEPREK',
      nama: 'Ayam Geprek Sambal Matah',
      kategori: 'Ayam',
      satuan: 'Porsi',
      harga_beli: 15000,
      harga_jual: 24000,
      stok: 30,
      min_stok: 5,
      barcode: '899100100002',
      deskripsi: 'Ayam crispy dengan sambal matah segar',
      modifierName: 'Pilihan Sambal'
    },
    {
      kode: 'MKN-MIEAYM',
      nama: 'Mie Ayam Bakso',
      kategori: 'Mie',
      satuan: 'Mangkuk',
      harga_beli: 13000,
      harga_jual: 21000,
      stok: 28,
      min_stok: 5,
      barcode: '899100100003',
      deskripsi: 'Mie ayam dengan topping bakso sapi',
      modifierName: 'Extra Protein'
    },
    {
      kode: 'MKN-SATEAY',
      nama: 'Sate Ayam Bumbu Kacang',
      kategori: 'Makanan Utama',
      satuan: 'Porsi',
      harga_beli: 17000,
      harga_jual: 28000,
      stok: 22,
      min_stok: 4,
      barcode: '899100100004',
      deskripsi: '10 tusuk sate ayam dengan lontong',
      modifierName: 'Side Dish'
    },
    {
      kode: 'MKN-SOTOAY',
      nama: 'Soto Ayam Lamongan',
      kategori: 'Makanan Utama',
      satuan: 'Mangkuk',
      harga_beli: 12000,
      harga_jual: 20000,
      stok: 26,
      min_stok: 4,
      barcode: '899100100005',
      deskripsi: 'Soto ayam gurih dengan koya khas',
      modifierName: 'Pilihan Kuah'
    },
    {
      kode: 'MNM-ESTEH',
      nama: 'Es Teh Manis',
      kategori: 'Minuman Dingin',
      satuan: 'Gelas',
      harga_beli: 2500,
      harga_jual: 8000,
      stok: 80,
      min_stok: 10,
      barcode: '899100100006',
      deskripsi: 'Teh manis dingin segar',
      modifierName: 'Level Es'
    },
    {
      kode: 'MNM-ESJRK',
      nama: 'Es Jeruk Peras',
      kategori: 'Minuman Dingin',
      satuan: 'Gelas',
      harga_beli: 4500,
      harga_jual: 12000,
      stok: 60,
      min_stok: 8,
      barcode: '899100100007',
      deskripsi: 'Jeruk peras asli dengan es batu',
      modifierName: 'Level Gula'
    },
    {
      kode: 'MNM-KOPSUS',
      nama: 'Kopi Susu Gula Aren',
      kategori: 'Kopi',
      satuan: 'Cup',
      harga_beli: 7000,
      harga_jual: 18000,
      stok: 50,
      min_stok: 8,
      barcode: '899100100008',
      deskripsi: 'Kopi susu creamy dengan gula aren',
      modifierName: 'Ukuran Minuman'
    },
    {
      kode: 'CMI-PSGORG',
      nama: 'Pisang Goreng Cokelat Keju',
      kategori: 'Camilan',
      satuan: 'Porsi',
      harga_beli: 8000,
      harga_jual: 16000,
      stok: 32,
      min_stok: 5,
      barcode: '899100100009',
      deskripsi: 'Pisang goreng hangat topping cokelat keju',
      modifierName: 'Topping Tambahan'
    },
    {
      kode: 'PKT-AYMBKR',
      nama: 'Paket Nasi Ayam Bakar',
      kategori: 'Paket Hemat',
      satuan: 'Porsi',
      harga_beli: 18000,
      harga_jual: 30000,
      stok: 20,
      min_stok: 3,
      barcode: '899100100010',
      deskripsi: 'Nasi, ayam bakar, sambal, lalapan, dan teh',
      modifierName: 'Jenis Nasi'
    }
  ]

  const maxSeed = Math.min(
    10,
    seedCategories.length,
    seedUnits.length,
    seedModifiers.length,
    seedProducts.length
  )
  const total = Number.isFinite(Number(count)) ? Math.max(1, Math.min(maxSeed, Number(count))) : 10

  const insertCategory = db.prepare(
    `INSERT OR IGNORE INTO categories (nama, deskripsi, aktif)
     VALUES (@nama, @deskripsi, 1)`
  )

  const insertUnit = db.prepare(
    `INSERT OR IGNORE INTO units (nama, singkatan, deskripsi, aktif)
     VALUES (@nama, @singkatan, @deskripsi, 1)`
  )

  const getModifierByName = db.prepare(`SELECT id FROM modifier_groups WHERE nama = ? LIMIT 1`)
  const insertModifierGroup = db.prepare(
    `INSERT INTO modifier_groups (nama, tipe, wajib, min_pilih, max_pilih, urutan, aktif)
     VALUES (@nama, 'single', 0, 0, 1, @urutan, 1)`
  )
  const getModifierOption = db.prepare(
    `SELECT id FROM modifier_options WHERE group_id = ? AND nama = ? LIMIT 1`
  )
  const insertModifierOption = db.prepare(
    `INSERT INTO modifier_options (group_id, nama, harga_tambah, emoji, urutan, aktif)
     VALUES (@group_id, @nama, @harga_tambah, '', @urutan, 1)`
  )

  const insertProduct = db.prepare(
    `INSERT OR IGNORE INTO products
      (kode, nama, kategori, satuan, harga_beli, harga_jual, stok, min_stok, barcode, deskripsi, aktif, images)
     VALUES
      (@kode, @nama, @kategori, @satuan, @harga_beli, @harga_jual, @stok, @min_stok, @barcode, @deskripsi, 1, '[]')`
  )
  const getProductByKode = db.prepare(`SELECT id FROM products WHERE kode = ? LIMIT 1`)
  const insertProductModifier = db.prepare(
    `INSERT OR IGNORE INTO product_modifier_groups (product_id, group_id, urutan)
     VALUES (@product_id, @group_id, 0)`
  )

  const runSeed = db.transaction(() => {
    const inserted = {
      categories: 0,
      units: 0,
      modifierGroups: 0,
      products: 0
    }
    const modifierByName = {}

    seedCategories.slice(0, total).forEach((row) => {
      const result = insertCategory.run(row)
      if (result.changes > 0) inserted.categories += 1
    })

    seedUnits.slice(0, total).forEach((row) => {
      const result = insertUnit.run(row)
      if (result.changes > 0) inserted.units += 1
    })

    seedModifiers.slice(0, total).forEach((group, groupIdx) => {
      let groupRow = getModifierByName.get(group.nama)
      if (!groupRow) {
        const created = insertModifierGroup.run({ nama: group.nama, urutan: groupIdx + 1 })
        groupRow = { id: Number(created.lastInsertRowid) }
        inserted.modifierGroups += 1
      }

      group.options.forEach((opt, optIdx) => {
        const existing = getModifierOption.get(groupRow.id, opt.nama)
        if (!existing) {
          insertModifierOption.run({
            group_id: groupRow.id,
            nama: opt.nama,
            harga_tambah: opt.harga_tambah,
            urutan: optIdx
          })
        }
      })

      modifierByName[group.nama] = groupRow.id
    })

    seedProducts.slice(0, total).forEach((product) => {
      const result = insertProduct.run(product)
      if (result.changes > 0) inserted.products += 1

      const productRow = getProductByKode.get(product.kode)
      const groupId = modifierByName[product.modifierName]
      if (productRow?.id && groupId) {
        insertProductModifier.run({ product_id: productRow.id, group_id: groupId })
      }
    })

    return inserted
  })

  return runSeed()
}
