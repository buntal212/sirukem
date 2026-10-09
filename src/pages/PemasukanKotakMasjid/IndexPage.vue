<template>
  <q-page class="bg-grey-2">
    <div class="iuran-header">
      <div class="header-circle header-circle-1"></div>
      <div class="header-circle header-circle-2"></div>

      <div class="row items-center no-wrap header-content">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          color="white"
          class="header-back-btn q-mr-sm"
          @click="router.push('/')"
        >
          <q-tooltip>Kembali ke Beranda</q-tooltip>
        </q-btn>
        <div class="col">
          <div class="header-title">Uang Pemasukkan Masjid</div>
          <div class="header-subtitle">Desa Rowo Leces</div>
        </div>
        <div class="header-icon"><q-icon name="mosque" size="31px" color="white" /></div>
      </div>
    </div>

    <div class="content q-pa-md">
      <q-card flat bordered class="filter-card q-mb-md">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="periode-icon">
              <q-icon name="calendar_month" size="25px" color="primary" />
            </div>
            <div class="q-ml-sm">
              <div class="text-weight-bold text-subtitle1">Periode Uang Pemasukkan</div>
              <div class="text-caption text-grey-7">Pilih rentang tanggal uang masuk masjid</div>
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                :model-value="store.params.tanggal_dari"
                dense
                outlined
                type="date"
                label="Tanggal Dari"
                :max="store.params.tanggal_sampai"
                @update:model-value="ubahTanggalDari"
              >
                <template #prepend><q-icon name="calendar_month" color="primary" /></template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                :model-value="store.params.tanggal_sampai"
                dense
                outlined
                type="date"
                label="Tanggal Sampai"
                :min="store.params.tanggal_dari"
                @update:model-value="ubahTanggalSampai"
              >
                <template #prepend><q-icon name="event" color="primary" /></template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="store.loading && store.items.length === 0" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="45px" />
      </div>

      <q-card
        v-else-if="store.items.length === 0"
        flat
        bordered
        class="empty-card text-center q-pa-xl"
      >
        <q-icon name="savings" color="grey-5" size="54px" />
        <div class="text-subtitle1 text-weight-medium q-mt-sm">Belum ada uang pemasukkan</div>
        <div class="text-caption text-grey-7">
          Tambahkan hasil kotak amal atau bantuan pembangunan.
        </div>
      </q-card>

      <q-infinite-scroll v-else :offset="150" @load="loadMore">
        <div class="q-gutter-sm">
          <q-card v-for="item in store.items" :key="item.id" flat bordered class="pemasukan-card">
            <q-card-section class="row items-center no-wrap">
              <div
                :class="['icon-wrapper', kelasJenisPemasukan(item.jenis_pemasukan)]"
                class="q-mr-md"
              >
                <q-icon :name="iconJenisPemasukan(item.jenis_pemasukan)" size="25px" />
              </div>
              <div class="col">
                <div class="text-weight-bold">{{ rupiah(item.nominal) }}</div>
                <div class="text-caption text-grey-7">{{ formatTanggal(item.tanggal_masuk) }}</div>
                <q-badge
                  class="q-mt-xs"
                  :color="warnaBadgeJenisPemasukan(item.jenis_pemasukan)"
                  :text-color="warnaTeksBadgeJenisPemasukan(item.jenis_pemasukan)"
                >
                  {{ labelJenisPemasukan(item.jenis_pemasukan) }}
                </q-badge>
                <div v-if="item.keterangan" class="text-body2 q-mt-xs">{{ item.keterangan }}</div>
              </div>
              <q-btn
                v-if="adalahBulanBerjalan(item.tanggal_masuk)"
                flat
                round
                dense
                color="negative"
                icon="delete_outline"
                :loading="store.menghapusId === item.id"
                :disable="store.menghapusId !== null"
                @click="hapus(item)"
              >
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </q-card-section>
          </q-card>
        </div>
        <template #loading
          ><div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" /></div
        ></template>
      </q-infinite-scroll>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab color="primary" icon="add" @click="dialog = true"
          ><q-tooltip>Tambah uang pemasukkan</q-tooltip></q-btn
        >
      </q-page-sticky>
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card class="form-card">
        <q-card-section><div class="text-h6">Tambah Uang Pemasukkan</div></q-card-section>
        <q-card-section class="q-pt-none q-gutter-md">
          <q-select
            v-model="store.form.jenis_pemasukan"
            dense
            outlined
            emit-value
            map-options
            :options="jenisPemasukanOptions"
            label="Jenis pemasukkan"
          />
          <q-input
            v-model="store.form.nominal"
            dense
            outlined
            inputmode="numeric"
            prefix="Rp"
            label="Nominal"
            @update:model-value="formatNominal"
          />
          <q-input
            v-model.trim="store.form.keterangan"
            dense
            outlined
            type="textarea"
            autogrow
            label="Keterangan (opsional)"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Batal" @click="tutupForm" />
          <q-btn
            unelevated
            no-caps
            color="primary"
            label="Simpan"
            :loading="store.saving"
            @click="simpan"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { usePemasukanKotakMasjidStore } from '@/stores/pemasukankotakmasjid'

