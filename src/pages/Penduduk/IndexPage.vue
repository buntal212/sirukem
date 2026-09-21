<template>
  <q-page class="bg-grey-2">
    <!-- HEADER -->
    <div class="penduduk-header">
      <!-- DEKORASI -->
      <div class="header-circle header-circle-1"></div>
      <div class="header-circle header-circle-2"></div>

      <div class="row items-center no-wrap header-content">
        <!-- BACK -->
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          color="white"
          class="header-back-btn q-mr-sm"
          @click="goHome"
        >
          <q-tooltip>
            Kembali ke Beranda
          </q-tooltip>
        </q-btn>

        <!-- TITLE -->
        <div class="col">
          <div class="header-title">
            {{ pageTitle }}
          </div>

          <div class="header-subtitle">
            Desa Rowo Leces
          </div>
        </div>

        <!-- ICON -->
        <div class="header-icon">
          <q-icon
            name="groups"
            size="31px"
            color="white"
          />
        </div>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="q-pa-md">

      <!-- LOADING AWAL -->
      <div
        v-if="store.loading && store.items.length === 0"
        class="flex flex-center q-py-xl"
      >
        <div class="text-center">
          <q-spinner-dots
            color="primary"
            size="45px"
          />

          <div class="text-grey-7 q-mt-sm">
            Memuat data penduduk...
          </div>
        </div>
      </div>

      <!-- LIST -->
      <ListPage
        v-else-if="page === 'list'"
        :data="store.items"
        :total="store.total"
        :loading-more="store.loadingMore"
        :has-more="store.hasMore"
        @add="openAdd"
        @edit="openEdit"
        @delete="deletePenduduk"
        @search="searchPenduduk"
        @load-more="loadMorePenduduk"
        @refresh="refreshPenduduk"
      />

      <!-- FORM -->
      <FormPage
        v-else
        :data="selectedPenduduk"
        :mode="formMode"
        :loading="store.saving"
        @save="savePenduduk"
        @cancel="backToList"
      />

    </div>
  </q-page>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
} from 'vue'

import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

import ListPage from './comp/ListPage.vue'
import FormPage from './comp/FormPage.vue'

import { usePendudukStore } from '@/stores/penduduk.js'

const $q = useQuasar()
const router = useRouter()

/*
|--------------------------------------------------------------------------
| STORE
|--------------------------------------------------------------------------
*/

const store = usePendudukStore()

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const page = ref('list')

const formMode = ref('add')

const selectedPenduduk = ref(null)

/*
|--------------------------------------------------------------------------
| PAGE TITLE
|--------------------------------------------------------------------------
*/

const pageTitle = computed(() => {
  if (page.value === 'list') {
    return 'Data Penduduk'
  }

  return formMode.value === 'add'
    ? 'Tambah Penduduk'
    : 'Edit Penduduk'
})

/*
|--------------------------------------------------------------------------
| LOAD DATA PERTAMA
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  await getPenduduk()
})

/*
|--------------------------------------------------------------------------
| GET PENDUDUK
|--------------------------------------------------------------------------
*/

const getPenduduk = async () => {
  try {
    await store.getPenduduk({
      reset: true,
    })
  } catch (error) {
    console.error(
      'GET PENDUDUK ERROR:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        store.error ||
        'Gagal mengambil data penduduk',
      position: 'top',
    })
  }
}

/*
|--------------------------------------------------------------------------
| HOME
|--------------------------------------------------------------------------
*/

const goHome = () => {
  /*
   * Kalau sedang di form,
   * kembali ke list.
   */
  if (page.value === 'form') {
    backToList()
    return
  }

  /*
   * Kalau sudah di list,
   * kembali ke halaman utama.
   */
  router.push('/')
}

/*
|--------------------------------------------------------------------------
| TAMBAH
|--------------------------------------------------------------------------
*/

const openAdd = () => {
  formMode.value = 'add'

  selectedPenduduk.value = null

  page.value = 'form'
}

/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

const openEdit = async (item) => {
  try {
    /*
     * Panggil:
     *
     * GET /v1/penduduk/getdetail?id=xxx
     */
    const response =
      await store.getDetailPenduduk(
        item.id
      )

    /*
     * Antisipasi response:
     *
     * {
     *   data: {...}
     * }
     *
     * atau langsung:
     *
     * {...}
     */
    selectedPenduduk.value =
      response.data ?? response

    formMode.value = 'edit'

    page.value = 'form'
  } catch (error) {
    console.error(
      'GET DETAIL ERROR:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        store.error ||
        'Gagal mengambil detail penduduk',
      position: 'top',
    })
  }
}

/*
|--------------------------------------------------------------------------
| KEMBALI KE LIST
|--------------------------------------------------------------------------
*/

const backToList = () => {
  page.value = 'list'

  selectedPenduduk.value = null
}

/*
|--------------------------------------------------------------------------
| SIMPAN
|--------------------------------------------------------------------------
*/

