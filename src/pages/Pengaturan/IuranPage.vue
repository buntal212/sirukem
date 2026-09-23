<template>
  <q-page class="iuran-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->
    <div class="page-header">
      <div class="header-content">

        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          color="white"
          class="back-button"
          @click="goBack"
        />

        <div class="header-text">
          <div class="header-title">
            Iuran Mingguan
          </div>

          <div class="header-subtitle">
            Pengaturan nominal iuran RUKEM warga
          </div>
        </div>

      </div>
    </div>


    <!-- =====================================================
         CONTENT
    ====================================================== -->
    <div class="page-content">

      <!-- ===================================================
           INFO CARD
      ==================================================== -->
      <q-card
        flat
        class="info-card"
      >
        <q-card-section class="info-card-content">

          <div class="info-icon">
            <q-icon
              name="payments"
              size="30px"
            />
          </div>

          <div class="info-content">
            <div class="info-title">
              Pengaturan Iuran RUKEM
            </div>

            <div class="info-description">
              Tentukan nominal iuran rutin yang harus dibayarkan
              oleh setiap warga setiap minggu.
            </div>
          </div>

        </q-card-section>
      </q-card>


      <!-- ===================================================
           FORM CARD
      ==================================================== -->
      <q-card
        flat
        bordered
        class="form-card"
      >

        <!-- CARD HEADER -->
        <q-card-section class="form-header">

          <div class="form-header-icon">
            <q-icon name="tune" />
          </div>

          <div>
            <div class="form-title">
              Pengaturan Iuran
            </div>

            <div class="form-subtitle">
              Atur nominal dan periode iuran mingguan
            </div>
          </div>

        </q-card-section>

        <q-separator />


        <!-- =================================================
             FORM
        ================================================== -->
        <q-card-section class="form-content">

          <q-form
            ref="formRef"
            @submit.prevent="simpan"
          >

            <!-- NOMINAL IURAN -->
            <div class="field-group">

              <div class="field-label">
                Nominal Iuran
                <span class="required">*</span>
              </div>

              <q-input
                v-model="form.nominal"
                outlined
                dense
                prefix="Rp"
                placeholder="Contoh: 25.000"
                input-class="text-weight-bold"
                :rules="[
                  val => !!val || 'Nominal iuran wajib diisi'
                ]"
                @update:model-value="formatNominal"
              >
                <template #prepend>
                  <q-icon
                    name="payments"
                    color="primary"
                  />
                </template>
              </q-input>

              <div class="field-help">
                Nominal iuran yang dibayarkan setiap warga per minggu.
              </div>

            </div>

            <!-- =================================================
                 PREVIEW
            ================================================== -->
            <div class="preview-section">

              <div class="preview-label">
                Ringkasan
              </div>

              <div class="preview-card">

                <div class="preview-top">

                  <div class="preview-icon">
                    <q-icon name="account_balance_wallet" />
                  </div>

                  <div class="preview-status">
                    <q-badge
                      :color="form.aktif ? 'positive' : 'grey'"
                      :label="form.aktif ? 'Aktif' : 'Nonaktif'"
                    />
                  </div>

                </div>


                <div class="preview-small">
                  Iuran RUKEM / Minggu
                </div>

                <div class="preview-nominal">
                  Rp {{ form.nominal || '0' }}
                </div>


                <q-separator
                  class="q-my-md"
                  color="white"
                />


                <div class="preview-details">

                  <!-- <div class="preview-detail">
                    <span>Mulai Berlaku</span>

                    <strong>
                      {{ formatTanggal(form.mulai_berlaku) }}
                    </strong>
                  </div> -->

                  <!-- <div class="preview-detail">
                    <span>Jatuh Tempo</span>

                    <strong>
                      Tanggal {{ form.jatuh_tempo || '-' }}
                    </strong>
                  </div> -->

                </div>

              </div>

            </div>


            <!-- =================================================
                 BUTTON
            ================================================== -->
            <div class="button-wrapper">

              <q-btn
                outline
                no-caps
                color="grey-7"
                label="Batal"
                icon="close"
                class="action-button"
                @click="goBack"
              />

              <q-btn
                unelevated
                no-caps
                color="primary"
                label="Simpan Pengaturan"
                icon="save"
                type="submit"
                class="action-button save-button"
                :loading="miuranStore.saving"
              />

            </div>

          </q-form>

        </q-card-section>

      </q-card>

    </div>

  </q-page>
</template>


<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useMiuranStore } from '@/stores/miuran'
// import { api } from '../../boot/axios'

const miuranStore = useMiuranStore()
// =========================================================
// INIT
// =========================================================

const router = useRouter()
const $q = useQuasar()

