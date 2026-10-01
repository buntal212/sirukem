<template>
  <q-page class="bg-grey-2">
    <div class="header">
      <div class="row items-center no-wrap content">
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
          <div class="text-h6 text-weight-bold">Laporan Kas Umum</div>
          <div class="text-caption" style="opacity: 0.8">Arus kas RUKEM</div>
        </div>
        <q-icon name="account_balance" size="30px" />
      </div>
    </div>

    <div class="q-pa-md content">
      <q-card flat bordered class="filter-card q-mb-md">
        <q-card-section>
          <div class="text-weight-bold text-subtitle1">Periode laporan</div>
          <div class="text-caption text-grey-7 q-mb-md">Acuan pemasukan memakai tanggal bayar.</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
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
            <div class="col-12 col-sm-6">
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
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-12 col-sm-6">
            <q-card flat class="summary-card bg-blue-1 text-primary">
              <q-card-section>
                <div class="text-caption">Saldo awal RUKEM</div>
                <div class="text-h6 text-weight-bold q-mt-xs">
                  {{ rupiah(ringkasan.saldo_awal_rukem) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6">
            <q-card flat class="summary-card bg-green-1 text-positive">
              <q-card-section>
                <div class="text-caption">Pemasukan iuran</div>
                <div class="text-h6 text-weight-bold q-mt-xs">
                  + {{ rupiah(ringkasan.pemasukan_iuran) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6">
            <q-card flat class="summary-card bg-blue-1 text-primary">
              <q-card-section>
                <div class="text-caption">Pengeluaran RUKEM</div>
                <div class="text-h6 text-weight-bold q-mt-xs">
                  - {{ rupiah(ringkasan.pengeluaran_rukem) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6">
            <q-card flat class="summary-card saldo-akhir text-white">
              <q-card-section>
                <div class="text-caption" style="opacity: 0.85">Saldo akhir RUKEM</div>
                <div class="text-h6 text-weight-bold q-mt-xs">
                  {{ rupiah(ringkasan.saldo_akhir_rukem) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="text-weight-bold text-subtitle1 q-mb-sm">Buku kas RUKEM</div>
        <q-markup-table flat bordered separator="horizontal" class="kas-table">
          <thead>
            <tr>
              <th class="text-left">Keterangan</th>
              <th class="text-right">Debet</th>
              <th class="text-right">Kredit</th>
              <th class="text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in bukuKas"
              :key="item.id"
              :class="{ 'saldo-awal-row': item.id === 'saldo-awal' }"
            >
              <td data-label="Keterangan">
                <div class="text-weight-medium">{{ item.keterangan }}</div>
                <div class="text-caption text-grey-7">
                  {{ formatTanggal(item.tanggal) }}
                  <span v-if="item.detail">- {{ item.detail }}</span>
                </div>
              </td>
              <td data-label="Debet" class="text-right text-positive">
                <span class="kas-value">{{ item.debet ? rupiah(item.debet) : '-' }}</span>
              </td>
              <td data-label="Kredit" class="text-right text-primary">
                <span class="kas-value">{{ item.kredit ? rupiah(item.kredit) : '-' }}</span>
              </td>
              <td data-label="Saldo" class="text-right text-weight-bold text-primary">
                <span class="kas-value">{{ rupiah(item.saldo) }}</span>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
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
const tanggalDari = ref(
  `${sekarang.getFullYear()}-${String(sekarang.getMonth() + 1).padStart(2, '0')}-01`,
)
const tanggalSampai = ref(formatInput(sekarang))
const loading = ref(false)
const bukuKas = ref([])
const ringkasan = ref({
  saldo_awal_rukem: 0,
  pemasukan_iuran: 0,
  pengeluaran_rukem: 0,
  saldo_akhir_rukem: 0,
  pengeluaran_per_jenis: {},
})

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
    const response = await api.get('/v1/laporan/kas-umum', {
      params: {
        tanggal_dari: tanggalDari.value,
        tanggal_sampai: tanggalSampai.value,
      },
    })
    bukuKas.value = response.data?.buku_kas ?? []
    ringkasan.value = response.data?.ringkasan ?? ringkasan.value
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Gagal mengambil laporan kas umum',
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
.summary-card {
  border-radius: 16px;
}
.saldo-akhir {
  background: linear-gradient(135deg, #083a98, #1678ff);
}
.kas-table {
  border-radius: 16px;
  overflow: hidden;
}
.saldo-awal-row {
  background: #e3f2fd;
}

@media (max-width: 599px) {
  .kas-table :deep(thead) {
    display: none;
  }

  .kas-table :deep(tr) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding: 12px;
    border-bottom: 1px solid #e3edf9;
  }

  .kas-table :deep(tbody tr:last-child) {
    border-bottom: 0;
  }

  .kas-table :deep(td) {
    display: block;
    padding: 0;
    border: 0;
    text-align: left !important;
    min-width: 0;
  }

  .kas-table :deep(td:first-child) {
    grid-column: 1 / -1;
  }

  .kas-table :deep(td:not(:first-child)::before) {
    display: block;
    margin-bottom: 0;
    color: #6b7280 !important;
    font-size: 11px;
    font-weight: 500;
    content: attr(data-label);
  }

  .kas-table :deep(td:not(:first-child)) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 34px;
    padding: 6px 0 !important;
    overflow: hidden;
    border-top: 1px solid #edf1f5;
    font-size: 11px;
    line-height: 1.2;
  }

  .kas-table :deep(td:last-child) {
    grid-column: 1 / -1;
    padding: 8px !important;
    border: 0;
    border-radius: 7px;
    background: #eaf4ff;
  }

  .kas-table :deep(.kas-value) {
    display: block;
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
