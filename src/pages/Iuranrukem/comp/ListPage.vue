<template>
  <div>
    <!-- =====================================================
         FILTER PERIODE
    ====================================================== -->
    <q-card flat bordered class="filter-card q-mb-md">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="periode-icon">
            <q-icon name="calendar_month" size="25px" color="primary" />
          </div>

          <div class="q-ml-sm">
            <div class="text-weight-bold text-subtitle1">Periode Iuran</div>

            <div class="text-caption text-grey-7">Pilih rentang tanggal transaksi iuran warga</div>
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <!-- TANGGAL DARI -->
          <div class="col-6">
            <q-input
              :model-value="tanggalDari"
              outlined
              dense
              type="date"
              label="Tanggal Dari"
              :max="tanggalSampai"
              @update:model-value="changeTanggalDari"
            >
              <template #prepend>
                <q-icon name="calendar_month" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- TANGGAL SAMPAI -->
          <div class="col-6">
            <q-input
              :model-value="tanggalSampai"
              outlined
              dense
              type="date"
              label="Tanggal Sampai"
              :min="tanggalDari"
              @update:model-value="changeTanggalSampai"
            >
              <template #prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================
         SEARCH
    ====================================================== -->
    <q-card flat class="search-card q-mb-md">
      <q-card-section class="q-pa-sm">
        <q-input
          v-model="keyword"
          outlined
          dense
          clearable
          debounce="500"
          placeholder="Cari nama atau NIK warga..."
          @update:model-value="search"
        >
          <template #prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <!-- =====================================================
         JUDUL LIST
    ====================================================== -->
    <div class="list-heading row items-center justify-between q-mb-sm q-px-xs">
      <div>
        <div class="text-weight-bold">Transaksi Iuran {{ periodeIuran }}</div>

        <div class="text-caption text-grey-7">Daftar pembayaran iuran warga</div>
      </div>

      <q-btn flat round dense icon="refresh" color="primary" @click="refresh">
        <q-tooltip> Refresh </q-tooltip>
      </q-btn>
    </div>

    <!-- =====================================================
         DATA KOSONG
    ====================================================== -->
    <q-card v-if="data.length === 0" flat bordered class="empty-card">
      <q-card-section class="text-center q-py-xl">
        <div class="empty-icon">
          <q-icon name="account_balance_wallet" size="45px" />
        </div>

        <div class="text-weight-bold q-mt-md">Data iuran tidak ditemukan</div>

        <div class="text-caption text-grey-7 q-mt-xs">
          Belum ada transaksi pembayaran iuran pada periode ini
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================
         LIST
    ====================================================== -->
    <q-infinite-scroll v-else :offset="150" @load="loadMore">
      <div v-for="item in data" :key="item.id" class="q-mb-sm">
        <q-card flat class="warga-card">
          <q-card-section class="q-pa-md">
            <!-- =========================
                 TOP
            ========================== -->
            <div class="row items-start no-wrap">
              <!-- AVATAR -->
              <q-avatar size="48px" color="blue-1" text-color="primary" icon="person" />

              <!-- IDENTITAS -->
              <div class="col q-ml-md">
                <div class="row items-start justify-between no-wrap">
                  <div class="col">
                    <div class="warga-nama">
                      {{ item.nama || '-' }}
                    </div>

                    <div class="warga-nik">
                      NIK :
                      {{ item.nik || '-' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- =========================
                 INFORMASI IURAN
            ========================== -->
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-7">Pembayaran iuran</div>

                <div class="nominal">
                  {{ rupiah(getNominal(item)) }}
                </div>
              </div>

              <div class="text-right">
                <div class="text-caption text-grey-6">Dibayar</div>

                <div class="text-caption text-weight-bold text-positive">
                  {{ formatTanggalBayar(item.tanggal_bayar) }}
                </div>

                <q-btn
                  flat
                  dense
                  no-caps
                  color="primary"
                  icon="edit"
                  label="Update"
                  class="q-mt-xs"
                  @click="$emit('update', item)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- LOADING MORE -->
      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="35px" />
        </div>
      </template>
    </q-infinite-scroll>

    <!-- =====================================================
         TOTAL FOOTER
    ====================================================== -->
    <div v-if="data.length > 0" class="text-center text-caption text-grey-6 q-py-md">
      Menampilkan {{ data.length }} transaksi pembayaran
    </div>

    <!-- TAMBAH IURAN -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="emit('add')">
        <q-tooltip>Tambah Iuran</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// =========================================================
// PROPS
// =========================================================

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },

  loadingMore: {
    type: Boolean,
    default: false,
  },

  hasMore: {
    type: Boolean,
    default: false,
  },

  tanggalDari: {
    type: String,
    required: true,
  },

  tanggalSampai: {
    type: String,
    required: true,
  },
})