const formRef = ref(null)


// =========================================================
// FORM
// =========================================================

const form = reactive({
  nominal: '25.000',
  mulai_berlaku: '',
  jatuh_tempo: 10,
  keterangan: '',
  aktif: true,
})


// =========================================================
// FORMAT NOMINAL
// =========================================================

const formatNominal = (value) => {

  if (!value) {
    form.nominal = ''
    return
  }

  const angka = String(value)
    .replace(/\D/g, '')

  form.nominal = angka
    ? new Intl.NumberFormat('id-ID').format(Number(angka))
    : ''
}


// =========================================================
// FORMAT TANGGAL
// =========================================================

// const formatTanggal = (tanggal) => {

//   if (!tanggal) {
//     return '-'
//   }

//   const date = new Date(`${tanggal}T00:00:00`)

//   return new Intl.DateTimeFormat(
//     'id-ID',
//     {
//       day: '2-digit',
//       month: 'long',
//       year: 'numeric',
//     }
//   ).format(date)
// }


// =========================================================
// BACK
// =========================================================

const goBack = () => {

  router.push({
    name: 'pengaturan',
  })

}


// =========================================================
// SIMPAN
// =========================================================

const simpan = async () => {
  const valid = await formRef.value.validate()

  if (!valid) {
    return
  }

  try {
    const nominal = Number(
      String(form.nominal).replace(/\./g, '')
    )

    const response = await miuranStore.saveMiuran(nominal)

    $q.notify({
      type: 'positive',
      position: 'top',
      message:
        response?.message ||
        'Nominal iuran berhasil disimpan',
      icon: 'check_circle',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      position: 'top',
      message:
        error.response?.data?.message ||
        'Gagal menyimpan nominal iuran',
      icon: 'error',
    })
  }
}

onMounted(async () => {
  try {
    const data = await miuranStore.getMiuran()

    if (data) {
      form.nominal = new Intl.NumberFormat('id-ID').format(
        Number(data.nominaliuran)
      )
    }
  } catch (error) {
    console.error('Gagal mengambil nominal iuran:', error)
  }
})
</script>


<style scoped>

/* =========================================================
   PAGE
========================================================= */

.iuran-page {
  min-height: 100vh;

  background: #f5f9ff;

  color: #102a43;
}


/* =========================================================
   HEADER
========================================================= */

.page-header {

  padding:
    22px
    20px
    50px;

  background:
    linear-gradient(
      135deg,
      #0d47a1 0%,
      #1565c0 50%,
      #1e88e5 100%
    );

  border-radius:
    0
    0
    30px
    30px;
}


.header-content {

  max-width: 700px;

  margin: auto;

  display: flex;

  align-items: center;
}


.back-button {
  margin-right: 12px;
}


.header-title {

  color: white;

  font-size: 24px;

  font-weight: 800;
}


.header-subtitle {

  margin-top: 2px;

  color:
    rgba(
      255,
      255,
      255,
      0.8
    );

  font-size: 13px;
}


/* =========================================================
   CONTENT
========================================================= */

.page-content {

  position: relative;

  z-index: 2;

  max-width: 700px;

  margin:
    -25px
    auto
    0;

  padding:
    0
    20px
    35px;
}


/* =========================================================
   INFO CARD
========================================================= */

.info-card {

  margin-bottom: 16px;

  border-radius: 18px;

  background: white;

  box-shadow:
    0
    6px
    20px
    rgba(
      23,
      76,
      130,
      0.09
    );
}


.info-card-content {

  display: flex;

  align-items: center;

  padding: 18px;
}


.info-icon {

  width: 58px;
  height: 58px;

  min-width: 58px;

  margin-right: 15px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 16px;

  color: #00897b;

  background: #e0f2f1;
}


.info-content {
  flex: 1;
}


.info-title {

  font-size: 17px;

  font-weight: 700;

  color: #102a43;
}


.info-description {

  margin-top: 4px;

  font-size: 12px;

  line-height: 1.5;

  color: #78909c;
}


/* =========================================================
   FORM CARD
========================================================= */

.form-card {

  overflow: hidden;

  border-radius: 18px;

  border:
    1px solid
    #e4edf7;

  background: white;

  box-shadow:
    0
    5px
    18px
    rgba(
      23,
      76,
      130,
      0.05
    );
}


/* =========================================================
   FORM HEADER
========================================================= */

.form-header {

  display: flex;

  align-items: center;

  padding: 18px;
}


.form-header-icon {

  width: 42px;
  height: 42px;

  margin-right: 12px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 12px;

  color: #1565c0;

  background: #e3f2fd;

  font-size: 23px;
}