const $q = useQuasar()
const router = useRouter()
const store = usePemasukanKotakMasjidStore()
const dialog = ref(false)
const jenisPemasukanOptions = [
  { label: 'Kotak Amal', value: 'KOTAK_AMAL' },
  { label: 'Pembangunan Masjid', value: 'PEMBANGUNAN_MASJID' },
]

const rupiah = (nilai) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(nilai || 0))
const formatTanggal = (nilai) =>
  new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(`${nilai}T00:00:00`),
  )
const labelJenisPemasukan = (jenis) =>
  jenis === 'PEMBANGUNAN_MASJID' ? 'Pembangunan Masjid' : 'Kotak Amal'
const adalahPembangunanMasjid = (jenis) => jenis === 'PEMBANGUNAN_MASJID'
const iconJenisPemasukan = (jenis) => (adalahPembangunanMasjid(jenis) ? 'construction' : 'savings')
const kelasJenisPemasukan = (jenis) =>
  adalahPembangunanMasjid(jenis) ? 'icon-pembangunan' : 'icon-kotak-amal'
const warnaBadgeJenisPemasukan = (jenis) => (adalahPembangunanMasjid(jenis) ? 'orange-1' : 'teal-1')
const warnaTeksBadgeJenisPemasukan = (jenis) =>
  adalahPembangunanMasjid(jenis) ? 'orange-9' : 'teal-9'

const formatNominal = (nilai) => {
  store.form.nominal = String(nilai || '')
    .replace(/\D/g, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const adalahBulanBerjalan = (tanggal) => {
  const [tahun, bulan] = tanggal.split('-').map(Number)
  const sekarang = new Date()
  return tahun === sekarang.getFullYear() && bulan === sekarang.getMonth() + 1
}

const tampilkanError = () => $q.notify({ type: 'negative', message: store.error, position: 'top' })
const getPemasukan = async () => {
  try {
    await store.getPemasukan({ reset: true })
  } catch {
    tampilkanError()
  }
}
const ubahTanggalDari = async (value) => {
  if (!value || value === store.params.tanggal_dari) return
  store.params.tanggal_dari = value
  await getPemasukan()
}
const ubahTanggalSampai = async (value) => {
  if (!value || value === store.params.tanggal_sampai) return
  store.params.tanggal_sampai = value
  await getPemasukan()
}
const tutupForm = () => {
  dialog.value = false
  store.resetForm()
}
const simpan = async () => {
  try {
    const response = await store.simpan()
    $q.notify({ type: 'positive', message: response?.message, position: 'top' })
    tutupForm()
    await getPemasukan()
  } catch {
    tampilkanError()
  }
}
const hapus = (item) => {
  $q.dialog({
    title: 'Hapus uang pemasukkan?',
    message: 'Catatan uang pemasukkan masjid ini akan dihapus.',
    persistent: true,
    ok: { label: 'Hapus', color: 'negative', noCaps: true },
    cancel: { label: 'Batal', flat: true, noCaps: true },
  }).onOk(async () => {
    try {
      const response = await store.hapus(item.id)
      $q.notify({ type: 'positive', message: response?.message, position: 'top' })
      await getPemasukan()
    } catch {
      tampilkanError()
    }
  })
}
const loadMore = async (index, done) => {
  try {
    await store.loadMore()
    done(!store.hasMore)
  } catch {
    tampilkanError()
    done()
  }
}

onMounted(getPemasukan)
</script>

<style scoped>
.iuran-header {
  position: relative;
  overflow: hidden;
  padding: 17px 16px;
  color: white;
  background: linear-gradient(135deg, #083a98 0%, #0d5ac7 55%, #1678ff 100%);
  box-shadow: 0 5px 18px rgba(8, 58, 152, 0.18);
}
.content {
  max-width: 900px;
  margin: 0 auto;
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
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
.header-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.header-circle-1 {
  top: -70px;
  right: -40px;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.08);
}
.header-circle-2 {
  right: 45px;
  bottom: -65px;
  width: 80px;
  height: 80px;
  background: rgba(24, 216, 255, 0.12);
}
.filter-card,
.pemasukan-card,
.empty-card {
  border-radius: 16px;
}
.filter-card {
  border: 1px solid #e5edf7;
}
.periode-icon {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #e8f1ff;
}
.pemasukan-card {
  border-color: #dcefe9;
}
.icon-wrapper {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.icon-kotak-amal {
  color: #00796b;
  background: #e0f2f1;
}
.icon-pembangunan {
  color: #e65100;
  background: #fff3e0;
}
.form-card {
  width: 480px;
  max-width: 92vw;
}
</style>
