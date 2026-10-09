import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

const tanggalHariIni = () => new Date().toISOString().slice(0, 10)
const rincianBaru = () => ({ harga_satuan: '', jumlah: 1, satuan: '', keterangan: '' })

export const usePengeluaranMasjidStore = defineStore('pengeluaran-masjid', {
  state: () => ({
    items: [],
    loading: false,
    loadingMore: false,
    saving: false,
    menyimpanHeader: false,
    menghapusHeaderId: null,
    menghapusRincianId: null,
    hasMore: false,
    error: null,
    params: {
      page: 1,
      per_page: 20,
      tanggal_dari: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
      tanggal_sampai: tanggalHariIni(),
    },
    form: {
      jenis_sumber_dana: 'KOTAK_AMAL',
      kegiatan: '',
      rincian: [rincianBaru()],
    },
    formHeader: { id: null, kegiatan: '' },
  }),

  actions: {
    async getPengeluaran({ reset = false } = {}) {
      if (reset) {
        this.params.page = 1
        this.items = []
      }

      this.loading = true
      this.error = null
      try {
        const response = await api.get('/v1/pengeluaran-masjid/getlist', { params: this.params })
        const paginator = response.data?.data ?? {}
        const rows = paginator.data ?? []
        this.items = reset ? rows : [...this.items, ...rows]
        this.params.page = Number(paginator.current_page ?? this.params.page)
        this.hasMore = Boolean(paginator.next_page_url)
        return response.data
      } catch (error) {
        console.error('GAGAL MENGAMBIL PENGELUARAN MASJID:', error)
        this.error = error.response?.data?.message || 'Gagal mengambil pengeluaran masjid.'
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
        await this.getPengeluaran()
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
        const response = await api.post('/v1/pengeluaran-masjid/simpan', {
          ...this.form,
          rincian: this.form.rincian.map((rinci) => ({
            harga_satuan: Number(String(rinci.harga_satuan).replace(/\./g, '')),
            jumlah: Number(rinci.jumlah),
            satuan: rinci.satuan,
            keterangan: rinci.keterangan || null,
          })),
        })
        return response.data
      } catch (error) {
        console.error('GAGAL MENYIMPAN PENGELUARAN MASJID:', error)
        this.error = error.response?.data?.message || 'Gagal menyimpan pengeluaran masjid.'
        throw error
      } finally {
        this.saving = false
      }
    },

    async simpanHeader() {
      this.menyimpanHeader = true
      this.error = null
      try {
        const response = await api.post(`/v1/pengeluaran-masjid/header/${this.formHeader.id}`, {
          kegiatan: this.formHeader.kegiatan,
        })
        return response.data
      } catch (error) {
        console.error('GAGAL MEMPERBARUI PENGELUARAN MASJID:', error)
        this.error = error.response?.data?.message || 'Gagal memperbarui pengeluaran masjid.'
        throw error
      } finally {
        this.menyimpanHeader = false
      }
    },

    async hapusHeader(id) {
      this.menghapusHeaderId = id
      this.error = null
      try {
        const response = await api.post(`/v1/pengeluaran-masjid/hapus-header/${id}`)
        return response.data
      } catch (error) {
        console.error('GAGAL MENGHAPUS PENGELUARAN MASJID:', error)
        this.error = error.response?.data?.message || 'Gagal menghapus pengeluaran masjid.'
        throw error
      } finally {
        this.menghapusHeaderId = null
      }
    },

    async hapusRincian(id) {
      this.menghapusRincianId = id
      this.error = null
      try {
        const response = await api.post(`/v1/pengeluaran-masjid/hapus-rincian/${id}`)
        return response.data
      } catch (error) {
        console.error('GAGAL MENGHAPUS RINCIAN PENGELUARAN MASJID:', error)
        this.error = error.response?.data?.message || 'Gagal menghapus rincian pengeluaran masjid.'
        throw error
      } finally {
        this.menghapusRincianId = null
      }
    },

    tambahRincian() {
      this.form.rincian.push(rincianBaru())
    },

    hapusRincianBaru(index) {
      this.form.rincian.splice(index, 1)
    },

    resetForm() {
      this.form.jenis_sumber_dana = 'KOTAK_AMAL'
      this.form.kegiatan = ''
      this.form.rincian.splice(0, this.form.rincian.length, rincianBaru())
    },
  },
})
