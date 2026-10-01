const laporanRoutes = [
  {
    path: 'laporan',
    name: 'laporan-iuran-warga',
    component: () => import('../../pages/LaporanIuranWarga/IndexPage.vue'),
    meta: {
      title: 'Laporan Iuran Warga',
      requiresAuth: true,
    },
  },
  {
    path: 'laporan-pengeluaran',
    name: 'laporan-pengeluaran',
    component: () => import('../../pages/LaporanPengeluaran/IndexPage.vue'),
    meta: {
      title: 'Laporan Pengeluaran',
      requiresAuth: true,
    },
  },
  {
    path: 'laporan-kas-umum',
    name: 'laporan-kas-umum',
    component: () => import('../../pages/LaporanKasUmum/IndexPage.vue'),
    meta: {
      title: 'Laporan Kas Umum',
      requiresAuth: true,
    },
  },
]

export default laporanRoutes
