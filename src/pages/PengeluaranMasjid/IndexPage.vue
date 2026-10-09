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
          <div class="text-h6 text-weight-bold">Pengeluaran Masjid</div>
          <div class="text-caption" style="opacity: 0.8">Catatan pengeluaran dana masjid</div>
        </div>
        <q-icon name="mosque" size="30px" />
      </div>
    </div>

    <div class="q-pa-md content">
      <q-card flat bordered class="filter-card q-mb-md">
        <q-card-section>
          <div class="text-weight-bold text-subtitle1">Filter Pengeluaran Masjid</div>
          <div class="text-caption text-grey-7 q-mb-md">Pilih periode pengeluaran masjid</div>
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

      <div v-if="store.loading && store.items.length === 0" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="42px" />
      </div>
      <q-card v-else-if="store.items.length === 0" flat bordered class="empty-card">
        <q-card-section class="text-center q-py-xl"
          ><q-icon name="receipt_long" color="grey-5" size="44px" />
          <div class="text-weight-bold q-mt-sm">Belum ada pengeluaran masjid</div></q-card-section
        >
      </q-card>
      <q-infinite-scroll v-else :offset="150" @load="loadMore">
        <div class="column q-gutter-sm">
          <q-card v-for="item in store.items" :key="item.id" flat bordered class="pengeluaran-card">
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
              <q-btn
                v-if="adalahBulanBerjalan(item.tanggal_pengeluaran)"
                flat
                round
                dense
                color="primary"
                icon="edit"
                class="q-ml-xs"
                @click="bukaEditHeader(item)"
                ><q-tooltip>Edit kegiatan</q-tooltip></q-btn
              >
              <q-btn
                v-if="adalahBulanBerjalan(item.tanggal_pengeluaran)"
                flat
                round
                dense
                color="negative"
                icon="delete_outline"
                :loading="store.menghapusHeaderId === item.id"
                :disable="store.menghapusHeaderId !== null"
                @click="hapusHeader(item)"
                ><q-tooltip>Hapus transaksi</q-tooltip></q-btn
              >
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
                      <q-item-label caption
                        >{{ rupiah(rinci.harga_satuan) }} x {{ rinci.jumlah }}
                        {{ rinci.satuan }}</q-item-label
                      >
                    </q-item-section>
                    <q-item-section side class="text-weight-bold text-primary">{{
                      rupiah(rinci.nominal)
                    }}</q-item-section>
                    <q-item-section v-if="adalahBulanBerjalan(item.tanggal_pengeluaran)" side>
                      <q-btn
                        flat
                        round
                        dense
                        color="negative"
                        icon="delete_outline"
                        :loading="store.menghapusRincianId === rinci.id"
                        :disable="store.menghapusRincianId !== null"
                        @click="hapusRincian(item, rinci)"
                        ><q-tooltip>Hapus rincian</q-tooltip></q-btn
                      >
                    </q-item-section>
                  </q-item>
                </q-list>
                <div class="row justify-between q-pt-md text-weight-bold">
                  <span>Total pengeluaran</span
                  ><span class="text-primary">{{ rupiah(item.total_nominal) }}</span>
                </div>
              </q-card-section>
            </q-expansion-item>
          </q-card>
        </div>
        <template #loading
          ><div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" /></div
        ></template>
      </q-infinite-scroll>
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]"
      ><q-btn fab color="primary" icon="add" @click="dialog = true"
        ><q-tooltip>Tambah pengeluaran masjid</q-tooltip></q-btn
      ></q-page-sticky
    >

    <q-dialog v-model="dialog" persistent>
      <q-card class="form-card">
        <q-card-section><div class="text-h6">Tambah Pengeluaran Masjid</div></q-card-section>
        <q-card-section class="q-pt-none form-content">
          <q-select
            v-model="store.form.jenis_sumber_dana"
            dense
            outlined
            emit-value
            map-options
            :options="sumberDanaOptions"
            label="Jenis sumber dana"
          />
          <q-input
            v-model.trim="store.form.kegiatan"
            dense
            outlined
            label="Belanja untuk kegiatan apa?"
            class="q-mt-md"
          />
          <div
            v-for="(rinci, index) in store.form.rincian"
            :key="index"
            class="rincian-form q-mt-md q-pa-sm"
          >
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-weight-medium">Rincian {{ index + 1 }}</div>
              <q-btn
                v-if="store.form.rincian.length > 1"
                flat
                round
                dense
                icon="close"
                color="grey-7"
                @click="store.hapusRincianBaru(index)"
                ><q-tooltip>Hapus rincian</q-tooltip></q-btn
              >
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-5">
                <q-input
                  v-model="rinci.harga_satuan"
                  dense
                  outlined
                  inputmode="numeric"
                  prefix="Rp"
                  label="Harga satuan"
                  @update:model-value="formatNominal(index, $event)"
                />
              </div>
              <div class="col-3">
                <q-input
                  v-model.number="rinci.jumlah"
                  dense
                  outlined
                  type="number"
                  min="1"
                  label="Jumlah"
                />
              </div>
              <div class="col-4">
                <q-input v-model.trim="rinci.satuan" dense outlined label="Satuan" />
              </div>
            </div>
            <q-input
              v-model.trim="rinci.keterangan"
              dense
              outlined
              type="textarea"
              autogrow
              label="Keterangan"
              class="q-mt-sm"
            />
          </div>
          <q-btn
            outline
            no-caps
            color="primary"
            icon="add"
            label="Tambah rincian"
            class="q-mt-md full-width"
            @click="store.tambahRincian"
          />
        </q-card-section>
        <q-card-actions align="right"
          ><q-btn flat no-caps label="Batal" @click="tutupForm" /><q-btn
            unelevated
            no-caps
            color="primary"
            label="Simpan"
            :loading="store.saving"
            @click="simpan"
        /></q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogEditHeader" persistent>
      <q-card class="form-card">
        <q-card-section
          ><div class="text-h6">Edit Kegiatan Pengeluaran</div>
          <div class="text-caption text-grey-7">
            Sumber dana dan nominal tidak dapat diubah.
          </div></q-card-section
        >
        <q-card-section class="q-pt-none"
          ><q-input
            v-model.trim="store.formHeader.kegiatan"
            dense
            outlined
            label="Kegiatan"
            autofocus
        /></q-card-section>
        <q-card-actions align="right"
          ><q-btn flat no-caps label="Batal" v-close-popup /><q-btn
            unelevated
            no-caps
            color="primary"
            label="Simpan perubahan"
            :loading="store.menyimpanHeader"
            @click="simpanHeader"
        /></q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { usePengeluaranMasjidStore } from '@/stores/pengeluaranmasjid'

