<template>
  <div class="q-pa-md">

    <q-card flat bordered class="penduduk-form-card">
      <q-card-section class="q-pb-sm">
        <div class="row items-center no-wrap">
          <q-avatar
            color="primary"
            text-color="white"
            icon="person"
            size="46px"
          />

          <div class="q-ml-md">
            <div class="text-subtitle1 text-weight-bold text-primary">
              {{ mode === 'edit' ? 'Edit Penduduk' : 'Tambah Penduduk' }}
            </div>

            <div class="text-caption text-grey-7">
              {{
                mode === 'edit'
                  ? 'Perbarui nama penduduk'
                  : 'Masukkan nama penduduk'
              }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form
          ref="formRef"
          @submit.prevent="submitForm"
        >
          <div class="text-caption text-weight-medium q-mb-xs">
            Nama Penduduk
          </div>

          <q-input
            v-model="form.nama"
            outlined
            dense
            autofocus
            clearable
            maxlength="150"
            placeholder="Masukkan nama penduduk"
            :disable="loading"
            :rules="[
              val =>
                !!val?.trim() ||
                'Nama penduduk wajib diisi'
            ]"
          >
            <template #prepend>
              <q-icon
                name="person_outline"
                color="primary"
              />
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
                @click="cancelForm"
              />
            </div>

            <div class="col-7">
              <q-btn
                unelevated
                color="primary"
                icon="save"
                label="Simpan"
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

  </div>
</template>

<script setup>
import {
  reactive,
  ref,
  watch
} from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: null
  },

  mode: {
    type: String,
    default: 'add'
  },

  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'save',
  'cancel'
])

const formRef = ref(null)

const form = reactive({
  nama: ''
})

const resetForm = () => {
  form.nama = ''
}

watch(
  () => props.data,
  (value) => {
    if (
      props.mode === 'edit' &&
      value
    ) {
      form.nama = value.nama ?? ''
    } else {
      resetForm()
    }
  },
  {
    immediate: true,
    deep: true
  }
)

const submitForm = () => {
  const payload = {
    nama: form.nama.trim()
  }

  if (
    props.mode === 'edit' &&
    props.data?.id
  ) {
    payload.id = props.data.id
  }

  emit('save', payload)
}

const cancelForm = () => {
  emit('cancel')
}
</script>

<style scoped>
.penduduk-form-card {
  border-radius: 16px;
}
</style>
