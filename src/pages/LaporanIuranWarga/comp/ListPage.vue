<template>
  <div>
    <q-card flat bordered class="filter-card q-mb-md">
      <q-card-section>
        <div class="text-weight-bold text-subtitle1">Tahun Laporan</div>
        <div class="text-caption text-grey-7 q-mb-md">Pilih tahun rekap iuran warga</div>

        <q-select
          :model-value="tahun"
          :options="tahunOptions"
          outlined
          dense
          label="Tahun"
          @update:model-value="ubahTahun"
        >
          <template #prepend>
            <q-icon name="event" color="primary" />
          </template>
        </q-select>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-5">
        <q-card flat class="ringkasan-card">
          <q-card-section class="q-pa-md">
            <q-icon name="groups" color="primary" size="24px" />
            <div class="text-caption text-grey-7 q-mt-sm">Warga</div>
            <div class="text-h6 text-weight-bold text-primary">{{ ringkasan.total_warga }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-7">
        <q-card flat class="ringkasan-card">
          <q-card-section class="q-pa-md">
            <q-icon name="account_balance_wallet" color="positive" size="24px" />
            <div class="text-caption text-grey-7 q-mt-sm">Total Iuran Terkumpul</div>
            <div class="text-subtitle1 text-weight-bold text-positive">{{ rupiah(ringkasan.total_iuran) }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="q-mb-sm q-px-xs">
      <div class="text-weight-bold">Rekap Iuran Warga Tahun {{ tahun }}</div>
      <div class="text-caption text-grey-7">Tekan kartu warga untuk melihat rincian pembayaran</div>
    </div>

    <q-card v-if="data.length === 0" flat bordered class="empty-card">
      <q-card-section class="text-center q-py-xl">
        <q-icon name="groups" color="grey-5" size="45px" />
        <div class="text-weight-bold q-mt-md">Data warga tidak ditemukan</div>
      </q-card-section>
    </q-card>

    <q-infinite-scroll v-else :offset="200" @load="onLoad">
      <q-card
        v-for="item in data"
        :key="item.id"
        flat
        bordered
        class="warga-card q-mb-sm cursor-pointer"
        @click="emit('lihat-detail', item)"
      >
        <q-card-section>
          <div class="row items-center no-wrap">
            <q-avatar color="blue-1" text-color="primary" icon="person" size="46px" />

            <div class="col q-ml-sm">
              <div class="text-weight-bold">{{ item.nama }}</div>
              <div class="text-caption text-grey-7">{{ item.total_transaksi }} transaksi pembayaran</div>
            </div>

            <q-icon name="chevron_right" color="grey-6" size="24px" />
          </div>

          <div class="row items-end justify-between q-mt-md">
            <div>
              <div class="text-caption text-grey-7">Iuran terkumpul</div>
              <div class="text-subtitle1 text-weight-bold text-primary">{{ rupiah(item.total_iuran) }}</div>
            </div>

            <div class="text-right">
              <div class="text-caption text-grey-7">Target setahun</div>
              <div class="text-caption text-weight-bold">{{ rupiah(ringkasan.target_iuran) }}</div>
            </div>
          </div>

          <q-linear-progress
            rounded
            size="10px"
            :value="progres(item)"
            :color="progres(item) >= 1 ? 'positive' : 'primary'"
            track-color="blue-1"
            class="q-mt-sm"
          />

          <div class="row justify-between q-mt-xs">
            <div class="text-caption text-grey-7">Progress iuran tahunan</div>
            <div class="text-caption text-weight-bold" :class="progres(item) >= 1 ? 'text-positive' : 'text-primary'">
              {{ persentase(item) }}%
            </div>
          </div>

          <q-btn
            flat
            dense
            no-caps
            color="primary"
            icon="visibility"
            label="Lihat Detail"
            class="q-mt-sm"
            @click.stop="emit('lihat-detail', item)"
          />
        </q-card-section>
      </q-card>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="35px" />
        </div>
      </template>
    </q-infinite-scroll>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  ringkasan: {
    type: Object,
    default: () => ({ total_warga: 0, total_iuran: 0, target_iuran: 0 }),
  },
  tahun: {
    type: Number,
    required: true,
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

const emit = defineEmits(['filter', 'lihat-detail', 'load-more'])

const tahunOptions = Array.from({ length: 7 }, (_, index) => new Date().getFullYear() - 3 + index)

const ubahTahun = (tahun) => {
  emit('filter', { tahun })
}

const progres = (item) => {
  const target = Number(props.ringkasan.target_iuran || 0)

  if (target <= 0) {
    return 0
  }

  return Math.min(Number(item.total_iuran || 0) / target, 1)
}

const persentase = (item) => Math.round(progres(item) * 100)

const rupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(value || 0))
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
.filter-card,
.ringkasan-card,
.warga-card,
.empty-card {
  border-radius: 16px;
}

.ringkasan-card {
  height: 100%;
  background: white;
}

.warga-card {
  border-color: #e3edf9;
  background: linear-gradient(135deg, #ffffff 0%, #f7fbff 100%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.warga-card:hover {
  box-shadow: 0 8px 20px rgba(13, 90, 199, 0.12);
  transform: translateY(-2px);
}
</style>
