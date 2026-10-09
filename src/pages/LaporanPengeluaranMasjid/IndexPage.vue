<template>
  <q-page class="bg-grey-2">
    <div class="header">
      <div class="row items-center no-wrap">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          color="white"
          class="q-mr-sm"
          @click="router.push('/')"
        />
        <div class="col">
          <div class="text-h6 text-weight-bold">Laporan Pengeluaran Masjid</div>
          <div class="text-caption" style="opacity: 0.8">Rekap pengeluaran dana masjid</div>
        </div>
        <q-icon name="summarize" size="30px" />
      </div>
    </div>

    <div class="q-pa-md content">
      <q-card flat bordered class="filter-card q-mb-md">
        <q-card-section>
          <div class="text-weight-bold text-subtitle1">Periode laporan</div>
          <div class="text-caption text-grey-7 q-mb-md">Pilih tanggal pengeluaran masjid</div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                :model-value="store.params.tanggal_dari"
                type="date"
                dense
                outlined
                label="Tanggal Dari"
                :max="store.params.tanggal_sampai"
                @update:model-value="ubahTanggalDari"
              />
            </div>
            <div class="col-6">
              <q-input
                :model-value="store.params.tanggal_sampai"
                type="date"
                dense
                outlined
                label="Tanggal Sampai"
                :min="store.params.tanggal_dari"
                @update:model-value="ubahTanggalSampai"
              />
            </div>
            <div class="col-12">
              <q-select
                v-model="store.params.jenis_sumber_dana"
                dense
                outlined
                clearable
                emit-value
                map-options
                :options="jenisSumberDanaOptions"
                label="Jenis sumber dana"
                @update:model-value="getLaporan"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="store.loading && store.items.length === 0" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="42px" />
      </div>
      <template v-else>
        <q-card flat class="ringkasan-card q-mb-md text-white">
          <q-card-section>
            <div class="text-caption" style="opacity: 0.85">Total pengeluaran masjid</div>
            <div class="text-h5 text-weight-bold q-mt-xs">
              {{ rupiah(store.ringkasan.total_pengeluaran) }}
            </div>
            <div class="q-mt-sm text-caption">
              {{ store.ringkasan.total_transaksi }} transaksi dalam periode terpilih
            </div>
          </q-card-section>
        </q-card>

        <q-card v-if="store.items.length === 0" flat bordered class="empty-card">
          <q-card-section class="text-center q-py-xl"
            ><q-icon name="receipt_long" color="grey-5" size="44px" />
            <div class="text-weight-bold q-mt-sm">Belum ada pengeluaran masjid</div>
            <div class="text-caption text-grey-7">
              Tidak ada data pada periode ini.
            </div></q-card-section
          >
        </q-card>

        <q-infinite-scroll v-else :offset="150" @load="loadMore">
          <div class="column q-gutter-sm">
            <q-card
              v-for="item in store.items"
              :key="item.id"
              flat
              bordered
              class="pengeluaran-card"
            >
              <q-card-section class="row items-center no-wrap">
                <q-avatar
                  :color="warnaSumberDana(item.jenis_sumber_dana)"
                  :text-color="warnaTeksSumberDana(item.jenis_sumber_dana)"
                  :icon="iconSumberDana(item.jenis_sumber_dana)"
                />
                <div class="col q-ml-sm">
                  <div class="text-weight-bold">{{ item.kegiatan }}</div>
                  <div class="text-caption text-grey-7">
                    {{ formatTanggal(item.tanggal_pengeluaran) }}
                  </div>
                  <q-badge
                    class="q-mt-xs"
                    :color="warnaSumberDana(item.jenis_sumber_dana)"
                    :text-color="warnaTeksSumberDana(item.jenis_sumber_dana)"
                    >{{ labelSumberDana(item.jenis_sumber_dana) }}</q-badge
                  >
                </div>
                <div class="text-weight-bold text-negative">- {{ rupiah(item.total_nominal) }}</div>
              </q-card-section>
              <q-expansion-item
                dense
                expand-separator
                icon="receipt_long"
                label="Lihat rincian belanja"
                header-class="text-primary text-weight-medium"
              >
                <q-card-section class="q-pt-sm">
                  <q-list separator>
                    <q-item v-for="rinci in item.rincis" :key="rinci.id" class="q-px-none">
                      <q-item-section
                        ><q-item-label>{{ rinci.keterangan || 'Tanpa keterangan' }}</q-item-label
                        ><q-item-label caption
                          >{{ rupiah(rinci.harga_satuan) }} x {{ rinci.jumlah }}
                          {{ rinci.satuan }}</q-item-label
                        ></q-item-section
                      >
                      <q-item-section side class="text-weight-bold text-primary">{{
                        rupiah(rinci.nominal)
                      }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-expansion-item>
            </q-card>
          </div>
          <template #loading
            ><div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" /></div
          ></template>
        </q-infinite-scroll>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useLaporanPengeluaranMasjidStore } from '@/stores/laporanpengeluaranmasjid'

const $q = useQuasar()
const router = useRouter()
const store = useLaporanPengeluaranMasjidStore()
const jenisSumberDanaOptions = [
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
  new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(`${nilai}T00:00:00`),
  )
const pembangunan = (jenis) => jenis === 'PEMBANGUNAN_MASJID'
const labelSumberDana = (jenis) => (pembangunan(jenis) ? 'Pembangunan Masjid' : 'Kotak Amal')
const iconSumberDana = (jenis) => (pembangunan(jenis) ? 'construction' : 'savings')
const warnaSumberDana = (jenis) => (pembangunan(jenis) ? 'orange-1' : 'teal-1')
const warnaTeksSumberDana = (jenis) => (pembangunan(jenis) ? 'orange-9' : 'teal-9')
const tampilkanError = () => $q.notify({ type: 'negative', message: store.error, position: 'top' })
const getLaporan = async () => {
  try {
    await store.getLaporan({ reset: true })
  } catch {
    tampilkanError()
  }
}
const ubahTanggalDari = async (value) => {
  if (!value || value === store.params.tanggal_dari) return
  store.params.tanggal_dari = value
  await getLaporan()
}
const ubahTanggalSampai = async (value) => {
  if (!value || value === store.params.tanggal_sampai) return
  store.params.tanggal_sampai = value
  await getLaporan()
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
onMounted(getLaporan)
</script>

<style scoped>
.header {
  padding: 17px 16px;
  color: white;
  background: linear-gradient(135deg, #083a98 0%, #0d5ac7 55%, #1678ff 100%);
}
.content {
  max-width: 900px;
  margin: 0 auto;
}
.filter-card,
.pengeluaran-card,
.empty-card,
.ringkasan-card {
  border-radius: 16px;
}
.ringkasan-card {
  background: linear-gradient(135deg, #e65100, #fb8c00);
}
.pengeluaran-card {
  border-color: #e3edf9;
}
</style>
