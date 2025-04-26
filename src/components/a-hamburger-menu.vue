<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from "@/utils/authStore.ts";
import AThemeLanguageButtons from '@/components/a-theme-language-buttons.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'open-profile', 'open-settings']);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

function closeMenu() {
  emit('close');
}

function navigate(path: string) {
  router.push(path);
  closeMenu();
}

function openProfile() {
  emit('open-profile');
  closeMenu();
}

function openSettings() {
  emit('open-settings');
  closeMenu();
}

function isActive(path: string) {
  return route.path.includes(path);
}
</script>

<template>
  <div v-if="isOpen" class="mobile-menu">
    <div class="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
      <h1 class="text-2xl font-bold text-white">{{ t('nav.appTitle') }}</h1>
      <Button
          icon="pi pi-times"
          @click="closeMenu"
          text
          rounded
          :aria-label="t('common.close')"
          class="p-2"
      />
    </div>

    <div class="mb-6 flex justify-center">
      <AThemeLanguageButtons />
    </div>

    <div class="mb-8">
      <div v-if="authStore.isAuthenticated" class="flex flex-col items-center gap-4">
        <div class="flex flex-wrap justify-center gap-2 w-full">
          <Button
              :label="t('common.profile')"
              icon="pi pi-user"
              iconPos="right"
              @click="openProfile"
              class="profile-btn"
              text
          />
          <Button
              :label="t('common.settings')"
              icon="pi pi-cog"
              iconPos="right"
              @click="openSettings"
              class="profile-btn"
              text
          />
          <Button
              :label="t('common.logout')"
              icon="pi pi-sign-out"
              iconPos="right"
              @click="authStore.logout"
              severity="danger"
              variant="outlined"
              class="w-full logout-btn"
          />
        </div>
      </div>

      <div v-else class="flex flex-col gap-3">
        <Button
            :label="t('common.login')"
            @click="navigate('/login')"
            severity="help"
            class="login-btn"
        />
        <Button
            :label="t('common.register')"
            @click="navigate('/register')"
            severity="help"
            outlined
            class="register-btn"
        />
      </div>
    </div>

    <nav class="flex flex-col gap-4 mt-4">
      <Button
          :label="t('nav.dashboard')"
          @click="navigate('/dashboard')"
          :class="['nav-item', { 'active': isActive('/dashboard') }]"
          severity="help"
          text
          class="justify-start"
      />

      <Button
          :label="t('nav.groups')"
          @click="navigate('/groups')"
          :class="['nav-item', { 'active': isActive('/groups') }]"
          severity="help"
          text
          class="justify-start"
      />

      <Button
          :label="t('nav.statistics')"
          @click="navigate('/statistics')"
          :class="['nav-item', { 'active': isActive('/statistics') }]"
          severity="help"
          text
          class="justify-start"
      />
    </nav>
  </div>

  <div v-if="isOpen" class="menu-backdrop" @click="closeMenu"></div>
</template>

<style scoped>
.mobile-menu {
  @apply fixed top-0 right-0 w-4/5 max-w-xs h-screen;
  @apply bg-gray-900 z-50 p-6 flex flex-col shadow-lg overflow-y-auto;
  background-image: linear-gradient(180deg, #1a202c, #1e293b);
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.3);
}

.menu-backdrop {
  @apply fixed inset-0 w-full h-full bg-black/50 z-40;
  backdrop-filter: blur(2px);
}

.close-button {
  @apply text-gray-300 bg-gray-700 rounded-md p-2;
  @apply transition-colors duration-200;
}

.close-button:hover {
  @apply bg-gray-600 text-white;
}

.profile-btn {
  @apply py-2 px-4 bg-gray-700 text-gray-200 rounded-md text-sm;
  @apply transition-colors duration-200;
}

.profile-btn:hover {
  @apply bg-gray-600;
}

.logout-btn {
  @apply py-2 px-4 mt-2 bg-red-700/20 text-red-400 rounded-md text-sm w-full;
  @apply border border-red-600/30 transition-colors duration-200;
}

.logout-btn:hover {
  @apply bg-red-700/30;
}

.login-btn {
  @apply py-3 text-white rounded-md font-medium text-center shadow-md;
  @apply transition-all duration-200;
  background: linear-gradient(to right, rgba(124, 58, 237, 0.8), rgba(99, 102, 241, 0.8));
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.3);
}

.login-btn:hover {
  @apply transform -translate-y-0.5;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
}

.register-btn {
  @apply py-3 bg-transparent text-purple-300 rounded-md font-medium text-center;
  @apply border border-purple-500/50 transition-colors duration-200;
}

.register-btn:hover {
  @apply bg-purple-500/10;
}

.nav-item {
  @apply flex items-center gap-4 p-4 rounded-lg bg-gray-700/50 text-gray-200 font-medium;
  @apply transition-colors duration-200 text-left w-full;
}

.nav-item:hover {
  @apply bg-gray-600/70;
}

.nav-item.active {
  @apply bg-purple-500/20 text-purple-200 border-l-2 border-purple-500;
}
</style>