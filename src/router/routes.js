import iuranrukemRoutes from './modules/iuranrukem'
import pendudukRoutes from './modules/penduduk'
import pengaturanRoutes from './modules/pengaturan'
import laporanRoutes from './modules/laporan'
import pengeluaranRoutes from './modules/pengeluaran'

const routes = [
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
      },
    ],
  },

  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },

    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: 'second', component: () => import('@/pages/SecondPage.vue') },
      ...pendudukRoutes,
      ...pengaturanRoutes,
      ...iuranrukemRoutes,
      ...laporanRoutes,
      ...pengeluaranRoutes,
      {
        path: 'uang-masuk-kotak-masjid',
        name: 'uang-masuk-kotak-masjid',
        component: () => import('@/pages/PemasukanKotakMasjid/IndexPage.vue'),
        meta: {
          title: 'Uang Pemasukkan Masjid',
          requiresAuth: true,
        },
      },
      {
        path: 'pengeluaran-masjid',
        name: 'pengeluaran-masjid',
        component: () => import('@/pages/PengeluaranMasjid/IndexPage.vue'),
        meta: {
          title: 'Pengeluaran Masjid',
          requiresAuth: true,
        },
      },
      {
        path: 'laporan-pengeluaran-masjid',
        name: 'laporan-pengeluaran-masjid',
        component: () => import('@/pages/LaporanPengeluaranMasjid/IndexPage.vue'),
        meta: {
          title: 'Laporan Pengeluaran Masjid',
          requiresAuth: true,
        },
      },
      {
        path: 'laporan-kas-umum-masjid',
        name: 'laporan-kas-umum-masjid',
        component: () => import('@/pages/LaporanKasUmumMasjid/IndexPage.vue'),
        meta: {
          title: 'Laporan Kas Umum Masjid',
          requiresAuth: true,
        },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