const $q = useQuasar()
const router = useRouter()
const store = usePengeluaranMasjidStore()
const dialog = ref(false)
const dialogEditHeader = ref(false)
const sumberDanaOptions = [
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
const adalahBulanBerjalan = (tanggal) => {
  const [tahun, bulan] = tanggal.split('-').map(Number)
  const sekarang = new Date()
  return tahun === sekarang.getFullYear() && bulan === sekarang.getMonth() + 1
}
const formatNominal = (index, nilai) => {
  store.form.rincian[index].harga_satuan = String(nilai || '')
    .replace(/\D/g, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
const tampilkanError = () => $q.notify({ type: 'negative', message: store.error, position: 'top' })
const getPengeluaran = async () => {
  try {
    await store.getPengeluaran({ reset: true })
  } catch {
    tampilkanError()
  }
}
const ubahTanggalDari = async (value) => {
  if (!value || value === store.params.tanggal_dari) return
  store.params.tanggal_dari = value
  await getPengeluaran()
}
const ubahTanggalSampai = async (value) => {
  if (!value || value === store.params.tanggal_sampai) return
  store.params.tanggal_sampai = value
  await getPengeluaran()
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
    await getPengeluaran()
  } catch {
    tampilkanError()
  }
}
const bukaEditHeader = (item) => {
  store.formHeader.id = item.id
  store.formHeader.kegiatan = item.kegiatan
  dialogEditHeader.value = true
}
const simpanHeader = async () => {
  try {
    const response = await store.simpanHeader()
    $q.notify({ type: 'positive', message: response?.message, position: 'top' })
    dialogEditHeader.value = false
    await getPengeluaran()
  } catch {
    tampilkanError()
  }
}
const hapusHeader = (item) =>
  konfirmasiHapus(
    'Hapus transaksi?',
    'Transaksi pengeluaran masjid beserta seluruh rinciannya akan dihapus.',
    async () => {
      const response = await store.hapusHeader(item.id)
      $q.notify({ type: 'positive', message: response?.message, position: 'top' })
      await getPengeluaran()
    },
  )
const hapusRincian = (item, rinci) =>
  konfirmasiHapus(
    'Hapus rincian?',
    item.rincis.length === 1
      ? 'Ini adalah rincian terakhir. Transaksi pengeluaran juga akan dihapus.'
      : 'Rincian pengeluaran ini akan dihapus.',
    async () => {
      const response = await store.hapusRincian(rinci.id)
      $q.notify({ type: 'positive', message: response?.message, position: 'top' })
      await getPengeluaran()
    },
  )
const konfirmasiHapus = (title, message, aksi) =>
  $q
    .dialog({
      title,
      message,
      persistent: true,
      ok: { label: 'Hapus', color: 'negative', noCaps: true },
      cancel: { label: 'Batal', flat: true, noCaps: true },
    })
    .onOk(async () => {
      try {
        await aksi()
      } catch {
        tampilkanError()
      }
    })
const loadMore = async (index, done) => {
  try {
    await store.loadMore()
    done(!store.hasMore)
  } catch {
    tampilkanError()
    done()
  }
}
onMounted(getPengeluaran)
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
.empty-card {
  border-radius: 16px;
}
.pengeluaran-card {
  border-color: #e3edf9;
}
.form-card {
  width: 560px;
  max-width: 92vw;
}
.form-content {
  max-height: 62vh;
  overflow-y: auto;
}
.rincian-form {
  border: 1px solid #e3edf9;
  border-radius: 10px;
  background: #f8fbff;
}
</style>
