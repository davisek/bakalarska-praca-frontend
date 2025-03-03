<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import {useAuthStore} from "@/utils/authStore.ts";

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
</script>

<template>
  <transition name="fade">
    <div
        v-if="isOpen"
        class="fixed inset-0 bg-gray-800 text-gray-300 z-40 flex flex-col items-center pt-32 space-y-8"
    >
      <div v-if="authStore.isAuthenticated" class="mb-6">
        <Menu as="div" class="relative">
          <div>
            <MenuButton class="relative flex rounded-full bg-gray-800 text-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
              <span class="sr-only">Open user menu</span>
              <img
                  class="h-12 w-12 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
              />
            </MenuButton>
          </div>
            <MenuItems class="text-center absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-box ring-1 ring-black/5 focus:outline-none">
              <MenuItem v-slot="{ active }">
                <router-link @click="closeMenu" to="/profile" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Your Profile</router-link>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <router-link @click="closeMenu" to="/settings" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Settings</router-link>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button @click="authStore.logout()" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 w-full']">Sign out</button>
              </MenuItem>
            </MenuItems>
        </Menu>
      </div>
      <div v-else class="flex gap-4 justify-center items-center mb-6">
        <div class="rounded-lg py-2 px-4 bg-gradient-to-tr from-purple-600 to-purple-300 shadow-glow mx-auto flex items-center justify-center animate-pulse-glow">
          <router-link @click="closeMenu" to="/login">Login</router-link>
        </div>
      </div>

      <router-link to="/dashboard"
                   :class="{ 'text-purple-500': route.path.includes('/dashboard') }"
                   @click="closeMenu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      </router-link>

      <router-link to="/groups"
                   :class="{ 'text-purple-500': route.path.includes('/groups') }"
                   @click="closeMenu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
        </svg>
      </router-link>

      <router-link to="/statistics"
                   :class="{ 'text-purple-500': route.path.includes('/statistics') }"
                   @click="closeMenu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      </router-link>

      <button
          class="gap-4 mt-12 px-4 py-2 bg-gray-700 rounded hover:bg-gray-500"
          @click="closeMenu"
      >
        Close Menu
      </button>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>