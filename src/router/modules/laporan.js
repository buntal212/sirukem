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
]

export default laporanRoutes
