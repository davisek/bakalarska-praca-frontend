<script setup lang="ts">
import AAdminNavbar from './a-admin-nav.vue';
import ANotification from '@/components/a-notification.vue';
import { ref, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import i18n from '@/plugins/i18n';

const { t } = useI18n();
const isMobileMenuOpen = ref(false);

const toggleMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

onBeforeMount(() => {
  const storedLocale = localStorage.getItem('preferred_locale');
  if (storedLocale) {
    i18n.global.locale = storedLocale;
  }
});
</script>

<template>
  <div class="flex min-h-screen gradient-background text-gray-100">
    <div class="hidden lg:block sticky top-0 h-screen w-1/6 bg-gray-800 text-gray-300 border-r border-gray-700/50">
      <AAdminNavbar />
    </div>

    <div class="lg:hidden fixed z-50 bg-gray-800 text-gray-300 w-full p-4 flex justify-between items-center border-b border-purple-600/30">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600">
          <i class="pi pi-shield text-white"></i>
        </div>
        <h1 class="text-xl font-bold text-white">{{ t('admin.panel') }}</h1>
      </div>

      <button @click="toggleMenu" class="p-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
        <i class="pi pi-bars"></i>
      </button>
    </div>

    <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        @click="closeMobileMenu"
    ></div>

    <div
        :class="[
          'fixed top-0 right-0 h-screen w-4/5 max-w-xs bg-gray-800 z-50 transform transition-transform duration-300 lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        ]"
    >
      <div class="p-4 flex justify-end">
        <button @click="closeMobileMenu" class="p-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="h-full overflow-hidden">
        <AAdminNavbar />
      </div>
    </div>

    <div class="lg:w-5/6 w-full lg:pt-0 pt-20 min-h-screen">
      <ANotification position="top-right" />
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.gradient-background {
  background: rgb(17,24,39);
  background: -moz-linear-gradient(138deg, rgba(17,24,39,1) 0%, rgba(21,26,47,1) 53%, rgba(29,30,60,1) 79%, rgba(38,35,76,1) 100%);
  background: -webkit-linear-gradient(138deg, rgba(17,24,39,1) 0%, rgba(21,26,47,1) 53%, rgba(29,30,60,1) 79%, rgba(38,35,76,1) 100%);
  background: linear-gradient(138deg, rgba(17,24,39,1) 0%, rgba(21,26,47,1) 53%, rgba(29,30,60,1) 79%, rgba(38,35,76,1) 100%);
}
</style>