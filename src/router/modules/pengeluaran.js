const pengeluaranRoutes = [
  {
    path: 'pengeluaran',
    name: 'pengeluaran',
    component: () => import('../../pages/Pengeluaran/IndexPage.vue'),
    meta: {
      title: 'Pengeluaran',
      requiresAuth: true,
    },
  },
]

export default pengeluaranRoutes
