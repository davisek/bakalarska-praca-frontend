<script setup lang="ts">
import ANavbar from "@/components/a-navbar.vue";
import {ref} from "vue";
import ANotification from "@/components/a-notification.vue";
import AHamburgerMenu from "@/components/a-hamburger-menu.vue";
import {useAuthStore} from "@/utils/authStore.ts";
import ASettingsModal from "@/views/app@settings/a-settings-modal.vue";

const isMobileMenuOpen = ref(false);
const isSettingsModalOpen = ref(false);
const activeSettingsTab = ref('notifications');
const authStore = useAuthStore();

const toggleMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const openSettingsModal = (tab = 'notifications') => {
  activeSettingsTab.value = tab;
  isSettingsModalOpen.value = true;
};

const closeSettingsModal = () => {
  isSettingsModalOpen.value = false;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

if (typeof window !== 'undefined') {
  window.openSettings = (tab = 'notifications') => {
    openSettingsModal(tab);
  };
}

const openProfileSettings = () => openSettingsModal('profile');
const openNotificationSettings = () => openSettingsModal('notifications');
</script>

<template>
  <div class="flex min-h-screen">
    <div class="hidden lg:block sticky top-0 h-screen w-1/6 bg-gray-800 text-gray-300">
      <ANavbar
          @open-profile="openProfileSettings"
          @open-settings="openNotificationSettings"
      />
    </div>

    <div class="lg:hidden fixed z-50 bg-gray-800 text-gray-300 w-full p-4 flex justify-between items-center border-b-cyan-300 border-b">
      <div class="logo-container">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="logo-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
        </svg>
        <h1 class="logo-text">SensorDataApp</h1>
      </div>

      <button @click="toggleMenu" class="menu-button">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="menu-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </div>

    <AHamburgerMenu
        :is-open="isMobileMenuOpen"
        @close="closeMobileMenu"
        @open-profile="openProfileSettings"
        @open-settings="openNotificationSettings"
    />

    <ANotification position="top-right" />

    <div class="lg:w-5/6 w-full lg:p-10 p-4 lg:pt-10 pt-24 min-h-100 gradient-background text-gray-100 bg-cover">
      <router-view />
    </div>
  </div>

  <ASettingsModal
      :is-open="isSettingsModalOpen"
      :initial-tab="activeSettingsTab"
      @close="closeSettingsModal"
  />
</template>

<style scoped>
.logo-container {
  @apply flex items-center gap-3;
}

.logo-icon {
  @apply w-7 h-7 text-purple-500;
}

.logo-text {
  @apply text-xl font-bold text-white;
}

.menu-button {
  @apply flex justify-center items-center w-10 h-10 rounded-md bg-gray-700 text-gray-300;
  @apply transition-colors duration-200 ease-in-out;
}

.menu-button:hover {
  @apply bg-gray-600 text-white;
}

.menu-icon {
  @apply w-6 h-6;
}
</style>