.form-title {

  font-size: 16px;

  font-weight: 700;

  color: #12345b;
}


.form-subtitle {

  margin-top: 2px;

  font-size: 11px;

  color: #78909c;
}


/* =========================================================
   FORM CONTENT
========================================================= */

.form-content {
  padding: 20px;
}


.field-group {
  margin-bottom: 18px;
}


.field-label {

  margin-bottom: 7px;

  font-size: 13px;

  font-weight: 600;

  color: #455a64;
}


.required {
  color: #e53935;
}


.field-help {

  margin-top: -10px;

  padding-left: 3px;

  font-size: 10px;

  color: #90a4ae;
}


/* =========================================================
   STATUS
========================================================= */

.status-box {

  margin-top: 5px;

  padding: 15px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  border-radius: 14px;

  background: #f5f9ff;

  border:
    1px solid
    #e3edf7;
}


.status-information {

  display: flex;

  align-items: center;
}


.status-icon {

  width: 42px;
  height: 42px;

  margin-right: 12px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 12px;

  background: #e8f5e9;

  color: #43a047;

  font-size: 24px;
}


.status-title {

  font-size: 13px;

  font-weight: 700;

  color: #37474f;
}


.status-description {

  margin-top: 2px;

  font-size: 10px;

  color: #90a4ae;
}


/* =========================================================
   PREVIEW
========================================================= */

.preview-section {
  margin-top: 25px;
}


.preview-label {

  margin-bottom: 8px;

  font-size: 13px;

  font-weight: 700;

  color: #455a64;
}


.preview-card {

  padding: 20px;

  overflow: hidden;

  position: relative;

  border-radius: 18px;

  color: white;

  background:
    linear-gradient(
      135deg,
      #00897b,
      #26a69a
    );

  box-shadow:
    0
    8px
    20px
    rgba(
      0,
      137,
      123,
      0.20
    );
}


.preview-card::after {

  content: '';

  position: absolute;

  width: 150px;

  height: 150px;

  right: -60px;

  bottom: -80px;

  border-radius: 50%;

  background:
    rgba(
      255,
      255,
      255,
      0.10
    );
}


.preview-top {

  position: relative;

  z-index: 2;

  display: flex;

  align-items: center;

  justify-content: space-between;
}


.preview-icon {

  width: 45px;

  height: 45px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 13px;

  background:
    rgba(
      255,
      255,
      255,
      0.18
    );

  font-size: 24px;
}


.preview-small {

  position: relative;

  z-index: 2;

  margin-top: 18px;

  font-size: 11px;

  opacity: 0.85;
}


.preview-nominal {

  position: relative;

  z-index: 2;

  margin-top: 3px;

  font-size: 27px;

  font-weight: 800;
}


.preview-details {

  position: relative;

  z-index: 2;
}


.preview-detail {

  padding: 4px 0;

  display: flex;

  justify-content: space-between;

  gap: 15px;

  font-size: 11px;
}


.preview-detail span {
  opacity: 0.8;
}


/* =========================================================
   BUTTON
========================================================= */

.button-wrapper {

  margin-top: 25px;

  display: flex;

  justify-content: flex-end;

  gap: 10px;
}


.action-button {

  min-height: 42px;

  padding:
    0
    18px;

  border-radius: 10px;
}


.save-button {
  min-width: 180px;
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {

  .page-header {

    padding:
      20px
      15px
      45px;

    border-radius:
      0
      0
      25px
      25px;
  }


  .header-title {
    font-size: 21px;
  }


  .header-subtitle {
    font-size: 11px;
  }


  .page-content {

    padding:
      0
      14px
      25px;
  }


  .info-card {
    border-radius: 16px;
  }


  .info-card-content {
    padding: 15px;
  }


  .info-icon {

    width: 50px;

    height: 50px;

    min-width: 50px;

    border-radius: 14px;
  }


  .info-title {
    font-size: 15px;
  }


  .info-description {
    font-size: 10px;
  }


  .form-card {
    border-radius: 16px;
  }


  .form-content {
    padding: 16px;
  }


  .preview-nominal {
    font-size: 24px;
  }


  .button-wrapper {
    flex-direction: column-reverse;
  }


  .action-button {

    width: 100%;

    min-height: 45px;
  }


  .save-button {
    min-width: 0;
  }

}


/* =========================================================
   VERY SMALL MOBILE
========================================================= */

@media (max-width: 360px) {

  .page-content {

    padding-left: 10px;

    padding-right: 10px;
  }


  .preview-card {
    padding: 16px;
  }


  .preview-nominal {
    font-size: 21px;
  }


  .preview-detail {
    font-size: 10px;
  }

}

</style>

