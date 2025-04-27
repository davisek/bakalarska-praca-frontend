<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosInstance from "@/plugins/axios";
import { useAuthStore } from "@/utils/authStore.ts";
import Menu from 'primevue/menu';
import AThemeLanguageButtons from '@/components/a-theme-language-buttons.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const groups = ref([]);
const authStore = useAuthStore();
const menu = ref(null);
const emit = defineEmits(['open-profile', 'open-settings']);

const isActive = (path: string) => {
  return route.path.includes(path);
};

const toggleMenu = (event) => {
  menu.value.toggle(event);
};

const openProfile = () => {
  emit('open-profile');
  menu.value.hide();
};

const openSettings = () => {
  emit('open-settings');
  menu.value.hide();
};


const logout = () => {
  authStore.logout();
  menu.value.hide();
};

const menuItems = computed(() => [
  {
    label: t('profile.profileInfo'),
    icon: 'pi pi-user',
    command: () => openProfile()
  },
  {
    label: t('common.settings'),
    icon: 'pi pi-cog',
    command: () => openSettings()
  },
  {
    separator: true
  },
  {
    label: t('common.logout'),
    icon: 'pi pi-sign-out',
    command: () => logout()
  }
]);

const fetchGroups = async () => {
  try {
    const response = await axiosInstance.get('/sensor-groups');
    groups.value = response;
  } catch (err) {
    console.error('Failed to load groups:', err);
  }
};

const goToAdminPanel = () => {
  router.push('/admin');
};

onMounted(() => {
  fetchGroups();
});
</script>

<template>
  <div class="navbar-container">
    <div class="navbar-header">
      <div class="settings-section mb-4">
        <AThemeLanguageButtons />
      </div>

      <div class="logo-container">
        <div class="logo-icon shadow-glow animate-pulse-glow pulse-subtle">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
          </svg>
        </div>
        <h1 class="logo-text">{{ t('nav.appTitle') }}</h1>
      </div>

      <div class="user-section">
        <div v-if="authStore.isAuthenticated" class="profile-menu">
          <Button
              @click="toggleMenu"
              severity="help"
              :aria-label="t('nav.userMenu')"
              aria-haspopup="true"
              aria-controls="overlay_menu"
          >
            <template #icon>
              <i class="pi pi-list" style="font-size: 1.2rem; padding: 2px"></i>
            </template>
          </Button>
          <Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" />
        </div>
        <router-link v-else to="/login" class="login-button shadow-glow animate-pulse-glow pulse-subtle">
          {{ t('common.login') }}
        </router-link>
      </div>
    </div>

    <div class="nav-links">
      <router-link to="/dashboard" :class="['nav-item', { 'active': isActive('/dashboard') }]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        <span class="nav-text">{{ t('nav.dashboard') }}</span>
      </router-link>

      <router-link to="/groups" :class="['nav-item', { 'active': isActive('/groups') }]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
        </svg>
        <span class="nav-text">{{ t('nav.groups') }}</span>
      </router-link>

      <router-link to="/statistics" :class="['nav-item', { 'active': isActive('/statistics') }]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
        <span class="nav-text">{{ t('nav.statistics') }}</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.navbar-container {
  @apply flex flex-col h-full w-full bg-gray-800 text-gray-300 pt-6;
  background-image: linear-gradient(180deg, #1a202c, #1e293b);
  border-right: 1px solid rgba(75, 85, 99, 0.2);
}

.navbar-header {
  @apply px-6 mb-8 flex flex-col items-center;
}

.logo-container {
  @apply flex flex-col items-center mb-8;
}

.logo-icon {
  @apply bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-lg mb-2 ;
}

.logo-text {
  @apply text-xl font-bold text-white mt-2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.user-section {
  @apply mb-8 w-full flex justify-center;
}

.login-button {
  @apply bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-300;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.nav-links {
  @apply flex-grow flex flex-col items-center space-y-8 mt-8;
}

.nav-item {
  @apply flex flex-col items-center w-full py-3 px-3 transition-all duration-200 hover:bg-gray-700;
}

.nav-item.active {
  @apply bg-gray-700 text-purple-400 relative;
}

.nav-item.active::before {
  content: '';
  @apply absolute top-0 bottom-0 left-0 w-1 bg-purple-500 rounded-r-md;
}

.nav-icon {
  @apply w-6 h-6 mb-1;
}

.nav-text {
  @apply text-xs font-medium;
}
</style>