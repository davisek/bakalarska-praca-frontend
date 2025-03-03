<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {useRoute, useRouter} from 'vue-router';
import axiosInstance from "@/plugins/axios";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {useAuthStore} from "@/utils/authStore.ts";

const router = useRouter();
const route = useRoute();
const groups = ref([]);
const authStore = useAuthStore();

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
  <div class="flex flex-col items-center p-10 text-center space-y-4">
    <div class="mb-10">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-14 m-auto">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
      </svg>
      <h1 class="text-2xl">SensorDataApp</h1>
    </div>

    <div class="flex flex-col items-center justify-center h-full gap-y-16">
      <Menu v-if="authStore.isAuthenticated" as="div" class="relative">
        <div>
          <MenuButton class="relative flex rounded-full bg-gray-800 text-lg hover:bg-gray-700 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 p-2">
            <span class="sr-only">Open user menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-9">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </MenuButton>
        </div>
        <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
          <MenuItems class="absolute -right-10 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-box ring-1 ring-black/5 focus:outline-none">
            <MenuItem v-slot="{ active }">
              <router-link to="/profile" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Your Profile</router-link>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <router-link to="/settings" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Settings</router-link>
            </MenuItem>
            <MenuItem v-slot="{ active }" class="w-full">
              <button @click="authStore.logout" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-red-700']">Sign out</button>
            </MenuItem>
          </MenuItems>
        </transition>
      </Menu>
      <div v-else class="rounded-lg py-2 px-4 bg-gradient-to-tr from-purple-600 to-purple-300 shadow-glow mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
        <router-link to="/login">Login</router-link>
      </div>

      <!-- Dashboard -->
      <div
          :class="{ 'text-purple-500': route.path.includes('/dashboard') }"
      >
        <router-link
            to="/dashboard"
            class="hover:text-purple-600 rounded-md px-3 py-2 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span class="ml-2 hidden lg:block">Dashboard</span>
        </router-link>
      </div>
      <!-- Groups -->
      <div
          :class="{ 'text-purple-500': route.path.includes('/groups') }"
      >
        <router-link
            to="/groups"
            class="hover:text-purple-600 rounded-md px-3 py-2 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
          </svg>
          <span class="ml-2 hidden lg:block">Groups</span>
        </router-link>
      </div>
      <!-- Statistics -->
      <div
          :class="{ 'text-purple-500': route.path.includes('/statistics') }"
      >
        <router-link
            to="/statistics"
            class="hover:text-purple-600 rounded-md px-3 py-2 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          <span class="ml-2 hidden lg:block">Statistics</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>