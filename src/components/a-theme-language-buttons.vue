<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/utils/authStore'
import axios from '@/plugins/axios'
import { showSuccess, showError } from '@/utils/notificationUtil'
import { useI18n } from 'vue-i18n'
import type { Enum, User } from '@/types'

const authStore = useAuthStore()
const i18n = useI18n()
const emit = defineEmits(['theme-changed', 'locale-changed'] as const)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const locales = ref<Enum[]>([])
const selectedLocale = ref(i18n.locale)
const isDark = ref<boolean>(false)
const loading = ref(false)

async function fetchUserProfile() {
  loading.value = true

  try {
    const updatedUser = await axios.get<User>('/user')
    authStore.user = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))

    selectedLocale.value = updatedUser.locale.value

    localStorage.setItem('preferred_locale', updatedUser.locale.value)
    axios.defaults.headers.common['Accept-Language'] = updatedUser.locale.value

    isDark.value = updatedUser.dark_mode

    document.documentElement.classList.toggle('dark-theme', isDark.value)
    document.documentElement.classList.toggle('light-theme', !isDark.value)
  } catch (err) {
    showError(i18n.t('user.fetchError'))
  } finally {
    loading.value = false
  }
}

async function fetchLocales() {
  loading.value = true
  try {
    const response = await axios.get<{ locales: Enum[] }>('/auth/locale')
    locales.value = response.locales
  } catch {
    showError(i18n.t('common.failedToLoad'))
  } finally {
    loading.value = false
  }
}

async function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark-theme', isDark.value)
  document.documentElement.classList.toggle('light-theme', !isDark.value)
  localStorage.setItem('preferred_theme', isDark.value ? 'dark' : 'light')
  emit('theme-changed', isDark.value)

  if (isAuthenticated.value) {
    try {
      await axios.put('/user', {
        ...authStore.user,
        dark_mode: isDark.value,
        locale: authStore.user.locale.value
      })
      await fetchUserProfile()
      showSuccess(i18n.t('theme.updated'))
    } catch {
      showError(i18n.t('theme.error'))
    }
  } else {
    showSuccess(i18n.t('theme.saved'))
  }
}

async function changeLocale(newLoc: string) {
  if (newLoc === selectedLocale.value) return

  const old = selectedLocale.value
  selectedLocale.value = newLoc

  localStorage.setItem('preferred_locale', newLoc)
  axios.defaults.headers.common['Accept-Language'] = newLoc
  emit('locale-changed', newLoc)

  if (isAuthenticated.value) {
    try {
      await axios.put('/user', {
        ...authStore.user,
        locale: newLoc
      })
      await fetchUserProfile()
      showSuccess(i18n.t('language.updated'))
    } catch {
      selectedLocale.value = old
      localStorage.setItem('preferred_locale', old)
      axios.defaults.headers.common['Accept-Language'] = old
      emit('locale-changed', old)
      showError(i18n.t('language.error'))
    }
  } else {
    showSuccess(i18n.t('language.saved'))
  }
}

onMounted(() => {
  fetchLocales()
  if (isAuthenticated.value) {
    fetchUserProfile()
  }

  const savedTheme = localStorage.getItem('preferred_theme')
  isDark.value = savedTheme === 'dark'
  document.documentElement.classList.toggle('dark-theme', isDark.value)
  document.documentElement.classList.toggle('light-theme', !isDark.value)

  const savedLoc = localStorage.getItem('preferred_locale')
  if (savedLoc) {
    selectedLocale.value = savedLoc
    axios.defaults.headers.common['Accept-Language'] = savedLoc
    emit('locale-changed', savedLoc)
  }
})
</script>

<template>
  <div class="flex gap-2 items-center">
    <Button
      :icon="isDark ? 'pi pi-moon' : 'pi pi-sun'"
      @click="toggleDark"
      :title="isDark ? i18n.t('theme.light') : i18n.t('theme.dark')"
      :disabled="loading"
      rounded
      text
    />

    <div class="flex gap-1">
      <Button
        v-for="loc in locales"
        :key="loc.value"
        @click="changeLocale(loc.value)"
        :class="{ 'local-border': selectedLocale === loc.value }"
        text
        rounded
      >
        <img
          v-if="loc.symbol"
          :src="loc.symbol"
          :alt="loc.label"
          class="w-5 h-5"
        />
        <span v-else>{{ loc.value.toUpperCase() }}</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.local-border {
  border: 2px solid var(--primary-color);
}
</style>