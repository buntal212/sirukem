const pengaturanRoutes = [
  {
    path: 'pengaturan',
    name: 'pengaturan',
    component: () => import('../../pages/Pengaturan/IndexPage.vue'),
    meta: {
      title: 'Pengaturan',
      requiresAuth: true,
    },
  },

  {
    path: 'pengaturan/iuran',
    name: 'pengaturan-iuran',
    component: () => import('../../pages/Pengaturan/IuranPage.vue'),
    meta: {
      title: 'Pengaturan Iuran Bulanan',
      requiresAuth: true,
    },
  },

  // {
  //   path: 'pengaturan/hak-akses',
  //   name: 'pengaturan-hak-akses',
  //   component: () => import('../../pages/Pengaturan/HakAksesPage.vue'),
  //   meta: {
  //     title: 'Pengaturan Hak Akses',
  //     requiresAuth: true,
  //   },
  // },
]

export default pengaturanRoutes
