<template>
  <div>
    <q-btn flat no-caps icon="arrow_back" label="Kembali ke laporan" color="primary" class="q-mb-sm" @click="emit('back')" />

    <div v-if="loading && !warga" class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="45px" />
    </div>

    <template v-else-if="warga">
      <q-card flat class="summary-card q-mb-md">
        <q-card-section>
          <div class="row items-center no-wrap">
            <q-avatar color="white" text-color="primary" icon="person" size="48px" />

            <div class="col q-ml-sm">
              <div class="text-subtitle1 text-weight-bold">{{ warga.nama }}</div>
              <div class="text-caption" style="opacity: 0.85">Rekap pembayaran tahun {{ tahun }}</div>
            </div>
          </div>

          <div class="row items-end justify-between q-mt-lg">
            <div>
              <div class="text-caption" style="opacity: 0.85">Iuran terkumpul</div>
              <div class="text-h6 text-weight-bold">{{ rupiah(warga.total_iuran) }}</div>
            </div>

            <div class="text-right">
              <div class="text-caption" style="opacity: 0.85">Target setahun</div>
              <div class="text-weight-bold">{{ rupiah(warga.target_iuran) }}</div>
            </div>
          </div>

          <q-linear-progress
            rounded
            size="10px"
            :value="progres"
            :color="progres >= 1 ? 'positive' : 'light-blue-2'"
            track-color="white"
            class="q-mt-sm"
          />
          <div class="text-caption text-right q-mt-xs">{{ persentase }}% tercapai</div>
        </q-card-section>
      </q-card>

      <div class="text-weight-bold q-mb-sm">Rincian Pembayaran</div>

      <q-card v-if="data.length === 0" flat bordered class="empty-card">
        <q-card-section class="text-center q-py-xl">
          <q-icon name="receipt_long" color="grey-5" size="42px" />
          <div class="text-weight-bold q-mt-sm">Belum ada pembayaran iuran</div>
        </q-card-section>
      </q-card>

      <q-infinite-scroll v-else :offset="200" @load="onLoad">
        <q-card v-for="item in data" :key="item.id" flat bordered class="transaksi-card q-mb-sm">
          <q-card-section class="row items-center no-wrap">
            <q-avatar color="green-1" text-color="positive" icon="payments" />

            <div class="col q-ml-sm">
              <div class="text-weight-bold">{{ rupiah(item.nominal) }}</div>
              <div class="text-caption text-grey-7">{{ formatTanggal(item.tanggal_bayar) }}</div>
              <div v-if="item.keterangan" class="text-caption text-grey-7 q-mt-xs">{{ item.keterangan }}</div>
            </div>

            <q-icon name="check_circle" color="positive" size="22px" />
          </q-card-section>
        </q-card>

        <template #loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="35px" />
          </div>
        </template>
      </q-infinite-scroll>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  warga: {
    type: Object,
    default: null,
  },
  data: {
    type: Array,
    default: () => [],
  },
  tahun: {
    type: Number,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingMore: {
    type: Boolean,
    default: false,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['back', 'load-more'])

const progres = computed(() => {
  const target = Number(props.warga?.target_iuran || 0)

  if (target <= 0) {
    return 0
  }

  return Math.min(Number(props.warga?.total_iuran || 0) / target, 1)
})

const persentase = computed(() => Math.round(progres.value * 100))

const rupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(value || 0))
}

const formatTanggal = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const onLoad = (index, done) => {
  if (!props.hasMore) {
    done(true)
    return
  }

  emit('load-more', done)
}
</script>

<style scoped>
.summary-card {
  color: white;
  border-radius: 18px;
  background: linear-gradient(135deg, #0d5ac7 0%, #2185e8 100%);
}

.transaksi-card,
.empty-card {
  border-radius: 14px;
}
</style>
