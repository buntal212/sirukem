const pendudukRoutes = [
  {
    path: 'penduduk',
    name: 'penduduk',
    component: () => import('../../pages/Penduduk/IndexPage.vue'),
    meta: {
      title: 'Data Penduduk',
      requiresAuth: true,
    },
  },
]

export default pendudukRoutes
