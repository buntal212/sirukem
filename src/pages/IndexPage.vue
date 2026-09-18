<template>
  <q-page class="dashboard-page">

    <!-- =====================================================
         HERO
    ====================================================== -->
    <section class="hero-section">

      <!-- DECORATION -->
      <div class="hero-circle circle-1"></div>
      <div class="hero-circle circle-2"></div>

      <!-- LOGOUT -->
      <div class="logout-wrapper">
        <q-btn
          unelevated
          no-caps
          icon="logout"
          label="Logout"
          class="logout-btn"
          @click="confirmLogout"
        />
      </div>

      <!-- HERO CONTENT -->
      <div class="hero-content">

        <!-- LOGO / ICON DESA -->
        <div class="logo-wrapper">
          <q-icon
            name="account_balance"
            size="54px"
            color="white"
          />
        </div>

        <div class="hero-text">
          <div class="hero-small">
            SISTEM INFORMASI
          </div>

          <div class="hero-title">
            DESA ROWO
          </div>

          <div class="hero-subtitle">
            KECAMATAN LECES
          </div>

          <div class="hero-description">
            Melayani dengan Data,<br>
            Membangun untuk Masyarakat
          </div>
        </div>

      </div>

      <!-- VILLAGE DECORATION -->
      <div class="village-decoration">
        <q-icon name="location_city" />
        <q-icon name="account_balance" />
        <q-icon name="location_city" />
      </div>

      <!-- WAVE -->
      <div class="wave wave-one"></div>
      <div class="wave wave-two"></div>

    </section>


    <!-- =====================================================
         CONTENT
    ====================================================== -->
    <section class="content-section">

      <!-- WELCOME -->
      <div class="welcome-section">
        <div class="welcome-title">
          Selamat Datang
        </div>

        <div class="welcome-subtitle">
          Silakan pilih layanan yang ingin digunakan
        </div>
      </div>


      <!-- ===================================================
           MENU GRID
      ==================================================== -->
      <div class="menu-grid">

        <q-card
          v-for="menu in menus"
          :key="menu.title"
          flat
          bordered
          class="menu-card cursor-pointer"
          @click="openMenu(menu)"
        >
          <q-card-section class="menu-card-content">

            <div
              class="menu-icon"
              :style="{
                background: menu.background,
                color: menu.color
              }"
            >
              <q-icon
                :name="menu.icon"
                size="30px"
              />
            </div>

            <div class="menu-information">

              <div class="menu-title">
                {{ menu.title }}
              </div>

              <div class="menu-description">
                {{ menu.description }}
              </div>

            </div>

            <q-icon
              name="chevron_right"
              color="primary"
              size="24px"
              class="menu-arrow"
            />

          </q-card-section>
        </q-card>

      </div>


      <!-- ===================================================
           FOOTER DECORATION
      ==================================================== -->
      <div class="footer-decoration">

        <div class="footer-icons">
          <q-icon name="park" />
          <q-icon name="home" />
          <q-icon name="account_balance" />
          <q-icon name="home" />
          <q-icon name="park" />
        </div>

      </div>

    </section>


    <!-- =====================================================
         FOOTER
    ====================================================== -->
    <footer class="footer-section">

      <div class="footer-title">
        Paguyuban Desa Rowo
      </div>

      <div class="footer-subtitle">
        KECAMATAN LECES
      </div>

      <div class="footer-copyright">
        © {{ currentYear }} Desa Rowo
      </div>
      <div class="footer-company">CV. UDUMBARA INFORMATIKA</div>

    </footer>


    <!-- =====================================================
         LOGOUT DIALOG
    ====================================================== -->
    <q-dialog v-model="logoutDialog">
      <q-card class="logout-dialog">

        <q-card-section class="text-center q-pt-lg">

          <div class="dialog-icon">
            <q-icon
              name="logout"
              size="34px"
            />
          </div>

          <div class="text-h6 text-weight-bold q-mt-md">
            Keluar Aplikasi?
          </div>

          <div class="text-grey-7 q-mt-sm">
            Apakah Anda yakin ingin keluar dari Sistem Informasi Desa Rowo?
          </div>

        </q-card-section>

        <q-card-actions
          align="center"
          class="q-pa-lg q-pt-sm"
        >

          <q-btn
            flat
            no-caps
            label="Batal"
            color="grey-7"
            class="dialog-button"
            v-close-popup
          />

          <q-btn
            unelevated
            no-caps
            label="Ya, Logout"
            icon="logout"
            color="primary"
            class="dialog-button"
            :loading="logoutLoading"
            @click="logout"
          />

        </q-card-actions>

      </q-card>
    </q-dialog>

  </q-page>
