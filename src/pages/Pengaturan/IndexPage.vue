<template>
  <q-page class="settings-page">

    <!-- HEADER -->
    <div class="settings-header">
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

        <div>
          <div class="header-title">
            Pengaturan
          </div>

          <div class="header-subtitle">
            Pengaturan Sistem SI RUKEM
          </div>
        </div>

      </div>
    </div>


    <!-- CONTENT -->
    <div class="settings-content">

      <!-- TITLE -->
      <div class="section-header">
        <div class="section-title">
          Pengaturan Sistem
        </div>

        <div class="section-description">
          Kelola konfigurasi dan hak akses aplikasi
        </div>
      </div>


      <!-- =====================================================
           IURAN BULANAN
      ====================================================== -->

      <q-card
        flat
        bordered
        class="setting-card cursor-pointer"
        @click="openIuran"
      >
        <q-card-section class="setting-card-content">

          <div class="setting-icon iuran-icon">
            <q-icon
              name="payments"
              size="30px"
            />
          </div>

          <div class="setting-information">

            <div class="setting-title">
              Iuran Bulanan
            </div>

            <div class="setting-description">
              Atur nominal iuran rutin warga setiap bulan
            </div>

          </div>

          <q-icon
            name="chevron_right"
            size="26px"
            color="grey-6"
          />

        </q-card-section>
      </q-card>


      <!-- =====================================================
           HAK AKSES
      ====================================================== -->

      <q-card
        flat
        bordered
        class="setting-card cursor-pointer"
        @click="openHakAkses"
      >
        <q-card-section class="setting-card-content">

          <div class="setting-icon akses-icon">
            <q-icon
              name="admin_panel_settings"
              size="30px"
            />
          </div>

          <div class="setting-information">

            <div class="setting-title">
              Hak Akses
            </div>

            <div class="setting-description">
              Kelola pengguna, role dan izin akses menu aplikasi
            </div>

          </div>

          <q-icon
            name="chevron_right"
            size="26px"
            color="grey-6"
          />

        </q-card-section>
      </q-card>


      <!-- INFO -->
      <div class="information-box">

        <q-icon
          name="info"
          size="22px"
          color="primary"
        />

        <div>
          Perubahan pada pengaturan sistem dapat mempengaruhi
          proses transaksi dan akses pengguna SI RUKEM.
        </div>

      </div>

    </div>

  </q-page>
</template>


<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()


// =========================================================
// KEMBALI
// =========================================================

const goBack = () => {
  router.push('/')
}


// =========================================================
// IURAN BULANAN
// =========================================================

const openIuran = () => {
  router.push({
    name: 'pengaturan-iuran',
  })
}


// =========================================================
// HAK AKSES
// =========================================================

const openHakAkses = () => {
  router.push({
    name: 'pengaturan-hak-akses',
  })
}
</script>


<style scoped>

/* =========================================================
   PAGE
========================================================= */

.settings-page {
  min-height: 100vh;
  background: #f5f9ff;
  color: #102a43;
}


/* =========================================================
   HEADER
========================================================= */

.settings-header {
  padding: 22px 20px 45px;

  background:
    linear-gradient(
      135deg,
      #0d47a1 0%,
      #1565c0 50%,
      #1e88e5 100%
    );

  border-radius: 0 0 30px 30px;
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

  color: rgba(255, 255, 255, 0.8);

  font-size: 13px;
}


/* =========================================================
   CONTENT
========================================================= */

.settings-content {
  max-width: 700px;

  margin: -20px auto 0;

  padding:
    0
    20px
    30px;

  position: relative;
  z-index: 2;
}


/* =========================================================
   SECTION HEADER
========================================================= */

.section-header {
  background: white;

  padding: 20px;

  border-radius: 18px;

  margin-bottom: 16px;

  box-shadow:
    0 5px 20px
    rgba(23, 76, 130, 0.08);
}

.section-title {
  font-size: 19px;
  font-weight: 700;

  color: #12345b;
}

.section-description {
  margin-top: 4px;

  font-size: 13px;

  color: #78909c;
}


/* =========================================================
   SETTING CARD
========================================================= */

.setting-card {
  margin-bottom: 14px;

  border-radius: 18px;

  border:
    1px solid
    #e4edf7;

  background: white;

  box-shadow:
    0 5px 18px
    rgba(23, 76, 130, 0.05);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.setting-card:hover {
  transform: translateY(-2px);

  border-color: #bbdefb;

  box-shadow:
    0 9px 24px
    rgba(21, 101, 192, 0.12);
}

.setting-card:active {
  transform: scale(0.99);
}


/* =========================================================
   CARD CONTENT
========================================================= */

.setting-card-content {
  min-height: 105px;

  padding: 18px;

  display: flex;

  align-items: center;
}


/* =========================================================
   ICON
========================================================= */

.setting-icon {
  width: 60px;
  height: 60px;

  min-width: 60px;

  margin-right: 16px;

  border-radius: 16px;

  display: flex;

  align-items: center;
  justify-content: center;
}


/* IURAN */

.iuran-icon {
  color: #00897b;
  background: #e0f2f1;
}


/* HAK AKSES */

.akses-icon {
  color: #7e57c2;
  background: #ede7f6;
}


/* =========================================================
   INFORMATION
========================================================= */

.setting-information {
  flex: 1;
  min-width: 0;
}

.setting-title {
  font-size: 17px;

  font-weight: 700;

  color: #102a43;
}

.setting-description {
  margin-top: 5px;

  font-size: 13px;

  line-height: 1.4;

  color: #78909c;
}


/* =========================================================
   INFORMATION BOX
========================================================= */

.information-box {
  margin-top: 25px;

  padding: 15px;

  display: flex;

  gap: 12px;

  align-items: flex-start;

  border-radius: 14px;

  background: #e3f2fd;

  color: #546e7a;

  font-size: 12px;

  line-height: 1.5;
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {

  .settings-header {
    padding:
      20px
      15px
      40px;

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
    font-size: 12px;
  }

  .settings-content {
    padding:
      0
      14px
      25px;
  }

  .section-header {
    padding: 17px;

    border-radius: 16px;
  }

  .section-title {
    font-size: 17px;
  }

  .section-description {
    font-size: 12px;
  }

  .setting-card {
    border-radius: 16px;
  }

  .setting-card-content {
    min-height: 95px;

    padding: 15px;
  }

  .setting-icon {
    width: 52px;
    height: 52px;

    min-width: 52px;

    margin-right: 13px;

    border-radius: 14px;
  }

  .setting-icon .q-icon {
    font-size: 26px !important;
  }

  .setting-title {
    font-size: 15px;
  }

  .setting-description {
    font-size: 11px;
  }

}


/* =========================================================
   VERY SMALL MOBILE
========================================================= */

@media (max-width: 360px) {

  .settings-content {
    padding-left: 10px;
    padding-right: 10px;
  }

  .setting-icon {
    width: 48px;
    height: 48px;

    min-width: 48px;
  }

  .setting-title {
    font-size: 14px;
  }

  .setting-description {
    font-size: 10px;
  }

}

</style>
