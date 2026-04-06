import {
  CreateProductPage,
  EditProductPage,
  HomePage,
  ListProductPage,
  ListCategoryPage,
  CreateCategoryPage,
  EditCategoryPage,
  ListUnitPage,
  CreateUnitPage,
  EditUnitPage,
  ListModifierPage,
  CreateModifierPage,
  EditModifierPage,
  ListTransactionPage,
  ListReportPage,
  SettingsPage
} from '../pages'

export const appRoutes = [
  // =============== PUBLIC ROUTES ===============
  { path: '/', element: <HomePage />, active: true, protected: false },
  // product
  { path: '/produk/list', element: <ListProductPage />, active: true, protected: false },
  { path: '/produk/create', element: <CreateProductPage />, active: true, protected: false },
  { path: '/produk/edit/:id', element: <EditProductPage />, active: true, protected: false },
  // category
  { path: '/kategori/list', element: <ListCategoryPage />, active: true, protected: false },
  { path: '/kategori/create', element: <CreateCategoryPage />, active: true, protected: false },
  { path: '/kategori/edit/:id', element: <EditCategoryPage />, active: true, protected: false },
  // unit
  { path: '/satuan/list', element: <ListUnitPage />, active: true, protected: false },
  { path: '/satuan/create', element: <CreateUnitPage />, active: true, protected: false },
  { path: '/satuan/edit/:id', element: <EditUnitPage />, active: true, protected: false },
  // modifier
  { path: '/modifier/list', element: <ListModifierPage />, active: true, protected: false },
  { path: '/modifier/create', element: <CreateModifierPage />, active: true, protected: false },
  { path: '/modifier/edit/:id', element: <EditModifierPage />, active: true, protected: false },
  // riwayat
  { path: '/riwayat/list', element: <ListTransactionPage />, active: true, protected: false },
  // laporan
  { path: '/laporan/list', element: <ListReportPage />, active: true, protected: false },
  // settings
  { path: '/settings', element: <SettingsPage />, active: true, protected: false }
  // { path: '*', element: <NotFoundPage />, active: true, protected: false }
]
