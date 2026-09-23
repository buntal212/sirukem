import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

export const useIuranStore = defineStore('iuran', {
  state: () => ({
    items: [],

    total: 0,

    currentPage: 1,

    lastPage: 1,

    perPage: 20,

    search: '',

    loading: false,

    loadingMore: false,

    saving: false,

    error: null,
  }),

  getters: {
    hasMore: (state) => {
      return state.currentPage < state.lastPage
    },
  },

  actions: {
    // =====================================================
    // GET IURAN
    // =====================================================

    async getIuran(params = {}) {
      const reset = params.reset ?? false

      if (reset) {
        this.currentPage = 1
        this.items = []
      }

      this.loading = true
      this.error = null

      try {
        const response = await api.get('/v1/iuran/getlist', {
          params: {
            page: this.currentPage,

            per_page: this.perPage,

            search: this.search,

            bulan: params.bulan,

            minggu: params.minggu,

            tahun: params.tahun,
          },
        })

        const result = response.data?.data ?? response.data

        // -----------------------------------------------
        // Mendukung response Laravel paginator
        // -----------------------------------------------

        const rows = result?.data ?? result?.items ?? []

        if (reset) {
          this.items = rows
        } else {
          this.items.push(...rows)
        }

        this.total = Number(result?.total ?? rows.length)

        this.currentPage = Number(result?.current_page ?? this.currentPage)

        this.lastPage = Number(result?.last_page ?? 1)

        return response.data
      } catch (error) {
        console.error('GET IURAN ERROR:', error)

        this.error = error.response?.data?.message || 'Gagal mengambil data iuran'

        throw error
      } finally {
        this.loading = false
      }
    },

    // =====================================================
    // SEARCH
    // =====================================================

    async searchIuran(keyword, params = {}) {
      this.search = String(keyword || '').trim()

      this.currentPage = 1

      return await this.getIuran({
        ...params,

        reset: true,
      })
    },

    // =====================================================
    // LOAD MORE
    // =====================================================

    async loadMore(params = {}) {
      if (this.loadingMore || !this.hasMore) {
        return
      }

      this.loadingMore = true

      try {
        this.currentPage += 1

        await this.getIuran({
          ...params,

          reset: false,
        })
      } catch (error) {
        // Kembalikan page kalau gagal
        this.currentPage -= 1

        throw error
      } finally {
        this.loadingMore = false
      }
    },

    // =====================================================
    // REFRESH
    // =====================================================

    async refreshIuran(params = {}) {
      this.currentPage = 1

      return await this.getIuran({
        ...params,

        reset: true,
      })
    },

    // =====================================================
    // SIMPAN PEMBAYARAN
    // =====================================================

    async simpanPembayaran(payload) {
      this.saving = true
      this.error = null

      try {
        const response = await api.post('/v1/iuran/simpan', payload)

        return response.data
      } catch (error) {
        console.error('SIMPAN IURAN ERROR:', error)

        this.error = error.response?.data?.message || 'Gagal menyimpan pembayaran iuran'

        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
