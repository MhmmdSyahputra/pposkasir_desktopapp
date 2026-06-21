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

## Critical Constraints & Gotchas

- **Native Dependencies**: Because the app relies on `better-sqlite3` (a native C++ addon), executing `npm run postinstall` (runs `electron-builder install-app-deps`) is crucial after changes to dependencies to rebuild native modules.
- **Testing**: There is no test runner framework (e.g., Jest or Vitest) configured in this repository. Verify changes using `npm run dev` and `npm run lint`.
