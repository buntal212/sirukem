<template>
  <router-view />

  <q-dialog v-model="dialogInstall" persistent>
    <q-card class="pwa-dialog">
      <q-card-section class="text-center q-pt-lg">
        <q-avatar size="62px" color="primary" text-color="white" icon="install_mobile" />
        <div class="text-h6 text-weight-bold q-mt-md">Pasang SI RUKEM</div>
        <div class="text-grey-7 q-mt-sm">
          Tambahkan aplikasi ke layar utama agar lebih cepat dibuka seperti aplikasi biasa.
        </div>
      </q-card-section>

      <q-card-section v-if="perangkatIos" class="q-pt-none text-center text-grey-8">
        Tekan ikon <q-icon name="ios_share" color="primary" /> <b>Bagikan</b>, lalu pilih
        <b>Tambah ke Layar Utama</b>.
      </q-card-section>

      <q-card-actions align="right" class="q-px-lg q-pb-lg">
        <q-btn flat no-caps color="grey-7" label="Nanti saja" @click="tutupDialogInstall" />
        <q-btn
          v-if="promptInstall"
          unelevated
          no-caps
          color="primary"
          icon="install_mobile"
          label="Pasang"
          :loading="memasang"
          @click="pasangAplikasi"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogPembaruan" persistent>
    <q-card class="pwa-dialog">
      <q-card-section class="text-center q-pt-lg">
        <q-avatar size="62px" color="positive" text-color="white" icon="system_update" />
        <div class="text-h6 text-weight-bold q-mt-md">Pembaruan tersedia</div>
        <div class="text-grey-7 q-mt-sm">
          Versi terbaru aplikasi sudah siap. Tekan muat ulang untuk memakai pembaruan.
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-px-lg q-pb-lg">
        <q-btn flat no-caps color="grey-7" label="Nanti saja" @click="dialogPembaruan = false" />
        <q-btn
          unelevated
          no-caps
          color="positive"
          icon="refresh"
          label="Muat ulang"
          :loading="memuatUlang"
          @click="muatUlangAplikasi"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const dialogInstall = ref(false)
const dialogPembaruan = ref(false)
const promptInstall = ref(null)
const perangkatIos = ref(false)
const memasang = ref(false)
const memuatUlang = ref(false)
let registrasiPembaruan = null

const sudahTerpasang = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

const tampilkanDialogInstallJikaPerlu = () => {
  const diHalamanLogin = route.name === 'login'
  const tersediaUntukDiinstal = Boolean(promptInstall.value) || perangkatIos.value

  dialogInstall.value = diHalamanLogin && tersediaUntukDiinstal && !sudahTerpasang()
}

const handleSebelumInstall = (event) => {
  event.preventDefault()
  promptInstall.value = event

  tampilkanDialogInstallJikaPerlu()
}

const handlePembaruanTersedia = (event) => {
  registrasiPembaruan = event.detail
  dialogPembaruan.value = true
}

const tutupDialogInstall = () => {
  dialogInstall.value = false
}

const pasangAplikasi = async () => {
  if (!promptInstall.value) return

  memasang.value = true
  try {
    await promptInstall.value.prompt()
    await promptInstall.value.userChoice
    promptInstall.value = null
    dialogInstall.value = false
  } finally {
    memasang.value = false
  }
}

const muatUlangAplikasi = async () => {
  memuatUlang.value = true
  try {
    await registrasiPembaruan?.update()
  } finally {
    window.location.reload()
  }
}

onMounted(() => {
  const perangkatAndroid =
    /Android/i.test(window.navigator.userAgent) ||
    window.navigator.userAgentData?.platform === 'Android'
  perangkatIos.value =
    !perangkatAndroid && /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream

  window.addEventListener('beforeinstallprompt', handleSebelumInstall)
  window.addEventListener('pwa-pembaruan-tersedia', handlePembaruanTersedia)

  if (window.pwaUpdateRegistration) {
    handlePembaruanTersedia({ detail: window.pwaUpdateRegistration })
  }

  tampilkanDialogInstallJikaPerlu()
})

watch(
  () => route.name,
  () => tampilkanDialogInstallJikaPerlu(),
)

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleSebelumInstall)
  window.removeEventListener('pwa-pembaruan-tersedia', handlePembaruanTersedia)
})
</script>

<style scoped>
.pwa-dialog {
  width: 360px;
  max-width: calc(100vw - 32px);
  border-radius: 20px;
}
</style>
