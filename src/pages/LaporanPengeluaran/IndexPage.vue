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
          <div class="text-h6 text-weight-bold">Laporan Pengeluaran</div>
          <div class="text-caption" style="opacity: 0.8">Rekap pengeluaran kas RUKEM</div>
        </div>
        <q-icon name="summarize" size="30px" />
      </div>
    </div>

    <div class="q-pa-md content">
      <q-card flat bordered class="filter-card q-mb-md">
        <q-card-section>
          <div class="text-weight-bold text-subtitle1">Periode laporan</div>
          <div class="text-caption text-grey-7 q-mb-md">Pilih tanggal pengeluaran RUKEM</div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="tanggalDari"
                type="date"
                dense
                outlined
                label="Tanggal Dari"
                :max="tanggalSampai"
                @update:model-value="getLaporan"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="tanggalSampai"
                type="date"
                dense
                outlined
                label="Tanggal Sampai"
                :min="tanggalDari"
                @update:model-value="getLaporan"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="42px" />
      </div>

      <template v-else>
        <q-card flat class="ringkasan-card q-mb-md text-white">
          <q-card-section>
            <div class="text-caption" style="opacity: 0.85">Total pengeluaran</div>
            <div class="text-h5 text-weight-bold q-mt-xs">
              {{ rupiah(ringkasan.total_pengeluaran) }}
            </div>
            <div class="q-mt-sm text-caption">
              {{ ringkasan.total_transaksi }} transaksi dalam periode terpilih
            </div>
          </q-card-section>
        </q-card>

        <q-card v-if="items.length === 0" flat bordered class="empty-card">
          <q-card-section class="text-center q-py-xl">
            <q-icon name="receipt_long" color="grey-5" size="44px" />
            <div class="text-weight-bold q-mt-sm">Belum ada pengeluaran</div>
            <div class="text-caption text-grey-7">Tidak ada data pada periode ini.</div>
          </q-card-section>
        </q-card>

        <div v-else class="column q-gutter-sm">
          <q-card v-for="item in items" :key="item.id" flat bordered class="pengeluaran-card">
            <q-card-section class="row items-center no-wrap">
              <q-avatar color="blue-1" text-color="primary" icon="remove_circle" />
              <div class="col q-ml-sm">
                <div class="text-weight-bold">{{ item.kegiatan || 'Pengeluaran RUKEM' }}</div>
                <div class="text-caption text-grey-7">
                  {{ formatTanggal(item.tanggal_pengeluaran) }}
                </div>
              </div>
              <div class="text-weight-bold text-primary">- {{ rupiah(item.total_nominal) }}</div>
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
                    <q-item-section>
                      <q-item-label>{{ rinci.keterangan || 'Tanpa keterangan' }}</q-item-label>
                      <q-item-label caption>
                        {{ rupiah(rinci.harga_satuan) }} x {{ rinci.jumlah }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side class="text-weight-bold text-primary">
                      {{ rupiah(rinci.nominal) }}
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-expansion-item>
          </q-card>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from '@/boot/axios'

const router = useRouter()
const $q = useQuasar()
const sekarang = new Date()
const formatInput = (tanggal) =>
  `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, '0')}-${String(tanggal.getDate()).padStart(2, '0')}`

const tanggalDari = ref(`${sekarang.getFullYear()}-01-01`)
const tanggalSampai = ref(formatInput(sekarang))
const loading = ref(false)
const items = ref([])
const ringkasan = ref({ total_transaksi: 0, total_pengeluaran: 0 })

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

const getLaporan = async () => {
  loading.value = true
  try {
    const response = await api.get('/v1/laporan/pengeluaran', {
      params: {
        tanggal_dari: tanggalDari.value,
        tanggal_sampai: tanggalSampai.value,
      },
    })
    items.value = response.data?.data?.data ?? []
    ringkasan.value = response.data?.ringkasan ?? ringkasan.value
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Gagal mengambil laporan pengeluaran',
      position: 'top',
    })
  } finally {
    loading.value = false
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
  background: linear-gradient(135deg, #0d5ac7, #1678ff);
}
.pengeluaran-card {
  border-color: #e3edf9;
}
</style>
