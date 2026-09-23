<template>
  <q-page class="bg-grey-2">
    <!-- HEADER -->
    <div class="iuran-header">
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
          <q-tooltip> Kembali ke Beranda </q-tooltip>
        </q-btn>

        <!-- TITLE -->
        <div class="col">
          <div class="header-title">
            {{ pageTitle }}
          </div>

          <div class="header-subtitle">Desa Rowo Leces</div>
        </div>

        <!-- ICON -->
        <div class="header-icon">
          <q-icon name="account_balance_wallet" size="31px" color="white" />
        </div>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="q-pa-md">
      <!-- LOADING -->
      <div v-if="store.loading && store.items.length === 0" class="flex flex-center q-py-xl">
        <div class="text-center">
          <q-spinner-dots color="primary" size="45px" />

          <div class="text-grey-7 q-mt-sm">Memuat data iuran warga...</div>
        </div>
      </div>

      <!-- LIST IURAN -->
      <ListPage
        v-else-if="page === 'list'"
        :data="store.items"
        :total="store.total"
        :loading-more="store.loadingMore"
        :has-more="store.hasMore"
        :bulan="bulan"
        :minggu="minggu"
        :tahun="tahun"
        @search="searchIuran"
        @bulan="changeBulan"
        @minggu="changeMinggu"
        @tahun="changeTahun"
        @bayar="openBayar"
        @load-more="loadMoreIuran"
        @refresh="refreshIuran"
      />

      <!-- FORM PEMBAYARAN -->
      <FormPage
        v-else-if="page === 'bayar' && selectedWarga"
        :data="selectedWarga"
        :bulan="bulan"
        :minggu="minggu"
        :tahun="tahun"
        :loading="store.saving"
        @save="savePembayaran"
        @cancel="backToList"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

import { useIuranStore } from '@/stores/iuranrukem.js'
import ListPage from './comp/ListPage.vue'
import FormPage from './comp/FormPage.vue'

const $q = useQuasar()
const router = useRouter()

const store = useIuranStore()

// =========================================================
// STATE
// =========================================================

const page = ref('list')
const selectedWarga = ref(null)

const sekarang = new Date()

const bulan = ref(sekarang.getMonth() + 1)
const minggu = ref(Math.min(Math.ceil(sekarang.getDate() / 7), 4))
const tahun = ref(sekarang.getFullYear())

// =========================================================
// PAGE TITLE
// =========================================================

const pageTitle = computed(() => {
  if (page.value === 'list') {
    return 'Iuran Warga'
  }

  return 'Pembayaran Iuran'
})

// =========================================================
// LOAD DATA
// =========================================================

onMounted(async () => {
  await getIuran()
})

// =========================================================
// GET IURAN
// =========================================================

const getIuran = async () => {
  try {
    await store.getIuran({
      bulan: bulan.value,
      minggu: minggu.value,
      tahun: tahun.value,
      reset: true,
    })
  } catch (error) {
    console.error('GET IURAN ERROR:', error)

    $q.notify({
      type: 'negative',
      message: store.error || 'Gagal mengambil data iuran warga',
      position: 'top',
    })
  }
}

// =========================================================
// HOME / BACK
// =========================================================

const goHome = () => {
  if (page.value === 'bayar') {
    backToList()
    return
  }

  router.push('/')
}

// =========================================================
// OPEN PEMBAYARAN
// =========================================================

const openBayar = (item) => {
  if (!item || item.id === undefined || item.id === null) {
    $q.notify({
      type: 'negative',
      message: 'Data warga tidak valid',
      position: 'top',
    })
    return
  }

  selectedWarga.value = item
  page.value = 'bayar'
}

// =========================================================
// BACK LIST
// =========================================================

const backToList = () => {
  page.value = 'list'
  selectedWarga.value = null
}

// =========================================================
// GANTI BULAN
// =========================================================

