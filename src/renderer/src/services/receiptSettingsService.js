const STORAGE_KEY = 'ppos.receipt.settings'

export const defaultReceiptSettings = {
  headerLine1: 'P-POS Kasir',
  headerLine2: 'Terima kasih telah berbelanja',
  headerLine3: 'Jl. Contoh No. 123, Jakarta',
  footerLine1: 'Barang yang sudah dibeli tidak dapat ditukar',
  footerLine2: 'Simpan struk ini sebagai bukti pembayaran',
  footerLine3: 'Instagram: @pposkasir',
  visibility: {
    headerLine1: true,
    headerLine2: true,
    headerLine3: true,
    orderNumber: true,
    date: true,
    cashier: true,
    subtotal: true,
    discount: true,
    total: true,
    cash: true,
    change: true,
    footerLine1: true,
    footerLine2: true,
    footerLine3: true
  }
}

export const normalizeReceiptSettings = (value = {}) => ({
  ...defaultReceiptSettings,
  ...value,
  visibility: {
    ...defaultReceiptSettings.visibility,
    ...(value.visibility || {})
  }
})

export const receiptSettingsService = {
  get() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return normalizeReceiptSettings()
      return normalizeReceiptSettings(JSON.parse(raw))
    } catch {
      return normalizeReceiptSettings()
    }
  },

  save(payload) {
    const next = normalizeReceiptSettings(payload)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  },

  reset() {
    window.localStorage.removeItem(STORAGE_KEY)
    return normalizeReceiptSettings()
  }
}