</template>


<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { LocalStorage, useQuasar } from 'quasar'
import { api } from '../boot/axios'
const router = useRouter()
const $q = useQuasar()

// =========================================================
// STATE
// =========================================================

const logoutDialog = ref(false)
const logoutLoading = ref(false)

const currentYear = computed(() => {
  return new Date().getFullYear()
})


// =========================================================
// MENU
// =========================================================

const menus = [
  {
    title: 'Dashboard',
    description: 'Beranda & Ringkasan Informasi',
    icon: 'home',
    route: '/',
    color: '#1565c0',
    background: '#e3f2fd',
  },

  {
    title: 'Penduduk',
    description: 'Data Penduduk Desa Rowo',
    icon: 'groups',
    route: '/penduduk',
    color: '#00897b',
    background: '#e0f2f1',
  },

  {
    title: 'Surat Menyurat',
    description: 'Layanan Surat Online',
    icon: 'description',
    route: '/surat',
    color: '#00a67e',
    background: '#e0f7ef',
  },

  {
    title: 'Laporan',
    description: 'Rekapitulasi & Statistik',
    icon: 'bar_chart',
    route: '/laporan',
    color: '#ef8c00',
    background: '#fff3e0',
  },

  {
    title: 'Keuangan',
    description: 'Data Keuangan Desa',
    icon: 'account_balance_wallet',
    route: '/keuangan',
    color: '#7e57c2',
    background: '#ede7f6',
  },

  {
    title: 'Pengaturan',
    description: 'Manajemen Sistem',
    icon: 'settings',
    route: '/pengaturan',
    color: '#e53955',
    background: '#ffebee',
  },

  {
    title: 'Galeri',
    description: 'Dokumentasi Kegiatan',
    icon: 'photo_library',
    route: '/galeri',
    color: '#0097a7',
    background: '#e0f7fa',
  },

  {
    title: 'Informasi',
    description: 'Berita & Pengumuman',
    icon: 'info',
    route: '/informasi',
    color: '#546e8a',
    background: '#eceff1',
  },
]


// =========================================================
// OPEN MENU
// =========================================================

const openMenu = (menu) => {
  if (!menu.route) {
    return
  }

  router.push(menu.route)
}


// =========================================================
// CONFIRM LOGOUT
// =========================================================

const confirmLogout = () => {
  logoutDialog.value = true
}


// =========================================================
// LOGOUT
// =========================================================

const logout = async () => {
  logoutLoading.value = true

  try {

    // Coba hapus token di server
    await api.post('/v1/logout')

  } catch (error) {

    console.warn(
      'Logout API:',
      error.response?.data?.message || error.message
    )

  } finally {

    // Token lokal tetap dibersihkan
    LocalStorage.remove('auth_token')
    LocalStorage.remove('auth_user')

    logoutLoading.value = false
    logoutDialog.value = false

    $q.notify({
      type: 'positive',
      message: 'Logout berhasil',
      position: 'top',
    })

    await router.replace('/login')
  }
}
</script>


<style scoped>
/* =========================================================
   PAGE
========================================================= */

.dashboard-page {
  min-height: 100vh;
  background: #f5f9ff;
  color: #102a43;
}


/* =========================================================
   HERO
========================================================= */

.hero-section {
  position: relative;
  min-height: 320px;
  padding: 32px 28px 80px;
  overflow: hidden;

  background:
    linear-gradient(
      135deg,
      #0d47a1 0%,
      #1565c0 35%,
      #1e88e5 70%,
      #64b5f6 100%
    );
}


/* =========================================================
   HERO DECORATION
========================================================= */

.hero-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.circle-1 {
  width: 240px;
  height: 240px;
  top: -120px;
  right: -50px;
}

