import axios from 'axios'
import { LocalStorage } from 'quasar'

// =========================================================
// API CONFIGURATION
// =========================================================

const API_URL = import.meta.env.QCLI_API_URL

console.log('API URL:', API_URL)

// =========================================================
// AXIOS INSTANCE
// =========================================================

const api = axios.create({
  baseURL: API_URL,

  timeout: 30000,

  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token = LocalStorage.getItem('auth_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log('API BASE URL:', config.baseURL)
    console.log('API ENDPOINT:', config.url)

    return config
  },

  (error) => {
    return Promise.reject(error)
  },
)

// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(
  (response) => {
    return response
  },

  (error) => {
    if (error.response?.status === 401) {
      LocalStorage.remove('auth_token')
      LocalStorage.remove('auth_user')
    }

    return Promise.reject(error)
  },
)

// =========================================================
// QUASAR BOOT
// =========================================================

export default ({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
}

// =========================================================
// EXPORT
// =========================================================

export {
  api,
}
