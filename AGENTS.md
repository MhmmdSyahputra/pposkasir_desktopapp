# Developer Guide & Agent Instructions

## Commands Reference

- **Development Server**: `npm run dev`
- **Linting**: `npm run lint`
- **Code Formatting**: `npm run format`
- **Production Build (All)**: `npm run build`
- **Windows Production Builds**:
  - Installer & AppX package: `npm run build:win`
  - Installer EXE only: `npm run build:win:exe`
  - AppX for Microsoft Store only: `npm run build:win:store`
- **Preview Production Build**: `npm run start`

## Architecture & Framework Quirks

- **Runtime & Build Tools**: Built on Electron with React 19 (managed by `electron-vite`).
- **Database**: Offline-first storage using SQLite powered by `better-sqlite3` (native Node.js addon).
- **Styling**: Uses Material-UI (MUI v7), Styled Components, and Emotion.
- **Process Communication**: Entry points are structured under:
  - Main Process (Backend): `src/main/` (e.g., `index.js`, SQLite database layer, services like printer/scanner, IPC handlers)
  - Preload Script: `src/preload/index.js`
  - Renderer Process (Frontend): `src/renderer/` (Vite + React single-page app)

## Core App Features & Context

- **100% Offline-First POS**: Complete checkout, receipt rendering, and analytics operate fully offline with local database persistence.
- **Checkout & Order Flow**: Matches barcodes, product codes, and filters by categories. Includes modifier customizations (variants, toppings, notes). Plays a transaction success audio cue (`notif.mp3` loaded dynamically using file protocols).
- **Product & Inventory Management**: CRUD operations for products, categories, units, and modifier groups. Supports **Bundle Packages** with auto-stock checking of child component products.
- **Integrated Barcode Scanning**:
  - Direct hardware scanner: Automatically captures inputs and auto-focuses cursor on the search input (`#barcode-search-input`).
  - Camera scanner modal: Powered by `html5-qrcode` exposed inside React components (`BarcodeScanner.jsx`), supporting QR, EAN-13, Code 128, etc.
- **Thermal Receipt Printing**:
  - Injected offscreen rendering via Electron print. Supports paper sizes (`58mm`/`80mm`) and padding offsets.
  - Dynamically switches between Windows Silent Print (`silent: true` + custom micron `pageSize`) and System Print/Save PDF (`silent: false` + `@page { size: auto }`) to align content left-aligned without auto-centering.
  - Includes Tutup Kasir (Z-Report/Shift Closing Summary) printing directly from the sidebar.
- **Backup & Restore**: Allows full SQLite database backup (`.db` files) exporting/importing via Electron native file dialogs directly from Settings.

## Critical Constraints & Gotchas

- **Native Dependencies**: Because the app relies on `better-sqlite3` (a native C++ addon), executing `npm run postinstall` (runs `electron-builder install-app-deps`) is crucial after changes to dependencies to rebuild native modules.
- **Testing**: There is no test runner framework (e.g., Jest or Vitest) configured in this repository. Verify changes using `npm run dev` and `npm run lint`.
