<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosInstance from "@/plugins/axios";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { useAuthStore } from "@/utils/authStore.ts";

const router = useRouter();
const route = useRoute();
const groups = ref([]);
const authStore = useAuthStore();

// Active section highlighting
const isActive = (path: string) => {
  return route.path.includes(path);
};

const fetchGroups = async () => {
  try {
    const response = await axiosInstance.get('/sensor-groups');
    groups.value = response;
  } catch (err) {
    console.error('Failed to load groups:', err);
  }
};

onMounted(() => {
  fetchGroups();
});
</script>

<template>
  <div class="navbar-container">
    <div class="navbar-header">
      <div class="logo-container">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
          </svg>
        </div>
        <h1 class="logo-text">SensorDataApp</h1>
      </div>

      <div class="user-section">
        <Menu v-if="authStore.isAuthenticated" as="div" class="profile-menu">
          <MenuButton class="profile-button">
            <div class="profile-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
          </MenuButton>
          <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-100" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
            <MenuItems class="dropdown-menu">
              <MenuItem v-slot="{ active }">
                <router-link to="/profile" :class="[active ? 'bg-gray-100' : '', 'dropdown-item']">Your Profile</router-link>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <router-link to="/settings" :class="[active ? 'bg-gray-100' : '', 'dropdown-item']">Settings</router-link>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button @click="authStore.logout" :class="[active ? 'bg-gray-100' : '', 'dropdown-item logout']">Sign out</button>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
        <router-link v-else to="/login" class="login-button">
          Login
        </router-link>
      </div>
    </div>

    <div class="nav-links">
      <router-link to="/dashboard" :class="['nav-item', { 'active': isActive('/dashboard') }]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        <span class="nav-text">Dashboard</span>
      </router-link>

      <router-link to="/groups" :class="['nav-item', { 'active': isActive('/groups') }]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
        </svg>
        <span class="nav-text">Groups</span>
      </router-link>

      <router-link to="/statistics" :class="['nav-item', { 'active': isActive('/statistics') }]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
        <span class="nav-text">Statistics</span>
      </router-link>
    </div>

  </div>
</template>

<style scoped>
.navbar-container {
  @apply flex flex-col h-full w-full bg-gray-800 text-gray-300 py-6;
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
  @apply bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-lg mb-2 shadow-glow animate-pulse-glow;
}

.logo-text {
  @apply text-xl font-bold text-white mt-2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.user-section {
  @apply mb-8 w-full flex justify-center;
}

.profile-menu {
  @apply relative;
}

.profile-button {
  @apply flex items-center justify-center rounded-full p-2 bg-gray-700 hover:bg-gray-600 transition-colors duration-200;
}

.profile-avatar {
  @apply w-8 h-8 text-gray-200;
}

.dropdown-menu {
  @apply absolute left-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none;
}

.dropdown-item {
  @apply block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:rounded-md;
}

.logout {
  @apply text-red-600 w-full text-left;
}

.login-button {
  @apply bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-md shadow-glow hover:from-purple-700 hover:to-indigo-700 transition-all duration-300;
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

.shadow-glow {
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
}

@keyframes pulse-subtle {
  0% { box-shadow: 0 0 10px rgba(124, 58, 237, 0.2); }
  50% { box-shadow: 0 0 15px rgba(124, 58, 237, 0.4); }
  100% { box-shadow: 0 0 10px rgba(124, 58, 237, 0.2); }
}

.animate-pulse-glow {
  animation: pulse-subtle 3s infinite;
}
</style>