import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

const tanggalHariIni = () => new Date().toISOString().slice(0, 10)

export const usePemasukanKotakMasjidStore = defineStore('pemasukan-kotak-masjid', {
  state: () => ({
    items: [],
    loading: false,
    loadingMore: false,
    saving: false,
    menghapusId: null,
    error: null,
    hasMore: false,
    params: {
      page: 1,
      per_page: 20,
      tanggal_dari: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
      tanggal_sampai: tanggalHariIni(),
    },
    form: {
      jenis_pemasukan: 'KOTAK_AMAL',
      nominal: '',
      keterangan: '',
    },
  }),

  actions: {
    async getPemasukan({ reset = false } = {}) {
      if (reset) {
        this.params.page = 1
        this.items = []
      }

      this.loading = true
      this.error = null

      try {
        const response = await api.get('/v1/pemasukan-kotak-masjid/getlist', {
          params: this.params,
        })
        const paginator = response.data?.data ?? {}
        const rows = paginator.data ?? []

        this.items = reset ? rows : [...this.items, ...rows]
        this.params.page = Number(paginator.current_page ?? this.params.page)
        this.hasMore = Boolean(paginator.next_page_url)

        return response.data
      } catch (error) {
        console.error('GAGAL MENGAMBIL UANG MASUK KOTAK MASJID:', error)
        this.error = error.response?.data?.message || 'Gagal mengambil uang masuk kotak masjid.'
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
        await this.getPemasukan()
      } catch (error) {
        this.params.page -= 1
        throw error
      } finally {
        this.loadingMore = false
      }
    },

    async simpan() {
      this.saving = true
      this.error = null

      try {
        const response = await api.post('/v1/pemasukan-kotak-masjid/simpan', {
          ...this.form,
          nominal: Number(String(this.form.nominal).replace(/\./g, '')),
        })

        return response.data
      } catch (error) {
        console.error('GAGAL MENYIMPAN UANG MASUK KOTAK MASJID:', error)
        this.error = error.response?.data?.message || 'Gagal menyimpan uang masuk kotak masjid.'
        throw error
      } finally {
        this.saving = false
      }
    },

    async hapus(id) {
      this.menghapusId = id
      this.error = null

      try {
        const response = await api.post(`/v1/pemasukan-kotak-masjid/hapus/${id}`)

        return response.data
      } catch (error) {
        console.error('GAGAL MENGHAPUS UANG MASUK KOTAK MASJID:', error)
        this.error = error.response?.data?.message || 'Gagal menghapus uang masuk kotak masjid.'
        throw error
      } finally {
        this.menghapusId = null
      }
    },

    resetForm() {
      this.form.jenis_pemasukan = 'KOTAK_AMAL'
      this.form.nominal = ''
      this.form.keterangan = ''
    },
  },
})