.circle-2 {
  width: 180px;
  height: 180px;
  left: -90px;
  bottom: 20px;
}


/* =========================================================
   LOGOUT
========================================================= */

.logout-wrapper {
  position: absolute;
  top: 22px;
  right: 22px;
  z-index: 10;
}

.logout-btn {
  background: rgba(0, 55, 125, 0.55);
  color: white;

  border-radius: 10px;

  padding: 6px 14px;

  font-weight: 600;

  backdrop-filter: blur(5px);
}


/* =========================================================
   HERO CONTENT
========================================================= */

.hero-content {
  position: relative;
  z-index: 3;

  display: flex;
  align-items: center;

  max-width: 720px;

  margin: 55px auto 0;
}

.logo-wrapper {
  width: 90px;
  height: 90px;

  min-width: 90px;

  border-radius: 22px;

  display: flex;
  justify-content: center;
  align-items: center;

  margin-right: 22px;

  background: rgba(255, 255, 255, 0.15);

  border: 1px solid rgba(255, 255, 255, 0.3);

  backdrop-filter: blur(8px);
}

.hero-text {
  color: white;
}

.hero-small {
  font-size: 16px;
  font-weight: 500;

  letter-spacing: 2px;

  opacity: 0.9;
}

.hero-title {
  margin-top: 2px;

  font-size: 34px;
  line-height: 1.1;

  font-weight: 800;

  letter-spacing: 1px;
}

.hero-subtitle {
  margin-top: 5px;

  font-size: 17px;
  font-weight: 500;

  letter-spacing: 4px;

  opacity: 0.95;
}

.hero-description {
  margin-top: 15px;

  font-size: 14px;
  line-height: 1.5;

  opacity: 0.85;

  font-style: italic;
}


/* =========================================================
   VILLAGE DECORATION
========================================================= */

.village-decoration {
  position: absolute;

  right: 30px;
  bottom: 35px;

  display: flex;
  align-items: flex-end;

  color: rgba(255, 255, 255, 0.11);

  z-index: 1;
}

.village-decoration .q-icon:nth-child(1) {
  font-size: 100px;
}

.village-decoration .q-icon:nth-child(2) {
  font-size: 150px;
}

.village-decoration .q-icon:nth-child(3) {
  font-size: 85px;
}


/* =========================================================
   WAVE
========================================================= */

.wave {
  position: absolute;

  left: -5%;
  bottom: -80px;

  width: 110%;
  height: 140px;

  background: white;

  border-radius: 50% 50% 0 0;
}

.wave-one {
  bottom: -75px;

  background: rgba(255, 255, 255, 0.3);

  transform: rotate(2deg);
}

.wave-two {
  bottom: -95px;

  background: #f5f9ff;

  transform: rotate(-2deg);
}


/* =========================================================
   CONTENT
========================================================= */

.content-section {
  position: relative;

  max-width: 900px;

  margin: 0 auto;

  padding: 25px 24px 10px;
}


/* =========================================================
   WELCOME
========================================================= */

.welcome-section {
  margin-bottom: 20px;
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;

  color: #12345b;
}

.welcome-subtitle {
  margin-top: 3px;

  font-size: 14px;

  color: #78909c;
}


/* =========================================================
   MENU GRID
========================================================= */

.menu-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 16px;
}


/* =========================================================
   MENU CARD
========================================================= */

.menu-card {
  border-radius: 18px;

  border: 1px solid #e4edf7;

  background: white;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  box-shadow:
    0 5px 18px rgba(23, 76, 130, 0.06);
}

.menu-card:hover {
  transform: translateY(-3px);

  border-color: #bbdefb;

  box-shadow:
    0 10px 25px rgba(21, 101, 192, 0.13);
}

.menu-card:active {
  transform: scale(0.98);
}

.menu-card-content {
  min-height: 120px;

  padding: 18px;

  display: flex;
  align-items: center;
}


/* =========================================================
   MENU ICON
========================================================= */

.menu-icon {
  width: 64px;
  height: 64px;

  min-width: 64px;

  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  margin-right: 15px;
}


/* =========================================================
   MENU TEXT
========================================================= */

.menu-information {
  flex: 1;

  min-width: 0;
}

