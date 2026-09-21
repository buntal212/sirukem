<template>
  <div class="q-pa-md">

    <!-- SEARCH -->
    <q-input
      v-model="keyword"
      outlined
      dense
      clearable
      debounce="500"
      placeholder="Cari nama penduduk..."
      class="q-mb-md"
      @update:model-value="onSearch"
    >
      <template #prepend>
        <q-icon
          name="search"
          color="primary"
        />
      </template>
    </q-input>

    <!-- JUMLAH DATA YANG SUDAH DIMUAT -->
    <div
      v-if="data.length > 0"
      class="row items-center justify-between q-mb-sm"
    >
      <div class="text-caption text-grey-7">
        {{ data.length }} data ditampilkan
      </div>

      <q-btn
        flat
        round
        dense
        color="primary"
        icon="refresh"
        :loading="refreshing"
        @click="refreshData"
      >
        <q-tooltip>
          Muat ulang
        </q-tooltip>
      </q-btn>
    </div>

    <!-- LOADING AWAL -->
    <div
      v-if="loading && data.length === 0"
      class="q-py-xl text-center"
    >
      <q-spinner
        color="primary"
        size="40px"
      />

      <div class="text-grey-7 q-mt-md">
        Memuat data penduduk...
      </div>
    </div>

    <!-- DATA KOSONG -->
    <div
      v-else-if="
        !loading &&
        data.length === 0
      "
      class="empty-state"
    >
      <q-icon
        name="people_outline"
        size="64px"
        color="grey-5"
      />

      <div
        class="text-subtitle1 text-weight-medium q-mt-md"
      >
        {{
          keyword
            ? 'Penduduk tidak ditemukan'
            : 'Belum ada data penduduk'
        }}
      </div>

      <div
        class="text-caption text-grey-7 q-mt-xs"
      >
        {{
          keyword
            ? 'Coba gunakan nama yang berbeda'
            : 'Tekan tombol + untuk menambahkan penduduk'
        }}
      </div>
    </div>

    <!-- LIST -->
    <q-infinite-scroll
      v-else
      ref="infiniteScrollRef"
      :offset="150"
      @load="onLoad"
    >
      <div class="column q-gutter-sm">

        <q-card
          v-for="item in data"
          :key="item.id"
          flat
          bordered
          class="penduduk-card"
        >
          <q-card-section class="q-pa-md">
            <div
              class="row items-center no-wrap"
            >
              <!-- AVATAR -->
              <q-avatar
                color="primary"
                text-color="white"
                size="44px"
              >
                {{
                  getInitial(item.nama)
                }}
              </q-avatar>

              <!-- NAMA -->
              <div
                class="col q-ml-md"
                style="min-width: 0"
              >
                <div
                  class="text-subtitle1 text-weight-medium ellipsis"
                >
                  {{ item.nama }}
                </div>

                <div
                  class="text-caption text-grey-6"
                >
                  Penduduk Desa Rowo Leces
                </div>
              </div>

              <!-- ACTION -->
              <q-btn
                flat
                round
                dense
                icon="more_vert"
                color="grey-7"
              >
                <q-menu auto-close>
                  <q-list
                    style="min-width: 140px"
                  >
                    <q-item
                      clickable
                      @click="editData(item)"
                    >
                      <q-item-section avatar>
                        <q-icon
                          name="edit"
                          color="primary"
                        />
                      </q-item-section>

                      <q-item-section>
                        Edit
                      </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item
                      clickable
                      @click="deleteData(item)"
                    >
                      <q-item-section avatar>
                        <q-icon
                          name="delete_outline"
                          color="negative"
                        />
                      </q-item-section>

                      <q-item-section
                        class="text-negative"
                      >
                        Hapus
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>

      </div>

      <!-- LOADING INFINITE -->
      <template #loading>
        <div
          class="row justify-center q-my-md"
        >
          <q-spinner-dots
            color="primary"
            size="40px"
          />
        </div>
      </template>

    </q-infinite-scroll>

    <!-- FAB TAMBAH -->
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="addData"
      >
        <q-tooltip>
          Tambah Penduduk
        </q-tooltip>
      </q-btn>
    </q-page-sticky>

  </div>
</template>

<script setup>
import {
  ref,
  watch
} from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },

  loading: {
    type: Boolean,
    default: false
  },

  loadingMore: {
    type: Boolean,
    default: false
  },

  hasMore: {
    type: Boolean,
    default: true
  },

  refreshing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'add',
  'edit',
  'delete',
  'search',
  'load-more',
  'refresh'
])

const keyword = ref('')

const infiniteScrollRef = ref(null)

const getInitial = (nama) => {
  if (!nama) {
    return '?'
  }

  return nama
    .trim()
    .charAt(0)
    .toUpperCase()
}

const addData = () => {
  emit('add')
}

const editData = (item) => {
  emit('edit', item)
}

const deleteData = (item) => {
  emit('delete', item)
}

const onSearch = (value) => {
  emit(
    'search',
    value?.trim() ?? ''
  )
}

const refreshData = () => {
  emit('refresh')
}

/*
|--------------------------------------------------------------------------
| INFINITE SCROLL
|--------------------------------------------------------------------------
*/

const onLoad = (
  index,
  done
) => {
  if (
    props.loadingMore
  ) {
    done()
    return
  }

  if (!props.hasMore) {
    done(true)
    return
  }

  emit(
    'load-more',
    done
  )
}

/*
|--------------------------------------------------------------------------
| AKTIFKAN KEMBALI INFINITE SCROLL
|--------------------------------------------------------------------------
|
| Ketika melakukan pencarian / refresh,
| hasMore bisa kembali true.
|
*/

watch(
  () => props.hasMore,
  (value) => {
    if (value) {
      infiniteScrollRef.value?.resume()
    }
  }
)
</script>

<style scoped>
.penduduk-card {
  border-radius: 14px;
}

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
