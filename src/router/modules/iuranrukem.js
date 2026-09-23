const iuranrukemRoutes = [
  {
    path: 'iuranrukem',
    name: 'iuranrukem',
    component: () => import('../../pages/Iuranrukem/IndexPage.vue'),
    meta: {
      title: 'Data Iuran Rukem',
      requiresAuth: true,
    },
  },
]

export default iuranrukemRoutes
