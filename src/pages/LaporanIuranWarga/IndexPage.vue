<template>
  <q-page class="bg-grey-2">
    <div class="laporan-header">
      <div class="row items-center no-wrap laporan-header-content">
        <q-btn flat round dense icon="arrow_back" color="white" class="q-mr-sm" @click="goHome" />

        <div class="col">
          <div class="text-h6 text-weight-bold">{{ page === 'list' ? 'Laporan Iuran Warga' : 'Detail Iuran Warga' }}</div>
          <div class="text-caption text-white" style="opacity: 0.8">Desa Rowo Leces</div>
        </div>

        <q-icon name="assessment" size="30px" color="white" />
      </div>
    </div>

    <div class="q-pa-md">
      <div v-if="store.loading && store.items.length === 0" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="45px" />
      </div>

      <ListPage
        v-else-if="page === 'list'"
        :data="store.items"
        :ringkasan="store.ringkasan"
        :tahun="store.params.tahun"
        :status="store.params.status"
        :loading-more="store.loadingMore"
        :has-more="store.hasMore"
        @filter="ubahFilter"
        @lihat-detail="bukaDetail"
        @load-more="loadMore"
      />

      <DetailPage
        v-else
        :warga="store.detailWarga"
        :data="store.detailItems"
        :loading="store.loadingDetail"
        :loading-more="store.loadingDetail"
        :has-more="store.hasMoreDetail"
        :tahun="store.params.tahun"
        @back="kembaliKeList"
        @load-more="loadMoreDetail"
      />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useLaporanIuranWargaStore } from '@/stores/laporan/iuranwarga'
import ListPage from './comp/ListPage.vue'
import DetailPage from './comp/DetailPage.vue'

const $q = useQuasar()
const router = useRouter()
const store = useLaporanIuranWargaStore()
const page = ref('list')
const selectedWargaId = ref(null)

const getLaporan = async () => {
  try {
    await store.getLaporan({ reset: true })
  } catch {
    $q.notify({
      type: 'negative',
      message: store.error || 'Gagal mengambil laporan iuran warga',
      position: 'top',
    })
  }
}

const ubahFilter = async (filter) => {
  try {
    await store.ubahFilter(filter)
  } catch {
    $q.notify({
      type: 'negative',
      message: store.error || 'Gagal mengambil laporan iuran warga',
      position: 'top',
    })
  }
}

const loadMore = async (done) => {
  try {
    await store.loadMore()
    done(!store.hasMore)
  } catch {
    done()
  }
}

const bukaDetail = async (warga) => {
  selectedWargaId.value = warga.id
  page.value = 'detail'

  try {
    await store.getDetailWarga(warga.id, store.params.tahun, { reset: true })
  } catch {
    $q.notify({
      type: 'negative',
      message: store.error || 'Gagal mengambil detail iuran warga',
      position: 'top',
    })
  }
}

const kembaliKeList = () => {
  page.value = 'list'
  selectedWargaId.value = null
}

const loadMoreDetail = async (done) => {
  try {
    await store.loadMoreDetail(selectedWargaId.value, store.params.tahun)
    done(!store.hasMoreDetail)
  } catch {
    done()
  }
}

const goHome = () => {
  if (page.value === 'detail') {
    kembaliKeList()
    return
  }

  router.push('/')
}

onMounted(getLaporan)
</script>

<style scoped>
.laporan-header {
  padding: 17px 16px;
  color: white;
  background: linear-gradient(135deg, #083a98 0%, #0d5ac7 55%, #1678ff 100%);
  box-shadow: 0 5px 18px rgba(8, 58, 152, 0.18);
}

.laporan-header-content {
  max-width: 900px;
  margin: 0 auto;
}
</style>
