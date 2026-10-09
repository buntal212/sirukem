import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

const tanggalHariIni = () => new Date().toISOString().slice(0, 10)

export const useLaporanPengeluaranMasjidStore = defineStore('laporan-pengeluaran-masjid', {
  state: () => ({
    items: [],
    loading: false,
    loadingMore: false,
    hasMore: false,
    error: null,
    params: {
      page: 1,
      per_page: 20,
      tanggal_dari: `${new Date().getFullYear()}-01-01`,
      tanggal_sampai: tanggalHariIni(),
      jenis_sumber_dana: null,
    },
    ringkasan: {
      total_transaksi: 0,
      total_pengeluaran: 0,
    },
  }),

  actions: {
    async getLaporan({ reset = false } = {}) {
      if (reset) {
        this.params.page = 1
        this.items = []
      }

      this.loading = true
      this.error = null
      try {
        const response = await api.get('/v1/laporan/pengeluaran-masjid', { params: this.params })
        const paginator = response.data?.data ?? {}
        const rows = paginator.data ?? []
        this.items = reset ? rows : [...this.items, ...rows]
        this.params.page = Number(paginator.current_page ?? this.params.page)
        this.hasMore = Boolean(paginator.next_page_url)
        this.ringkasan = response.data?.ringkasan ?? this.ringkasan
        return response.data
      } catch (error) {
        console.error('GAGAL MENGAMBIL LAPORAN PENGELUARAN MASJID:', error)
        this.error = error.response?.data?.message || 'Gagal mengambil laporan pengeluaran masjid.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadMore() {
      if (this.loadingMore || !this.hasMore) return

      this.loadingMore = true
      this.params.page += 1
      try {
        await this.getLaporan()
      } catch (error) {
        this.params.page -= 1
        throw error
      } finally {
        this.loadingMore = false
      }
    },
  },
})
