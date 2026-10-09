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
          <div class="text-h6 text-weight-bold">Laporan Kas Umum Masjid</div>
          <div class="text-caption" style="opacity: 0.8">Arus kas per sumber dana</div>
        </div>
        <q-icon name="account_balance" size="30px" />
      </div>
    </div>

    <div class="q-pa-md content">
      <q-card flat bordered class="filter-card q-mb-md">
        <q-card-section>
          <div class="text-weight-bold text-subtitle1">Periode laporan</div>
          <div class="text-caption text-grey-7 q-mb-md">
            Pemasukan dan pengeluaran dipisahkan berdasarkan sumber dana.
          </div>
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
          </div>
        </q-card-section>
      </q-card>

      <div v-if="store.loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="42px" />
      </div>
      <template v-else>
        <q-card flat class="total-card q-mb-md text-white">
          <q-card-section>
            <div class="text-caption" style="opacity: 0.85">Saldo akhir seluruh dana masjid</div>
            <div class="text-h5 text-weight-bold q-mt-xs">
              {{ rupiah(store.ringkasan.saldo_akhir) }}
            </div>
            <div class="row q-mt-sm text-caption">
              <div class="col">Saldo awal: {{ rupiah(store.ringkasan.saldo_awal) }}</div>
              <div class="col text-right">
                Masuk {{ rupiah(store.ringkasan.total_pemasukan) }} · Keluar
                {{ rupiah(store.ringkasan.total_pengeluaran) }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-tabs
          v-model="jenisAktif"
          dense
          align="justify"
          active-color="primary"
          indicator-color="primary"
          class="bg-white rounded-borders q-mb-sm"
        >
          <q-tab name="KOTAK_AMAL" icon="savings" label="Kotak Amal" />
          <q-tab name="PEMBANGUNAN_MASJID" icon="construction" label="Pembangunan" />
        </q-tabs>

        <q-tab-panels v-model="jenisAktif" animated class="bg-transparent">
          <q-tab-panel v-for="jenis in jenisDana" :key="jenis" :name="jenis" class="q-pa-none">
            <q-card flat bordered class="ringkasan-jenis q-mb-md" :class="kelasJenis(jenis)">
              <q-card-section>
                <div class="row items-center no-wrap">
                  <q-avatar
                    :icon="iconJenis(jenis)"
                    :color="warnaJenis(jenis)"
                    :text-color="warnaTeksJenis(jenis)"
                  />
                  <div class="q-ml-sm text-weight-bold">{{ dataJenis(jenis).label }}</div>
                </div>
                <div class="row q-col-gutter-sm q-mt-sm">
                  <div class="col-3">
                    <div class="text-caption text-grey-7">Saldo awal</div>
                    <div class="text-weight-bold text-primary">
                      {{ rupiah(dataJenis(jenis).saldo_awal) }}
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="text-caption text-grey-7">Pemasukan</div>
                    <div class="text-weight-bold text-positive">
                      {{ rupiah(dataJenis(jenis).total_pemasukan) }}
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="text-caption text-grey-7">Pengeluaran</div>
                    <div class="text-weight-bold text-negative">
                      {{ rupiah(dataJenis(jenis).total_pengeluaran) }}
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="text-caption text-grey-7">Saldo akhir</div>
                    <div class="text-weight-bold text-primary">
                      {{ rupiah(dataJenis(jenis).saldo_akhir) }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <div class="text-weight-bold q-mb-sm">Buku Kas {{ dataJenis(jenis).label }}</div>
            <q-card v-if="dataJenis(jenis).buku_kas.length === 0" flat bordered class="empty-card"
              ><q-card-section class="text-center q-py-xl"
                ><q-icon name="receipt_long" color="grey-5" size="44px" />
                <div class="text-weight-bold q-mt-sm">Belum ada mutasi</div>
                <div class="text-caption text-grey-7">
                  Tidak ada transaksi pada periode ini.
                </div></q-card-section
              ></q-card
            >
            <div v-else class="column q-gutter-sm">
              <q-card
                v-for="item in dataJenis(jenis).buku_kas"
                :key="item.id"
                flat
                bordered
                class="mutasi-card"
              >
                <q-card-section class="row items-center no-wrap">
                  <q-avatar
                    :icon="item.debet > 0 ? 'south_west' : 'north_east'"
                    :color="item.debet > 0 ? 'green-1' : 'red-1'"
                    :text-color="item.debet > 0 ? 'positive' : 'negative'"
                  />
                  <div class="col q-ml-sm">
                    <div class="text-weight-bold">{{ item.keterangan }}</div>
                    <div class="text-caption text-grey-7">
                      {{ formatTanggal(item.tanggal)
                      }}<span v-if="item.detail"> · {{ item.detail }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div
                      :class="item.debet > 0 ? 'text-positive' : 'text-negative'"
                      class="text-weight-bold"
                    >
                      {{ item.debet > 0 ? '+' : '-' }} {{ rupiah(item.debet || item.kredit) }}
                    </div>
                    <div class="text-caption text-primary">Saldo {{ rupiah(item.saldo) }}</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useLaporanKasUmumMasjidStore } from '@/stores/laporankasummasjid'

const $q = useQuasar()
const router = useRouter()
const store = useLaporanKasUmumMasjidStore()
const jenisAktif = ref('KOTAK_AMAL')
const jenisDana = ['KOTAK_AMAL', 'PEMBANGUNAN_MASJID']
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
const iconJenis = (jenis) => (pembangunan(jenis) ? 'construction' : 'savings')
const warnaJenis = (jenis) => (pembangunan(jenis) ? 'orange-1' : 'teal-1')
const warnaTeksJenis = (jenis) => (pembangunan(jenis) ? 'orange-9' : 'teal-9')
const kelasJenis = (jenis) => (pembangunan(jenis) ? 'pembangunan-card' : 'amal-card')
const dataJenis = (jenis) =>
  store.data?.[jenis] ?? {
    label: '',
    saldo_awal: 0,
    total_pemasukan: 0,
    total_pengeluaran: 0,
    saldo_akhir: 0,
    buku_kas: [],
  }
const tampilkanError = () => $q.notify({ type: 'negative', message: store.error, position: 'top' })
const getLaporan = async () => {
  try {
    await store.getLaporan()
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
.total-card,
.ringkasan-jenis,
.mutasi-card,
.empty-card {
  border-radius: 16px;
}
.total-card {
  background: linear-gradient(135deg, #4527a0, #7b1fa2);
}
.amal-card {
  border-color: #b2dfdb;
}
.pembangunan-card {
  border-color: #ffe0b2;
}
.mutasi-card {
  border-color: #e3edf9;
}
</style>