const savePenduduk = async (data) => {
  try {
    /*
     * Payload dari FormPage.
     */
    const payload = {
      ...data,
    }

    /*
     * Kalau EDIT,
     * tambahkan ID ke payload.
     *
     * Endpoint simpan tetap sama.
     */
    if (
      formMode.value === 'edit' &&
      selectedPenduduk.value?.id
    ) {
      payload.id =
        selectedPenduduk.value.id
    }

    /*
     * POST /v1/penduduk/simpan
     */
    const response =
      await store.createPenduduk(
        payload
      )

    $q.notify({
      type: 'positive',

      message:
        response?.message ||
        (
          formMode.value === 'add'
            ? 'Data penduduk berhasil ditambahkan'
            : 'Data penduduk berhasil diperbarui'
        ),

      position: 'top',
    })

    /*
     * Setelah simpan berhasil,
     * ambil ulang list.
     */
    await store.refreshPenduduk()

    /*
     * Kembali ke list.
     */
    backToList()
  } catch (error) {
    console.error(
      'SAVE PENDUDUK ERROR:',
      error
    )

    $q.notify({
      type: 'negative',

      message:
        store.error ||
        'Gagal menyimpan data penduduk',

      position: 'top',
    })
  }
}

/*
|--------------------------------------------------------------------------
| HAPUS
|--------------------------------------------------------------------------
*/

const deletePenduduk = (item) => {
  $q.dialog({
    title: 'Hapus Penduduk',

    message:
      `Apakah data ${item.nama} akan dihapus?`,

    persistent: true,

    ok: {
      label: 'Hapus',
      color: 'negative',
      noCaps: true,
    },

    cancel: {
      label: 'Batal',
      flat: true,
      noCaps: true,
    },
  }).onOk(async () => {
    try {
      /*
       * POST /v1/penduduk/delete
       *
       * payload:
       * {
       *   id: xxx
       * }
       */
      const response =
        await store.deletePenduduk(
          item.id
        )

      $q.notify({
        type: 'positive',

        message:
          response?.message ||
          'Data penduduk berhasil dihapus',

        position: 'top',
      })
    } catch (error) {
      console.error(
        'DELETE PENDUDUK ERROR:',
        error
      )

      $q.notify({
        type: 'negative',

        message:
          store.error ||
          'Gagal menghapus data penduduk',

        position: 'top',
      })
    }
  })
}

/*
|--------------------------------------------------------------------------
| SEARCH
|--------------------------------------------------------------------------
*/

const searchPenduduk = async (keyword) => {
  try {
    await store.searchPenduduk(
      keyword
    )
  } catch (error) {
    console.error(
      'SEARCH PENDUDUK ERROR:',
      error
    )
  }
}

/*
|--------------------------------------------------------------------------
| LOAD MORE
|--------------------------------------------------------------------------
*/

const loadMorePenduduk = async (done) => {
  try {
    /*
     * Sudah tidak ada page berikutnya.
     */
    if (!store.hasMore) {
      if (typeof done === 'function') {
        done(true)
      }

      return
    }

    /*
     * Ambil page berikutnya.
     */
    await store.loadMore()

    /*
     * Kalau sudah page terakhir,
     * stop infinite scroll.
     */
    if (typeof done === 'function') {
      done(!store.hasMore)
    }
  } catch (error) {
    console.error(
      'LOAD MORE PENDUDUK ERROR:',
      error
    )

    if (typeof done === 'function') {
      done()
    }
  }
}

/*
|--------------------------------------------------------------------------
| REFRESH
|--------------------------------------------------------------------------
*/

const refreshPenduduk = async (done) => {
  try {
    await store.refreshPenduduk()
  } catch (error) {
    console.error(
      'REFRESH PENDUDUK ERROR:',
      error
    )

    $q.notify({
      type: 'negative',

      message:
        store.error ||
        'Gagal memperbarui data penduduk',

      position: 'top',
    })
  } finally {
    if (typeof done === 'function') {
      done()
    }
  }
}
</script>

<style lang="css">
/* =====================================
   HEADER PENDUDUK
===================================== */

.penduduk-header {
  position: relative;
  overflow: hidden;

  padding: 17px 16px;

  color: white;

  background:
    linear-gradient(
      135deg,
      #083a98 0%,
      #0d5ac7 55%,
      #1678ff 100%
    );

  box-shadow:
    0 5px 18px rgba(8, 58, 152, 0.18);
}

/* CONTENT */

.header-content {
  position: relative;
  z-index: 2;
}

/* BACK BUTTON */

.header-back-btn {
  width: 40px;
  height: 40px;

  background: rgba(255, 255, 255, 0.12);

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.header-back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.header-back-btn:active {
  transform: scale(0.94);
}

/* TITLE */

.header-title {
  font-size: 18px;
  line-height: 1.25;

  font-weight: 800;

  letter-spacing: 0.2px;
}

/* SUBTITLE */

.header-subtitle {
  margin-top: 4px;

  font-size: 11px;
  font-weight: 500;

  color: rgba(255, 255, 255, 0.8);
}

/* ICON KANAN */

.header-icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 15px;

  background: rgba(255, 255, 255, 0.14);

  border:
    1px solid rgba(255, 255, 255, 0.16);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* =====================================
   DEKORASI BACKGROUND
===================================== */

.header-circle {
  position: absolute;

  border-radius: 50%;

  pointer-events: none;
}

.header-circle-1 {
  width: 120px;
  height: 120px;

  right: -40px;
  top: -70px;

  background:
    rgba(255, 255, 255, 0.08);
}

.header-circle-2 {
  width: 80px;
  height: 80px;

  right: 45px;
  bottom: -65px;

  background:
    rgba(24, 216, 255, 0.12);
}
</style>