const changeBulan = async (value) => {
  if (!value || value === bulan.value) {
    return
  }

  bulan.value = value

  await getIuran()
}

const changeMinggu = async (value) => {
  if (!value || value === minggu.value) {
    return
  }

  minggu.value = value

  await getIuran()
}

// =========================================================
// GANTI TAHUN
// =========================================================

const changeTahun = async (value) => {
  if (!value || value === tahun.value) {
    return
  }

  tahun.value = value

  await getIuran()
}

// =========================================================
// SEARCH
// =========================================================

const searchIuran = async (keyword) => {
  try {
    await store.searchIuran(keyword, {
      bulan: bulan.value,
      minggu: minggu.value,
      tahun: tahun.value,
    })
  } catch (error) {
    console.error('SEARCH IURAN ERROR:', error)

    $q.notify({
      type: 'negative',
      message: store.error || 'Gagal mencari data iuran warga',
      position: 'top',
    })
  }
}

// =========================================================
// SIMPAN PEMBAYARAN
// =========================================================

const savePembayaran = async (data) => {
  if (!selectedWarga.value?.id) {
    $q.notify({
      type: 'negative',
      message: 'Pilih warga terlebih dahulu',
      position: 'top',
    })
    backToList()
    return
  }

  try {
    const payload = {
      ...data,

      penduduk_id: selectedWarga.value.id,

      bulan: bulan.value,

      minggu: minggu.value,

      tahun: tahun.value,
    }

    const response = await store.simpanPembayaran(payload)

    $q.notify({
      type: 'positive',
      message: response?.message || 'Pembayaran iuran berhasil disimpan',
      position: 'top',
    })

    await store.refreshIuran({
      bulan: bulan.value,
      minggu: minggu.value,
      tahun: tahun.value,
    })

    backToList()
  } catch (error) {
    console.error('SAVE PEMBAYARAN ERROR:', error)

    $q.notify({
      type: 'negative',
      message: store.error || 'Gagal menyimpan pembayaran iuran',
      position: 'top',
    })
  }
}

// =========================================================
// LOAD MORE
// =========================================================

const loadMoreIuran = async (done) => {
  try {
    if (!store.hasMore) {
      if (typeof done === 'function') {
        done(true)
      }

      return
    }

    await store.loadMore({
      bulan: bulan.value,
      minggu: minggu.value,
      tahun: tahun.value,
    })

    if (typeof done === 'function') {
      done(!store.hasMore)
    }
  } catch (error) {
    console.error('LOAD MORE IURAN ERROR:', error)

    if (typeof done === 'function') {
      done()
    }
  }
}

// =========================================================
// REFRESH
// =========================================================

const refreshIuran = async (done) => {
  try {
    await store.refreshIuran({
      bulan: bulan.value,
      minggu: minggu.value,
      tahun: tahun.value,
    })
  } catch (error) {
    console.error('REFRESH IURAN ERROR:', error)

    $q.notify({
      type: 'negative',
      message: store.error || 'Gagal memperbarui data iuran',
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
   HEADER IURAN
===================================== */

.iuran-header {
  position: relative;
  overflow: hidden;
  padding: 17px 16px;
  color: white;

  background: linear-gradient(135deg, #083a98 0%, #0d5ac7 55%, #1678ff 100%);

  box-shadow: 0 5px 18px rgba(8, 58, 152, 0.18);
}

.header-content {
  position: relative;
  z-index: 2;
}

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

.header-title {
  font-size: 18px;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.header-subtitle {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 500;

  color: rgba(255, 255, 255, 0.8);
}

.header-icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 15px;

  background: rgba(255, 255, 255, 0.14);

  border: 1px solid rgba(255, 255, 255, 0.16);

  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* =====================================
   DEKORASI
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

  background: rgba(255, 255, 255, 0.08);
}

.header-circle-2 {
  width: 80px;
  height: 80px;

  right: 45px;
  bottom: -65px;

  background: rgba(24, 216, 255, 0.12);
}
</style>
