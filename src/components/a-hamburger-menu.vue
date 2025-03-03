<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from "@/utils/authStore.ts";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const closeMenu = () => {
  emit('close');
};

const navigate = (path: string) => {
  router.push(path);
  closeMenu();
};

const isActive = (path: string) => {
  return route.path.includes(path);
};
</script>

<template>
  <transition name="slide">
    <div v-if="isOpen" class="mobile-menu">
      <div class="menu-header">
        <h1 class="app-title">SensorDataApp</h1>
        <button @click="closeMenu" class="close-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="user-section">
        <div v-if="authStore.isAuthenticated" class="profile-container">
          <div class="avatar">
            <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User profile"
                class="avatar-img"
            />
          </div>
          <div class="profile-actions">
            <button @click="navigate('/profile')" class="profile-btn">Profile</button>
            <button @click="navigate('/settings')" class="profile-btn">Settings</button>
            <button @click="authStore.logout" class="logout-btn">Sign out</button>
          </div>
        </div>
        <div v-else class="login-container">
          <button @click="navigate('/login')" class="login-btn">Login</button>
          <button @click="navigate('/register')" class="register-btn">Register</button>
        </div>
      </div>

      <nav class="nav-links">
        <button
            @click="navigate('/dashboard')"
            :class="['nav-item', { 'active': isActive('/dashboard') }]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span>Dashboard</span>
        </button>

        <button
            @click="navigate('/groups')"
            :class="['nav-item', { 'active': isActive('/groups') }]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
          </svg>
          <span>Groups</span>
        </button>

        <button
            @click="navigate('/statistics')"
            :class="['nav-item', { 'active': isActive('/statistics') }]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          <span>Statistics</span>
        </button>
      </nav>
    </div>
  </transition>

  <transition name="fade">
    <div v-if="isOpen" class="menu-backdrop" @click="closeMenu"></div>
  </transition>
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

.menu-header {
  @apply flex justify-between items-center mb-8 pb-4 border-b border-white/10;
}

.app-title {
  @apply text-2xl font-bold text-white;
}

.close-button {
  @apply text-gray-300 bg-gray-700 rounded-md p-2;
  @apply transition-colors duration-200;
}

.close-button:hover {
  @apply bg-gray-600 text-white;
}

.user-section {
  @apply mb-8;
}

.profile-container {
  @apply flex flex-col items-center gap-4;
}

.avatar {
  @apply w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500/50;
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.3);
}

.avatar-img {
  @apply w-full h-full object-cover;
}

.profile-actions {
  @apply flex flex-wrap justify-center gap-2 w-full;
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

.login-container {
  @apply flex flex-col gap-3;
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

.nav-links {
  @apply flex flex-col gap-4 mt-4;
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

.nav-icon {
  @apply w-6 h-6;
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  @apply transition-transform duration-300 ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  @apply translate-x-full;
}

.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300 ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
</style>