<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from "@/utils/authStore.ts";

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);
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

function isActive(path: string) {
  return route.path.includes(path);
}
</script>

<template>
  <div v-if="isOpen" class="mobile-menu">
    <div class="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
      <h1 class="text-2xl font-bold text-white">SensorDataApp</h1>
      <button @click="closeMenu" class="close-button">✕</button>
    </div>

    <div class="mb-8">
      <div v-if="authStore.isAuthenticated" class="flex flex-col items-center gap-4">
        <div class="avatar">
          <img class="w-full h-full object-cover"
               src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&w=256&h=256&q=80"
               alt="User profile" />
        </div>
        <div class="flex flex-wrap justify-center gap-2 w-full">
          <button @click="navigate('/profile')" class="profile-btn">Profile</button>
          <button @click="navigate('/settings')" class="profile-btn">Settings</button>
          <button @click="authStore.logout" class="logout-btn">Sign out</button>
        </div>
      </div>

      <div v-else class="flex flex-col gap-3">
        <button @click="navigate('/login')" class="login-btn">Login</button>
        <button @click="navigate('/register')" class="register-btn">Register</button>
      </div>
    </div>

    <nav class="flex flex-col gap-4 mt-4">
      <button
          @click="navigate('/dashboard')"
          :class="['nav-item', { 'active': isActive('/dashboard') }]"
      >
        Dashboard
      </button>

      <button
          @click="navigate('/groups')"
          :class="['nav-item', { 'active': isActive('/groups') }]"
      >
        Groups
      </button>

      <button
          @click="navigate('/statistics')"
          :class="['nav-item', { 'active': isActive('/statistics') }]"
      >
        Statistics
      </button>
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

.avatar {
  @apply w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500/50;
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.3);
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