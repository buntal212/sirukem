import { defineStore } from 'pinia'
import { api } from '../boot/axios'

export const useMiuranStore = defineStore('miuran', {
  state: () => ({
    data: null,
    loading: false,
    saving: false,
    error: null,
  }),

  getters: {
    nominalIuran: (state) => {
      return Number(state.data?.nominaliuran ?? 0)
    },
  },

  actions: {
    // =========================================================
    // GET DATA IURAN
    // =========================================================
    async getMiuran() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/v1/setting/getlistiuran')

        this.data = response.data?.data ?? null

        return this.data
      } catch (error) {
        console.error('ERROR GET MIURAN:', error)

        this.error =
          error.response?.data?.message ||
          'Gagal mengambil data iuran'

        throw error
      } finally {
        this.loading = false
      }
    },

    // =========================================================
    // SIMPAN / UPDATE IURAN
    // =========================================================
    async saveMiuran(nominal) {
      this.saving = true
      this.error = null

      try {
        const payload = {
          nominaliuran: Number(nominal),
        }

        const response = await api.post(
          '/v1/setting/simpaniuran',
          payload
        )

        this.data = response.data?.data ?? null

        return response.data
      } catch (error) {
        console.error('ERROR SAVE MIURAN:', error)

        this.error =
          error.response?.data?.message ||
          'Gagal menyimpan nominal iuran'

        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
