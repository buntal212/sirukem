import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

export const usePendudukStore = defineStore('penduduk', {
  state: () => ({
    items: [],
    currentPage: 1,
    perPage: 20,
    hasMore: true,
    search: '',

    loading: false,
    loadingMore: false,
    saving: false,
    deleting: false,

    error: null
  }),

  getters: {
    isEmpty(state) {
      return !state.loading && state.items.length === 0
    },
  },

  actions: {
    /*
    |--------------------------------------------------------------------------
    | GET PENDUDUK
    |--------------------------------------------------------------------------
    */
    async getPenduduk(params = {}) {
      const reset = params.reset ?? false

      if (reset) {
        this.currentPage = 1
        this.lastPage = 1
        this.items = []
      }

      this.loading = true
      this.error = null

      try {
        const response = await api.get('/v1/penduduk/getlist', {
          params: {
            page: this.currentPage,
            per_page: this.perPage,
            search: this.search || undefined,
          },
        })

        const result = response.data
        const rows = result.data ?? []

        this.items = rows

        this.currentPage =
          result.current_page ?? 1

        this.perPage =
          result.per_page ?? this.perPage

        this.hasMore =
          result.has_more ?? false

        return result
      } catch (error) {
        console.error(
          'GET PENDUDUK ERROR:',
          error
        )

        this.error =
          error.response?.data?.message ||
          'Gagal mengambil data penduduk'

        throw error
      } finally {
        this.loading = false
      }
    },

    /*
    |--------------------------------------------------------------------------
    | LOAD MORE
    |--------------------------------------------------------------------------
    */
  async loadMore() {
    if (this.loadingMore) {
      return
    }

    if (!this.hasMore) {
      return
    }

    this.loadingMore = true
    this.error = null

    try {
      const nextPage =
        this.currentPage + 1

      const response = await api.get(
        '/v1/penduduk/getlist',
        {
          params: {
            page: nextPage,
            per_page: this.perPage,
            search: this.search || undefined,
          },
        }
      )

      const result = response.data
      const rows = result.data ?? []

      this.items.push(...rows)

      this.currentPage =
        result.current_page ?? nextPage

      this.hasMore =
        result.has_more ?? false

      return result
    } catch (error) {
      console.error(
        'LOAD MORE PENDUDUK ERROR:',
        error
      )

      this.error =
        error.response?.data?.message ||
        'Gagal memuat data berikutnya'

      throw error
    } finally {
      this.loadingMore = false
    }
  },

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */
    async searchPenduduk(keyword) {
      this.search = keyword ?? ''

      return await this.getPenduduk({
        reset: true,
      })
    },

    /*
    |--------------------------------------------------------------------------
    | GET DETAIL
    |--------------------------------------------------------------------------
    */
    async getDetailPenduduk(id) {
      this.error = null
      const params = {id}

      try {
        const response = await api.get(
          '/v1/penduduk/getdetail', {
            params
          }
        )

        return response.data
      } catch (error) {
        console.error(
          'GET DETAIL PENDUDUK ERROR:',
          error
        )

        this.error =
          error.response?.data?.message ||
          'Gagal mengambil detail penduduk'

        throw error
      }
    },

    /*
    |--------------------------------------------------------------------------
    | TAMBAH
    |--------------------------------------------------------------------------
    */
    async createPenduduk(payload) {
      this.saving = true
      this.error = null

      try {
        const response = await api.post(
          '/v1/penduduk/simpan',
          payload
        )

        return response.data
      } catch (error) {
        console.error(
          'CREATE PENDUDUK ERROR:',
          error
        )

        this.error =
          error.response?.data?.message ||
          'Gagal menyimpan data penduduk'

        throw error
      } finally {
        this.saving = false
      }
    },

    // /*
    // |--------------------------------------------------------------------------
    // | UPDATE
    // |--------------------------------------------------------------------------
    // |
    // | Tetap POST, bukan PUT/PATCH
    // |
    // */
    // async updatePenduduk(id, payload) {
    //   this.saving = true
    //   this.error = null

    //   try {
    //     const response = await api.post(
    //       `/v1/penduduk/${id}/update`,
    //       payload
    //     )

    //     return response.data
    //   } catch (error) {
    //     console.error(
    //       'UPDATE PENDUDUK ERROR:',
    //       error
    //     )

    //     this.error =
    //       error.response?.data?.message ||
    //       'Gagal memperbarui data penduduk'

    //     throw error
    //   } finally {
    //     this.saving = false
    //   }
    // },

    /*
    |--------------------------------------------------------------------------
    | HAPUS
    |--------------------------------------------------------------------------
    |
    | Tetap POST, bukan DELETE
    |
    */
    async deletePenduduk(id) {
      this.deleting = true
      this.error = null
      const payload = {id:id}
      try {
        const response = await api.post(
          '/v1/penduduk/delete', payload
        )

        /*
         * Hapus dari state setelah
         * backend berhasil menghapus.
         */
        this.items = this.items.filter(
          (item) => item.id !== id
        )

        if (this.total > 0) {
          this.total--
        }

        return response.data
      } catch (error) {
        console.error(
          'DELETE PENDUDUK ERROR:',
          error
        )

        this.error =
          error.response?.data?.message ||
          'Gagal menghapus data penduduk'

        throw error
      } finally {
        this.deleting = false
      }
    },

    /*
    |--------------------------------------------------------------------------
    | REFRESH
    |--------------------------------------------------------------------------
    */
    async refreshPenduduk() {
      return await this.getPenduduk({
        reset: true,
      })
    },

    /*
    |--------------------------------------------------------------------------
    | RESET STORE
    |--------------------------------------------------------------------------
    */
    resetStore() {
      this.items = []

      this.currentPage = 1
      this.lastPage = 1
      this.perPage = 20
      this.total = 0

      this.search = ''

      this.loading = false
      this.loadingMore = false
      this.saving = false
      this.deleting = false

      this.error = null
    },
  },
})
