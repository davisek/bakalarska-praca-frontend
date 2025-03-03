<script setup lang="ts">
import ANavbar from "@/components/a-navbar.vue";
import {ref} from "vue";
import ANotification from "@/components/a-notification.vue";
import AHamburgerMenu from "@/components/a-hamburger-menu.vue";
import {useAuthStore} from "@/utils/authStore.ts";

const isMobileMenuOpen = ref(false);
const authStore = useAuthStore();

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <div class="flex min-h-screen">
    <div class="hidden lg:block sticky top-0 h-screen w-1/6 bg-gray-800 text-gray-300">
      <ANavbar />
    </div>

    <div class="lg:hidden fixed z-50 bg-gray-800 text-gray-300 w-full p-4 flex justify-between items-center border-b-cyan-300 border-b">
      <div class="px-4">
        <h1 class="text-lg font-bold">SensorDataApp</h1>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 m-auto">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
        </svg>
      </div>
      <button @click="toggleMobileMenu" class="p-2 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 6.75h15m-15 5.25h15m-15 5.25h15" />
        </svg>
      </button>
    </div>

    <AHamburgerMenu :is-open="isMobileMenuOpen" @close="closeMobileMenu" />

    <ANotification position="top-right" />

    <div class="lg:w-5/6 w-full p-10 min-h-100 gradient-background text-gray-100 bg-cover">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
</style>