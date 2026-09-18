import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
} from 'vue-router'

import { LocalStorage } from 'quasar'
import routes from './routes'

export default route(function () {
  // =========================================================
  // ROUTER HISTORY
  // =========================================================
  const createHistory = import.meta.env.SSR
    ? createMemoryHistory
    : createWebHistory

  const Router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0,
    }),

    routes,

    history: createHistory(import.meta.env.BASE_URL),
  })

  // =========================================================
  // ROUTER GUARD
  // =========================================================
  Router.beforeEach((to) => {
    const token = LocalStorage.getItem('auth_token')

    const isAuthenticated = Boolean(token)

    // =======================================================
    // HALAMAN MEMBUTUHKAN LOGIN
    // =======================================================
    if (to.meta.requiresAuth && !isAuthenticated) {
      return {
        path: '/login',

        query: {
          redirect: to.fullPath,
        },
      }
    }

    // =======================================================
    // SUDAH LOGIN TAPI MEMBUKA /login
    // =======================================================
    if (to.path === '/login' && isAuthenticated) {
      return {
        path: '/',
      }
    }

    // =======================================================
    // IZINKAN NAVIGASI
    // =======================================================
    return true
  })

  return Router
})
