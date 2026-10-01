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
          <div class="text-h6 text-weight-bold">Pengeluaran</div>
          <div class="text-caption" style="opacity: 0.8">Catatan pengeluaran kas</div>
        </div>
        <q-icon name="receipt_long" size="30px" />
      </div>
    </div>

    <div class="q-pa-md content">
      <q-card flat bordered class="filter-card q-mb-md">
        <q-card-section>
          <div class="text-weight-bold text-subtitle1">Filter Pengeluaran</div>
          <div class="text-caption text-grey-7 q-mb-md">Pilih periode pengeluaran RUKEM</div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="tanggalDari"
                type="date"
                dense
                outlined
                label="Tanggal Dari"
                :max="tanggalSampai"
                @update:model-value="getPengeluaran"
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
                @update:model-value="getPengeluaran"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="42px" />
      </div>
      <q-card v-else-if="items.length === 0" flat bordered class="empty-card"
        ><q-card-section class="text-center q-py-xl"
          ><q-icon name="receipt_long" color="grey-5" size="44px" />
          <div class="text-weight-bold q-mt-sm">Belum ada pengeluaran</div></q-card-section
        ></q-card
      >
      <div v-else class="column q-gutter-sm">
        <q-card v-for="item in items" :key="item.id" flat bordered class="pengeluaran-card">
          <q-card-section class="row items-center no-wrap">
            <q-avatar color="blue-1" text-color="primary" icon="remove_circle" />
            <div class="col q-ml-sm">
              <div class="text-weight-bold">{{ item.kegiatan || 'Pengeluaran RUKEM' }}</div>
              <div class="text-caption text-grey-7">
                {{ item.keterangan || 'Pengeluaran kas' }} ·
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
              <div class="row justify-between q-pt-md text-weight-bold">
                <span>Total pengeluaran</span>
                <span class="text-primary">{{ rupiah(item.total_nominal) }}</span>
              </div>
            </q-card-section>
          </q-expansion-item>
        </q-card>
      </div>
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]"
      ><q-btn fab color="primary" icon="add" @click="dialog = true"
        ><q-tooltip>Tambah pengeluaran</q-tooltip></q-btn
      ></q-page-sticky
    >

    <q-dialog v-model="dialog" persistent
      ><q-card class="form-card"
        ><q-card-section><div class="text-h6">Tambah Pengeluaran</div></q-card-section
        ><q-card-section class="q-pt-none form-content"
          ><q-select
            v-model="form.jenis_transaksi"
            dense
            outlined
            emit-value
            map-options
            :options="jenisTransaksiOptions"
            label="Jenis transaksi" />
          <q-input
            v-model.trim="form.kegiatan"
            dense
            outlined
            label="Belanja untuk kegiatan apa?" />

          <div
            v-for="(rinci, index) in form.rincian"
            :key="index"
            class="rincian-form q-mt-md q-pa-sm"
          >
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-weight-medium">Rincian {{ index + 1 }}</div>
              <q-btn
                v-if="form.rincian.length > 1"
                flat
                round
                dense
                icon="close"
                color="grey-7"
                @click="hapusRincian(index)"
              >
                <q-tooltip>Hapus rincian</q-tooltip>
              </q-btn>
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-7">
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
              <div class="col-5">
                <q-input
                  v-model.number="rinci.jumlah"
                  dense
                  outlined
                  type="number"
                  min="1"
                  label="Jumlah"
                />
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
            @click="tambahRincian" /></q-card-section
        ><q-card-actions align="right"
          ><q-btn flat no-caps label="Batal" v-close-popup /><q-btn
            unelevated
            no-caps
            color="primary"
            label="Simpan"
            :loading="saving"
            @click="simpan" /></q-card-actions></q-card
    ></q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
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
const items = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const rincianBaru = () => ({ harga_satuan: '', jumlah: 1, keterangan: '' })
const jenisTransaksiOptions = [
  { label: 'RUKEM', value: 'RUKEM' },
  { label: 'Kotak Masjid', value: 'KOTAK_MASJID' },
  { label: 'Sumbangan Warga', value: 'SUMBANGAN_WARGA' },
]
const form = reactive({ jenis_transaksi: 'RUKEM', kegiatan: '', rincian: [rincianBaru()] })

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
const formatNominal = (index, nilai) => {
  form.rincian[index].harga_satuan = String(nilai || '')
    .replace(/\D/g, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
const tambahRincian = () => form.rincian.push(rincianBaru())
const hapusRincian = (index) => form.rincian.splice(index, 1)
const resetForm = () => {
  form.jenis_transaksi = 'RUKEM'
  form.kegiatan = ''
  form.rincian.splice(0, form.rincian.length, rincianBaru())
}

const getPengeluaran = async () => {
  loading.value = true
  try {
    const response = await api.get('/v1/pengeluaran/getlist', {
      params: {
        tanggal_dari: tanggalDari.value,
        tanggal_sampai: tanggalSampai.value,
      },
    })
    items.value = response.data?.data?.data ?? []
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Gagal mengambil pengeluaran',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const simpan = async () => {
  const rincianTidakValid = form.rincian.some(
    (rinci) => !rinci.harga_satuan || !rinci.jumlah || Number(rinci.jumlah) < 1,
  )

  if (!form.kegiatan || rincianTidakValid) {
    $q.notify({
      type: 'warning',
      message: 'Lengkapi kegiatan, harga satuan, dan jumlah pada setiap rincian.',
      position: 'top',
    })
    return
  }

  saving.value = true
  try {
    const response = await api.post('/v1/pengeluaran/simpan', {
      jenis_transaksi: form.jenis_transaksi,
      kegiatan: form.kegiatan,
      rincian: form.rincian.map((rinci) => ({
        harga_satuan: Number(rinci.harga_satuan.replace(/\./g, '')),
        jumlah: Number(rinci.jumlah),
        keterangan: rinci.keterangan || null,
      })),
    })
    $q.notify({
      type: 'positive',
      message: response.data?.message || 'Pengeluaran berhasil disimpan',
      position: 'top',
    })
    dialog.value = false
    resetForm()
    await getPengeluaran()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Gagal menyimpan pengeluaran',
      position: 'top',
    })
  } finally {
    saving.value = false
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
