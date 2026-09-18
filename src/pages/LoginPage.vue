```vue
<template>
  <q-page class="login-page">
    <div class="login-container">
      <!-- BRANDING -->
      <div class="brand-section">
        <div class="logo-wrapper">
          <q-icon name="location_city" size="52px" color="white" />
        </div>

        <div class="app-title">DESA ROWO LECES</div>

        <div class="app-subtitle">Sistem Informasi Desa</div>
      </div>

      <!-- WELCOME -->
      <div class="welcome-section">
        <div class="welcome-title">Selamat Datang</div>

        <div class="welcome-subtitle">Silakan login untuk melanjutkan</div>
      </div>

      <!-- FORM -->
      <q-form class="login-form" @submit.prevent="login">
        <!-- USERNAME -->
        <q-input
          v-model="form.username"
          outlined
          dark
          color="white"
          label-color="white"
          label="Username"
          autocomplete="username"
          class="login-input"
        >
          <template #prepend>
            <q-icon name="person_outline" color="white" />
          </template>
        </q-input>

        <!-- PASSWORD -->
        <q-input
          v-model="form.password"
          outlined
          dark
          color="white"
          label-color="white"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          class="login-input q-mt-md"
        >
          <template #prepend>
            <q-icon name="lock_outline" color="white" />
          </template>

          <template #append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              color="white"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <!-- LUPA PASSWORD -->
        <div class="forgot-wrapper">
          <q-btn
            flat
            no-caps
            dense
            color="white"
            label="Lupa password?"
            class="forgot-btn"
            @click="forgotPassword"
          />
        </div>

        <!-- LOGIN BUTTON -->
        <q-btn
          type="submit"
          unelevated
          no-caps
          class="login-btn full-width"
          :loading="loading"
          label="Login"
        />
      </q-form>

      <!-- FOOTER -->
      <div class="footer">
        <div>© {{ currentYear }} Desa Rowo Leces</div>

        <div class="footer-company">CV. UDUMBARA INFORMATIKA</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { LocalStorage, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from '@/boot/axios'

const $q = useQuasar()
const router = useRouter()

const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const currentYear = computed(() => new Date().getFullYear())

const login = async () => {
  if (!form.username || !form.password) {
    $q.notify({
      type: 'warning',
      message: 'Username dan password wajib diisi',
      position: 'top',
    })

    return
  }

  loading.value = true

  try {
    const response = await api.post('/v1/login', {
      username: form.username,
      password: form.password,
    })

    const data = response.data

    console.log('LOGIN RESPONSE:', data)

    // Response backend kita:
    // data.data.access_token
    // data.data.user

    const token = data.data.access_token
    const user = data.data.user

    // Simpan token Sanctum
    LocalStorage.set('auth_token', token)

    // Simpan data user
    LocalStorage.set('auth_user', user)

    $q.notify({
      type: 'positive',
      message: data.message || 'Login berhasil',
      position: 'top',
    })

    // Ganti sesuai route dashboard bro
    await router.push('/')
  } catch (error) {
    console.error('LOGIN ERROR:', error)

    let message = 'Login gagal. Periksa username dan password.'

    if (error.response?.data?.message) {
      message = error.response.data.message
    }

    if (error.response?.data?.errors?.username) {
      message = error.response.data.errors.username[0]
    }

    $q.notify({
      type: 'negative',
      message,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const forgotPassword = () => {
  $q.notify({
    message: 'Silakan hubungi administrator Desa R﻿owo Leces',
    position: 'top',
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;

  background:
    radial-gradient(circle at 85% 15%, rgba(38, 117, 255, 0.45) 0%, rgba(38, 117, 255, 0) 32%),
    radial-gradient(circle at 10% 90%, rgba(0, 180, 255, 0.22) 0%, rgba(0, 180, 255, 0) 35%),
    linear-gradient(160deg, #083a98 0%, #052f82 45%, #031d59 100%);

  display: flex;
  justify-content: center;
}

.login-container {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;

  display: flex;
  flex-direction: column;

  padding: max(38px, env(safe-area-inset-top)) 28px max(22px, env(safe-area-inset-bottom));

  color: white;
}

/* =====================================
   BRAND
===================================== */

.brand-section {
  text-align: center;
  padding-top: 4vh;
}

.logo-wrapper {
  width: 88px;
  height: 88px;

  margin: 0 auto 16px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 26px;

  background: linear-gradient(135deg, #18d8ff, #1678ff);

  box-shadow:
    0 14px 35px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.25);
}

.app-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 1px;
}

.app-subtitle {
  margin-top: 4px;

  font-size: 13px;
  font-weight: 400;

  color: rgba(255, 255, 255, 0.72);
}

/* =====================================
   WELCOME
===================================== */

.welcome-section {
  text-align: center;

  margin-top: 55px;
  margin-bottom: 32px;
}

.welcome-title {
  font-size: 28px;
  line-height: 1.2;
  font-weight: 800;
}

.welcome-subtitle {
  margin-top: 8px;

  font-size: 14px;

  color: rgba(255, 255, 255, 0.72);
}

/* =====================================
   FORM
===================================== */

.login-form {
  width: 100%;
}

.login-input :deep(.q-field__control) {
  min-height: 58px;

  border-radius: 13px;

  background: rgba(255, 255, 255, 0.07);
}

.login-input :deep(.q-field__control::before) {
  border-color: rgba(255, 255, 255, 0.35);
}

.login-input :deep(.q-field__control:hover::before) {
  border-color: rgba(255, 255, 255, 0.65);
}

.login-input :deep(.q-field__native) {
  color: white;
}

.login-input :deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.8);
}

.login-input :deep(.q-field__prepend) {
  padding-right: 12px;
}

/* =====================================
   FORGOT PASSWORD
===================================== */

.forgot-wrapper {
  display: flex;
  justify-content: flex-end;

  margin-top: 8px;
  margin-bottom: 18px;
}

.forgot-btn {
  font-size: 13px;
  opacity: 0.85;
}

/* =====================================
   LOGIN BUTTON
===================================== */

.login-btn {
  height: 58px;

  border-radius: 13px;

  background: white;
  color: #07368e;

  font-size: 16px;
  font-weight: 800;

  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.login-btn:hover {
  background: #f5f8ff;
}

/* =====================================
   FOOTER
===================================== */

.footer {
  margin-top: auto;

  padding-top: 28px;

  text-align: center;

  font-size: 11px;

  color: rgba(255, 255, 255, 0.55);
}

.footer-company {
  margin-top: 4px;

  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.7px;

  color: rgba(255, 255, 255, 0.8);
}

/* =====================================
   HP KECIL
===================================== */

@media (max-height: 700px) {
  .brand-section {
    padding-top: 0;
  }

  .logo-wrapper {
    width: 68px;
    height: 68px;
    border-radius: 20px;
  }

  .logo-wrapper .q-icon {
    font-size: 40px !important;
  }

  .welcome-section {
    margin-top: 25px;
    margin-bottom: 22px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .login-input :deep(.q-field__control) {
    min-height: 52px;
  }

  .login-btn {
    height: 52px;
  }

  .footer {
    padding-top: 15px;
  }
}

/* =====================================
   DESKTOP
===================================== */

@media (min-width: 600px) {
  .login-page {
    align-items: center;
  }

  .login-container {
    min-height: 760px;
    max-height: 900px;
  }
}
</style>
```
