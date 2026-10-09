import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

const tanggalHariIni = () => new Date().toISOString().slice(0, 10)

export const useLaporanKasUmumMasjidStore = defineStore('laporan-kas-umum-masjid', {
  state: () => ({
    loading: false,
    error: null,
    params: {
      tanggal_dari: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
      tanggal_sampai: tanggalHariIni(),
    },
    ringkasan: {
      saldo_awal: 0,
      total_pemasukan: 0,
      total_pengeluaran: 0,
      saldo_akhir: 0,
    },
    data: {
      KOTAK_AMAL: {
        label: 'Kotak Amal',
        saldo_awal: 0,
        total_pemasukan: 0,
        total_pengeluaran: 0,
        saldo_akhir: 0,
        buku_kas: [],
      },
      PEMBANGUNAN_MASJID: {
        label: 'Pembangunan Masjid',
        saldo_awal: 0,
        total_pemasukan: 0,
        total_pengeluaran: 0,
        saldo_akhir: 0,
        buku_kas: [],
      },
    },
  }),

  actions: {
    async getLaporan() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/v1/laporan/kas-umum-masjid', { params: this.params })
        this.ringkasan = response.data?.ringkasan ?? this.ringkasan
        this.data = response.data?.data ?? this.data
        return response.data
      } catch (error) {
        console.error('GAGAL MENGAMBIL LAPORAN KAS UMUM MASJID:', error)
        this.error = error.response?.data?.message || 'Gagal mengambil laporan kas umum masjid.'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
