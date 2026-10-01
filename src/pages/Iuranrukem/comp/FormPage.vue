<template>
  <q-card flat bordered class="pembayaran-card">
    <q-card-section class="q-pb-sm">
      <div class="row items-center no-wrap">
        <q-avatar color="primary" text-color="white" icon="payments" size="46px" />

        <div class="col q-ml-md">
          <div class="text-subtitle1 text-weight-bold text-primary">
            {{ formTitle }}
          </div>
          <div class="text-caption text-grey-7">
            Iuran {{ namaBulan }} {{ tahun }}
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-select
        v-if="mode === 'tambah'"
        :model-value="data?.id ?? null"
        :options="wargaOptions"
        :loading="loadingWarga"
        option-label="nama"
        option-value="id"
        emit-value
        map-options
        use-input
        input-debounce="400"
        outlined
        dense
        label="Pilih warga"
        class="q-mb-lg"
        @filter="filterWarga"
        @update:model-value="pilihWarga"
      >
        <template #prepend>
          <q-icon name="person_search" color="primary" />
        </template>

        <template #no-option>
          <q-item>
            <q-item-section class="text-grey-7">Warga tidak ditemukan</q-item-section>
          </q-item>
        </template>
      </q-select>

      <div v-if="data" class="warga-info q-mb-lg">
        <q-icon name="person" color="primary" size="22px" />

        <div class="col q-ml-sm">
          <div class="text-caption text-grey-7">Warga yang membayar</div>
          <div class="text-weight-bold">{{ data?.nama || '-' }}</div>
          <div v-if="data?.nik" class="text-caption text-grey-7">NIK: {{ data.nik }}</div>
        </div>
      </div>

      <q-banner v-else rounded class="bg-blue-1 text-primary q-mb-lg">
        Pilih warga terlebih dahulu untuk mengisi pembayaran iuran.
      </q-banner>

      <q-form @submit="submitForm">
        <q-input
          v-model="form.nominal"
          inputmode="numeric"
          outlined
          dense
          label="Nominal pembayaran"
          prefix="Rp"
          :disable="loading"
          @update:model-value="formatNominal"
        >
          <template #prepend>
            <q-icon name="account_balance_wallet" color="primary" />
          </template>

          <template #append>
            <q-btn
              v-if="form.nominal"
              flat
              round
              dense
              icon="delete_outline"
              color="grey-7"
              :disable="loading"
              @click.stop="hapusNominal"
            >
              <q-tooltip>Hapus nominal</q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <q-input
          v-model.trim="form.keterangan"
          class="q-mt-md"
          type="textarea"
          outlined
          dense
          autogrow
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
              :label="mode === 'update' ? 'Update Iuran' : 'Simpan Pembayaran'"
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

  tahun: {
    type: Number,
    required: true,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  mode: {
    type: String,
    default: 'bayar',
  },

  wargaOptions: {
    type: Array,
    default: () => [],
  },

  loadingWarga: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'cancel', 'select-warga', 'search-warga'])

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
  nominal: '',
  keterangan: '',
})

const namaBulan = computed(() => bulanOptions[props.bulan - 1] || '')

const formTitle = computed(() => {
  if (props.mode === 'tambah') {
    return 'Tambah Iuran'
  }

  return props.mode === 'update' ? 'Update Iuran' : 'Konfirmasi Pembayaran'
})

const resetForm = (warga) => {
  form.nominal = formatNominalApi(warga?.nominaliuran ?? warga?.nominal ?? 0)
  form.keterangan = warga?.keterangan || ''
}

const formatNominalApi = (value) => {
  const nominal = Number(value ?? 0)

  return Number.isFinite(nominal) && nominal > 0
    ? new Intl.NumberFormat('id-ID').format(nominal)
    : ''
}

const formatRupiah = (value) => {
  const angka = String(value ?? '').replace(/\D/g, '')

  return angka ? new Intl.NumberFormat('id-ID').format(Number(angka)) : ''
}

const formatNominal = (value) => {
  form.nominal = formatRupiah(value)
}

const hapusNominal = () => {
  form.nominal = ''
}

const pilihWarga = (id) => {
  const warga = props.wargaOptions.find((item) => Number(item.id) === Number(id))

  emit('select-warga', warga || null)
}

const filterWarga = (keyword, update) => {
  update(() => {
    emit('search-warga', keyword)
  })
}

watch(
  () => props.data,
  (warga) => resetForm(warga),
  { immediate: true },
)

const submitForm = () => {
  emit('save', {
    id: props.data?.iuran_id ?? null,
    nominal: Number(String(form.nominal).replace(/\./g, '')),
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

</style>
