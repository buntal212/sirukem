import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

export const useLaporanIuranWargaStore = defineStore('laporan-iuran-warga', {
  state: () => ({
    items: [],
    loading: false,
    loadingMore: false,
    loadingDetail: false,
    error: null,
    currentPage: 1,
    hasNextPage: false,
    detailItems: [],
    detailHasNextPage: false,
    detailCurrentPage: 1,
    detailWarga: null,

    params: {
      tahun: new Date().getFullYear(),
      search: '',
      per_page: 20,
    },

    ringkasan: {
      total_warga: 0,
      total_iuran: 0,
      target_iuran: 0,
    },
  }),

  getters: {
    hasMore: (state) => state.hasNextPage,
    hasMoreDetail: (state) => state.detailHasNextPage,
  },

  actions: {
    async getLaporan({ reset = false } = {}) {
      if (reset) {
        this.currentPage = 1
        this.items = []
      }

      this.loading = true
      this.error = null

      try {
        const response = await api.get('/v1/laporan/iuran-warga', {
          params: {
            ...this.params,
            page: this.currentPage,
          },
        })

        const paginator = response.data?.data ?? {}
        const rows = paginator.data ?? []

        this.items = reset ? rows : [...this.items, ...rows]
        this.ringkasan = response.data?.ringkasan ?? this.ringkasan
        this.currentPage = Number(paginator.current_page ?? this.currentPage)
        this.hasNextPage = Boolean(paginator.next_page_url)

        return response.data
      } catch (error) {
        console.error('GET LAPORAN IURAN WARGA ERROR:', error)

        this.error = error.response?.data?.message || 'Gagal mengambil laporan iuran warga'

        throw error
      } finally {
        this.loading = false
      }
    },

    async ubahFilter(filter) {
      this.params = {
        ...this.params,
        ...filter,
      }

      return this.getLaporan({ reset: true })
    },

    async loadMore() {
      if (this.loadingMore || !this.hasMore) {
        return
      }

      this.loadingMore = true

      try {
        this.currentPage += 1
        await this.getLaporan()
      } catch (error) {
        this.currentPage -= 1
        throw error
      } finally {
        this.loadingMore = false
      }
    },

    async getDetailWarga(pendudukId, tahun, { reset = false } = {}) {
      if (reset) {
        this.detailCurrentPage = 1
        this.detailItems = []
        this.detailWarga = null
      }

      this.loadingDetail = true
      this.error = null

      try {
        const response = await api.get('/v1/laporan/iuran-warga/detail', {
          params: {
            penduduk_id: pendudukId,
            tahun,
            page: this.detailCurrentPage,
            per_page: this.params.per_page,
          },
        })

        const paginator = response.data?.data ?? {}
        const rows = paginator.data ?? []

        this.detailItems = reset ? rows : [...this.detailItems, ...rows]
        this.detailWarga = response.data?.warga ?? this.detailWarga
        this.detailCurrentPage = Number(paginator.current_page ?? this.detailCurrentPage)
        this.detailHasNextPage = Boolean(paginator.next_page_url)

        return response.data
      } catch (error) {
        console.error('GET DETAIL LAPORAN IURAN ERROR:', error)

        this.error = error.response?.data?.message || 'Gagal mengambil detail iuran warga'

        throw error
      } finally {
        this.loadingDetail = false
      }
    },

    async loadMoreDetail(pendudukId, tahun) {
      if (this.loadingDetail || !this.hasMoreDetail) {
        return
      }

      this.detailCurrentPage += 1

      try {
        await this.getDetailWarga(pendudukId, tahun)
      } catch (error) {
        this.detailCurrentPage -= 1

        throw error
      }
    },
  },
})