// =========================================================
// EMITS
// =========================================================

const emit = defineEmits([
  'add',
  'search',
  'tanggal-dari',
  'tanggal-sampai',
  'update',
  'load-more',
  'refresh',
])

// =========================================================
// STATE
// =========================================================

const keyword = ref('')

// =========================================================
// PERIODE
// =========================================================

const formatTanggal = (value) => {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const periodeIuran = computed(() => {
  return `${formatTanggal(props.tanggalDari)} - ${formatTanggal(props.tanggalSampai)}`
})

// =========================================================
// NOMINAL
// =========================================================

const getNominal = (item) => {
  return item.nominaliuran ?? item.nominal ?? 0
}

// =========================================================
// FORMAT RUPIAH
// =========================================================

const rupiah = (value) => {
  const nominal = Number(value || 0)

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nominal)
}

// =========================================================
// FORMAT TANGGAL
// =========================================================

const formatTanggalBayar = (value) => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

// =========================================================
// SEARCH
// =========================================================

const search = (value) => {
  emit('search', value || '')
}

// =========================================================
// TANGGAL DARI
// =========================================================

const changeTanggalDari = (value) => {
  emit('tanggal-dari', value)
}

// =========================================================
// TANGGAL SAMPAI
// =========================================================

const changeTanggalSampai = (value) => {
  emit('tanggal-sampai', value)
}

// =========================================================
// REFRESH
// =========================================================

const refresh = () => {
  emit('refresh')
}

// =========================================================
// LOAD MORE
// =========================================================

const loadMore = (index, done) => {
  if (!props.hasMore) {
    done(true)
    return
  }

  emit('load-more', done)
}
</script>

<style scoped>
/* =========================================================
   FILTER
========================================================= */

.filter-card {
  border-radius: 16px;
  border: 1px solid #e5edf7;
}

.periode-icon {
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 13px;

  background: #e8f1ff;
}

/* =========================================================
   SEARCH
========================================================= */

.search-card {
  border-radius: 14px;

  background: white;

  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
}

/* =========================================================
   WARGA CARD
========================================================= */

.warga-card {
  overflow: hidden;

  border-radius: 16px;

  background: white;

  border: 1px solid #e8edf4;

  box-shadow: 0 3px 12px rgba(30, 60, 100, 0.05);

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.warga-card:active {
  transform: scale(0.995);
}

.warga-nama {
  font-size: 15px;

  line-height: 1.3;

  font-weight: 800;

  color: #263238;
}

.warga-nik {
  margin-top: 3px;

  font-size: 11px;

  color: #78909c;
}

/* =========================================================
   NOMINAL
========================================================= */

.nominal {
  margin-top: 2px;

  font-size: 18px;

  font-weight: 800;

  color: #0d5ac7;
}

/* =========================================================
   EMPTY
========================================================= */

.empty-card {
  border-radius: 16px;
}

.empty-icon {
  color: #b0bec5;
}

/* =========================================================
   DESKTOP
========================================================= */

@media (min-width: 768px) {
  .filter-card,
  .search-card,
  .list-heading,
  .warga-card,
  .empty-card {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
