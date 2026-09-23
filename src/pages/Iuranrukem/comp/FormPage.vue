<template>
  <q-card flat bordered class="pembayaran-card">
    <q-card-section class="q-pb-sm">
      <div class="row items-center no-wrap">
        <q-avatar color="primary" text-color="white" icon="payments" size="46px" />

        <div class="col q-ml-md">
          <div class="text-subtitle1 text-weight-bold text-primary">Konfirmasi Pembayaran</div>
          <div class="text-caption text-grey-7">
            Iuran Minggu {{ minggu }} {{ namaBulan }} {{ tahun }}
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="warga-info q-mb-lg">
        <q-icon name="person" color="primary" size="22px" />

        <div class="col q-ml-sm">
          <div class="text-caption text-grey-7">Warga yang membayar</div>
          <div class="text-weight-bold">{{ data?.nama || '-' }}</div>
          <div v-if="data?.nik" class="text-caption text-grey-7">NIK: {{ data.nik }}</div>
        </div>
      </div>

      <div class="periode-info q-mb-lg">
        <q-icon name="date_range" color="primary" size="22px" />

        <div class="col q-ml-sm">
          <div class="text-caption text-grey-7">Periode pembayaran iuran</div>
          <div class="text-weight-bold">Minggu ke-{{ minggu }} · {{ namaBulan }} {{ tahun }}</div>
        </div>
      </div>

      <q-form @submit="submitForm">
        <q-input
          v-model.number="form.nominal"
          type="number"
          outlined
          dense
          label="Nominal pembayaran"
          prefix="Rp"
          min="0"
          step="1"
          :disable="loading"
          :rules="[(value) => Number(value) > 0 || 'Nominal pembayaran harus lebih dari Rp0']"
        >
          <template #prepend>
            <q-icon name="account_balance_wallet" color="primary" />
          </template>
        </q-input>

        <q-input
          v-model="form.tanggal_bayar"
          class="q-mt-md"
          type="date"
          outlined
          dense
          label="Tanggal pembayaran"
          :disable="loading"
          :rules="[(value) => !!value || 'Tanggal pembayaran wajib diisi']"
        >
          <template #prepend>
            <q-icon name="event" color="primary" />
          </template>
        </q-input>

        <q-input
          v-model.trim="form.keterangan"
          class="q-mt-md"
          type="textarea"
          outlined
          dense
          autogrow
          maxlength="500"
          label="Keterangan"
          placeholder="Contoh: Dibayar tunai"
          :disable="loading"
        >
          <template #prepend>
            <q-icon name="notes" color="primary" />
          </template>
        </q-input>

        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col-5">
            <q-btn
              outline
              color="grey-7"
              icon="close"
              label="Batal"
              class="full-width"
              no-caps
              :disable="loading"
              @click="emit('cancel')"
            />
          </div>

          <div class="col-7">
            <q-btn
              unelevated
              color="primary"
              icon="check_circle"
              label="Simpan Pembayaran"
              class="full-width"
              no-caps
              type="submit"
              :loading="loading"
            />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },

  bulan: {
    type: Number,
    required: true,
  },

  minggu: {
    type: Number,
    required: true,
  },

  tahun: {
    type: Number,
    required: true,
  },

  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'cancel'])

const bulanOptions = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const form = reactive({
  nominal: 0,
  tanggal_bayar: '',
  keterangan: '',
})

const namaBulan = computed(() => bulanOptions[props.bulan - 1] || '')

const tanggalHariIni = () => {
  const sekarang = new Date()
  const offset = sekarang.getTimezoneOffset() * 60_000

  return new Date(sekarang.getTime() - offset).toISOString().slice(0, 10)
}

const resetForm = (warga) => {
  form.nominal = Number(warga?.nominaliuran ?? warga?.nominal ?? 0)
  form.tanggal_bayar = tanggalHariIni()
  form.keterangan = ''
}

watch(
  () => props.data,
  (warga) => resetForm(warga),
  { immediate: true },
)

const submitForm = () => {
  emit('save', {
    nominal: Number(form.nominal),
    tanggal_bayar: form.tanggal_bayar,
    keterangan: form.keterangan || null,
  })
}
</script>

<style scoped>
.pembayaran-card {
  max-width: 620px;
  margin: 0 auto;
  border-radius: 16px;
}

.warga-info {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #dce9fb;
  border-radius: 12px;
  background: #f5f9ff;
}

.periode-info {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #dcefe2;
  border-radius: 12px;
  background: #f4fbf6;
}
</style>
