import {
  HomeRounded,
  ViewInAr,
  ReceiptLongOutlined,
  AssessmentOutlined,
  FiberManualRecord,
  FileDownloadOutlined,
  PersonRounded,
  PaidOutlined
} from '@mui/icons-material'

export const sidebarRoutes = [
  {
    path: '/',
    label: 'Home',
    labelKey: 'sidebar.home',
    icon: HomeRounded,
    active: true,
    protected: false
  },
  {
    label: 'Produk',
    labelKey: 'sidebar.products',
    icon: ViewInAr,
    active: true,
    protected: false,
    children: [
      {
        path: '/produk/list',
        label: 'Produk',
        labelKey: 'sidebar.product_list',
        icon: FiberManualRecord,
        active: true
      },
      {
        path: '/kategori/list',
        label: 'Kategori',
        labelKey: 'sidebar.category_list',
        icon: FiberManualRecord,
        active: true
      },
      {
        path: '/satuan/list',
        label: 'Satuan',
        labelKey: 'sidebar.unit_list',
        icon: FiberManualRecord,
        active: true
      },
      {
        path: '/modifier/list',
        label: 'Modifier',
        labelKey: 'sidebar.modifier_list',
        icon: FiberManualRecord,
        active: true
      }
    ]
  },
  {
    path: '/template',
    label: 'Template Data',
    labelKey: 'sidebar.template_data',
    icon: FileDownloadOutlined,
    active: true,
    protected: false
  },
  {
    path: '/kasir/list',
    label: 'Kasir',
    labelKey: 'sidebar.cashier',
    icon: PersonRounded,
    active: true,
    protected: false
  },
  {
    path: '/riwayat/list',
    label: 'Riwayat',
    labelKey: 'sidebar.history',
    icon: ReceiptLongOutlined,
    active: true,
    protected: false
  },
  {
    path: '/pengeluaran',
    label: 'Pengeluaran',
    labelKey: 'sidebar.expenses',
    icon: PaidOutlined,
    active: true,
    protected: false
  },
  {
    label: 'Laporan',
    labelKey: 'sidebar.report',
    icon: AssessmentOutlined,
    active: true,
    protected: false,
    children: [
      {
        path: '/laporan/list',
        label: 'Laporan Penjualan',
        labelKey: 'sidebar.sales_report',
        icon: FiberManualRecord,
        active: true
      },
      {
        path: '/laporan/pengeluaran',
        label: 'Laporan Pengeluaran',
        labelKey: 'sidebar.expense_report',
        icon: FiberManualRecord,
        active: true
      }
    ]
  }
]
