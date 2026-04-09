# PPOS Kasir - Desktop Point of Sale System

<div align="center">

[![Windows](https://img.shields.io/badge/Windows-10%2B-blue?style=flat-square&logo=windows)](https://www.microsoft.com/store/apps/)
[![Version](https://img.shields.io/badge/Version-1.0.1-green?style=flat-square)](package.json)
[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)
[![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-9feaf9?style=flat-square&logo=electron)](https://www.electronjs.org/)

**Sistem Kasir Desktop Modern dengan Dukungan Offline Mode Penuh**

[🏪 Download dari Microsoft Store](#-download) • [📖 Dokumentasi](#-fitur-utama) • [🚀 Mulai Cepat](#-persiapan-awal)

</div>

---

## 🌟 Fitur Unggulan

### ✅ **Offline Mode 100%**
Bekerja tanpa koneksi internet! Semua data disimpan lokal dengan database SQLite terintegrasi. Sinkronisasi otomatis saat kembali online.

### 📱 Antarmuka Modern & Responsif
- UI yang intuitif dengan Material Design
- Mendukung output ke printer thermal
- Bilingual (Indonesia & English)
- Real-time notifications

### 💳 Manajemen Transaksi Lengkap
- Sistem checkout yang cepat dan akurat
- Saran nominal pembayaran otomatis
- Riwayat transaksi komprehensif
- Cetak & export laporan

### 📦 Fitur Produk & Inventory
- Manajemen produk dengan kategori
- Modifier/customization produk
- Harga dasar dan harga jual
- Edit & hapus produk

### 🧾 Customizable Receipt
- Header & footer dapat diatur
- Visibility toggle untuk setiap field
- Preview real-time
- Format thermal printer standard

### 🔍 Integrasi Perangkat
- Barcode scanner support
- Network printer discovery
- Device pairing otomatis

### 📊 Laporan & Analytics
- Riwayat transaksi detail
- Export ke Excel
- Filtered viewing
- Data persistence

---

## 📥 Download

### Microsoft Store
Aplikasi ini tersedia di Microsoft Store untuk kemudahan instalasi dan update otomatis.

**[Download dari Microsoft Store →](https://apps.microsoft.com/detail/9mw3s77v0pbq?hl=id-ID&gl=ID)**

### Instalasi Manual
1. Download installer dari [Release Page](../../releases)
2. Jalankan installer (PPOS-Kasir-1.0.1.exe)
3. Ikuti wizard instalasi
4. Aplikasi siap digunakan tanpa setup tambahan

---

## 🚀 Persiapan Awal

### Requirement Sistem
- **OS**: Windows 10 atau lebih baru
- **RAM**: Minimal 2GB
- **Storage**: 500MB untuk instalasi
- **Printer**: Thermal printer (optional)
- **Scanner**: Barcode scanner USB (optional)

### Setup Development

#### Prerequisites
- Node.js v16+ ([Download](https://nodejs.org/))
- npm atau yarn
- Git

#### Langkah Instalasi

```bash
# Clone repository
git clone <repository-url>
cd pos-sistem

# Install dependencies
npm install

# Start development mode
npm run dev

# Build untuk production
npm run build:win
```

---

## 📖 Fitur Utama

### 1. **Dashboard POS**
Antarmuka kerja utama dengan:
- Grid produk dengan pencarian real-time
- Keranjang belanja dinamis
- Hitung total otomatis
- Checkout cepat

### 2. **Manajemen Stok**
- CRUD operasi produk
- Kategori produk
- Modifier/customization
- Tracking harga dasar vs jual

### 3. **Struk & Receipt**
- Customizable receipt template
- Print ke thermal printer
- Export PDF
- Preview before print

### 4. **Riwayat Transaksi**
- Detail lengkap setiap transaksi
- Filter by date range
- View item breakdown
- Edit mode untuk koreksi

### 5. **Pengaturan**
- Settings umum
- Customization receipt
- Preferences bahasa
- Device pairing

---

## 🛠️ Development

### Struktur Project

```
src/
├── main/                 # Electron main process (backend)
│   ├── index.js         # Entry point
│   ├── window.js        # Window management
│   ├── ipc/             # IPC handlers
│   ├── db/              # Database layer
│   ├── services/        # Business logic
│   │   ├── scanner.service.js
│   │   ├── printer.service.js
│   │   ├── discovery.service.js
│   │   ├── network.service.js
│   │   └── updater.service.js
│   └── repositories/    # Data access layer
│
├── preload/             # Preload scripts
│   └── index.js         # Electron preload API
│
└── renderer/            # React frontend
    ├── index.html
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── routes/      # Route definitions
    │   ├── hooks/       # Custom hooks
    │   ├── services/    # Frontend services
    │   ├── context/     # React context
    │   ├── assets/      # CSS & media
    │   └── locales/     # i18n translations
    └── public/
```

### Scripts Berguna

```bash
# Development
npm run dev          # Start dev server

# Linting & Formatting
npm run lint         # Run ESLint
npm run format       # Format code dengan Prettier

# Build
npm run build        # Build app
npm run build:win    # Build Windows installer (NSIS + AppX)
npm run build:win:exe  # Build Windows EXE only
npm run build:win:store  # Build AppX for Microsoft Store

# Production
npm start           # Run production build
```

### Teknologi Stack

| Kategori | Tech |
|----------|------|
| **Framework** | Electron, React 18 |
| **UI Library** | Material-UI (MUI v7) |
| **State Management** | React Hooks, Context API |
| **Routing** | React Router v7 |
| **Database** | SQLite dengan better-sqlite3 |
| **Internationalization** | react-i18next |
| **Build Tool** | Electron Vite |
| **Styling** | Styled Components, Emotion |
| **PDF Generation** | jsPDF, jsPDF-AutoTable |
| **Excel Export** | XLSX |
| **Code Quality** | ESLint, Prettier |

---

## 🔐 Data & Offline

### Local Storage
- **Database**: SQLite (built-in)
- **User Settings**: Electron Store
- **Receipt Settings**: localStorage
- **Cache**: In-memory persistence

### Fitur Offline
✅ Semua operasi berfungsi penuh tanpa internet  
✅ Data tersimpan aman di database lokal  
✅ Transaction history tersedia offline  
✅ Receipt printing berfungsi normal  
✅ Scanner & printer tetap kompatibel  

### Data Security
- Data tersimpan lokal, tidak dikirim ke server
- Backup otomatis per transaksi
- No cloud dependency

---

## 📱 User Interface

### Dark Theme Support
Aplikasi mendukung light & dark mode untuk kenyamanan penggunaan seharian.

### Responsive Design
- Desktop-first layout
- Adaptive untuk berbagai ukuran layar
- Touch-friendly buttons

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Escape` | Close dialog |
| `Enter` | Confirm/Submit |
| `F5` | Refresh |

---

## 🐛 Troubleshooting

### Printer tidak terdeteksi
1. Pastikan printer terpasang dan online
2. Jalankan discovery dari menu Settings
3. Lakukan pairing device

### Barcode Scanner tidak berfungsi
1. Periksa driver USB
2. Restart aplikasi
3. Scan test barcode

### Database Error
1. Close aplikasi
2. Hapus file database (app akan recreate)
3. Update ke versi terbaru

### Performance Issue
- Clear browser cache (Shift+Ctrl+Del)
- Restart aplikasi
- Reduce produk yang ditampilkan

---

## 📄 Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE).

---

## 🤝 Kontribusi

Kontribusi selalu diterima dengan baik! Silakan:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Support & Feedback

Punya pertanyaan atau feedback?
- 📧 Email: support@example.com
- 🐛 Report bugs: [GitHub Issues](../../issues)
- 💬 Discussions: [GitHub Discussions](../../discussions)

---

## 🎯 Roadmap

- [ ] Cloud sync capabilities (optional)
- [ ] Multi-user login & roles
- [ ] Advanced reporting & analytics
- [ ] Payment gateway integration
- [ ] Mobile companion app
- [ ] WhatsApp integration for orders
- [ ] Thermal printer API optimization
- [ ] Multi-location support

---

## 📊 Stats

- **Lines of Code**: 5000+
- **Components**: 50+
- **Pages**: 8+
- **Supported Languages**: 2 (ID, EN)
- **Database Tables**: 10+

---

<div align="center">

Made with ❤️ for small & medium businesses

**[⬆ Kembali ke atas](#ppos-kasir---desktop-point-of-sale-system)**

</div>