.menu-title {
  font-size: 17px;
  font-weight: 700;

  color: #102a43;
}

.menu-description {
  margin-top: 5px;

  font-size: 13px;
  line-height: 1.4;

  color: #78909c;
}

.menu-arrow {
  margin-left: 5px;
}


/* =========================================================
   FOOTER DECORATION
========================================================= */

.footer-decoration {
  margin-top: 45px;

  height: 80px;

  display: flex;
  justify-content: center;
  align-items: flex-end;

  overflow: hidden;
}

.footer-icons {
  color: #d7eaff;

  display: flex;
  align-items: flex-end;
}

.footer-icons .q-icon:nth-child(1),
.footer-icons .q-icon:nth-child(5) {
  font-size: 50px;
}

.footer-icons .q-icon:nth-child(2),
.footer-icons .q-icon:nth-child(4) {
  font-size: 65px;
}

.footer-icons .q-icon:nth-child(3) {
  font-size: 95px;
}


/* =========================================================
   FOOTER
========================================================= */

.footer-section {
  padding: 25px 20px 30px;

  text-align: center;

  color: white;

  background:
    linear-gradient(
      135deg,
      #0d47a1,
      #1565c0,
      #1976d2
    );
}

.footer-title {
  font-size: 15px;
  font-weight: 500;
}

.footer-subtitle {
  margin-top: 5px;

  font-size: 11px;

  letter-spacing: 4px;

  opacity: 0.85;
}

.footer-copyright {
  margin-top: 12px;

  font-size: 11px;

  opacity: 0.65;
}


/* =========================================================
   LOGOUT DIALOG
========================================================= */

.logout-dialog {
  width: 340px;

  max-width: 90vw;

  border-radius: 20px;
}

.dialog-icon {
  width: 65px;
  height: 65px;

  margin: auto;

  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  color: #1565c0;

  background: #e3f2fd;
}

.dialog-button {
  min-width: 110px;

  border-radius: 9px;
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {

  .hero-section {
    min-height: 300px;

    padding:
      25px
      20px
      75px;
  }

  .logout-wrapper {
    top: 18px;
    right: 16px;
  }

  .logout-btn {
    font-size: 12px;

    padding: 4px 10px;
  }

  .hero-content {
    margin-top: 65px;

    align-items: flex-start;
  }

  .logo-wrapper {
    width: 70px;
    height: 70px;

    min-width: 70px;

    margin-right: 15px;

    border-radius: 18px;
  }

  .logo-wrapper .q-icon {
    font-size: 42px !important;
  }

  .hero-small {
    font-size: 12px;

    letter-spacing: 1.5px;
  }

  .hero-title {
    font-size: 27px;
  }

  .hero-subtitle {
    font-size: 13px;

    letter-spacing: 2.5px;
  }

  .hero-description {
    font-size: 12px;

    margin-top: 10px;
  }

  .village-decoration {
    right: -15px;

    bottom: 40px;
  }

  .content-section {
    padding:
      20px
      14px
      5px;
  }

  .welcome-title {
    font-size: 19px;
  }

  .welcome-subtitle {
    font-size: 12px;
  }

  .menu-grid {
    gap: 10px;
  }

  .menu-card {
    border-radius: 15px;
  }

  .menu-card-content {
    min-height: 135px;

    padding: 14px;

    flex-direction: column;

    justify-content: center;

    text-align: center;
  }

  .menu-icon {
    width: 54px;
    height: 54px;

    min-width: 54px;

    margin:
      0
      0
      10px;
  }

  .menu-icon .q-icon {
    font-size: 26px !important;
  }

  .menu-title {
    font-size: 15px;
  }

  .menu-description {
    font-size: 11px;
  }

  .menu-arrow {
    display: none;
  }
}


/* =========================================================
   VERY SMALL MOBILE
========================================================= */

@media (max-width: 360px) {

  .hero-title {
    font-size: 23px;
  }

  .hero-subtitle {
    font-size: 11px;

    letter-spacing: 2px;
  }

  .hero-description {
    display: none;
  }

  .menu-card-content {
    min-height: 125px;

    padding: 10px;
  }

  .menu-title {
    font-size: 14px;
  }

  .menu-description {
    font-size: 10px;
  }
}
</style>
