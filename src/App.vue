<script setup lang="ts">
import ANavbar from "@/components/a-navbar.vue";
import {ref} from "vue";
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/vue";

const isMobileMenuOpen = ref(false);
const isAuthenticated = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

function login() {
  isAuthenticated.value = true;
}

function logout() {
  isAuthenticated.value = false;
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <div class="hidden lg:block sticky top-0 h-screen w-1/6 bg-gray-800 text-gray-300">
      <ANavbar />
    </div>

    <!-- Hamburger menu -->
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
    <transition name="fade">
      <div
          v-if="isMobileMenuOpen"
          class="fixed inset-0 bg-gray-800 text-gray-300 z-40 flex flex-col items-center pt-32 space-y-8"
      >
        <Menu v-if="isAuthenticated" as="div" class="relative">
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
          <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
            <MenuItems class="text-center absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-box ring-1 ring-black/5 focus:outline-none">
              <MenuItem v-slot="{ active }">
                <router-link to="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Your Profile</router-link>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <router-link to="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Settings</router-link>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button @click="logout()" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 w-full']">Sign out</button>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
        <div v-else-if="!isAuthenticated" class="flex gap-4 justify-center items-center">
          <div class="transition-transform duration-300 hover:scale-105 rounded-lg hover:bg-purple-600 shadow-box">
            <button class="py-2 px-4"
                    @click="login()"
            >
              Login
            </button>
          </div>
          <div class="transition-transform duration-300 hover:scale-105 rounded-lg hover:bg-purple-600 shadow-box">
            <button class="py-2 px-4"
                    @click="login()"
            >
              Register
            </button>
          </div>
        </div>
        <router-link to="/dashboard"
                     :class="{ 'hover:text-purple-600 text-purple-500 border-b-2 border-b-purple-500': $route.path.includes('/dashboard') }"
                     @click="isMobileMenuOpen = false
        ">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </router-link>
        <router-link to="/groups"
                     :class="{ 'hover:text-purple-600 text-purple-500 border-b-2 border-b-purple-500': $route.path.includes('/groups') }"
                     @click="isMobileMenuOpen = false
        ">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
          </svg>
        </router-link>
        <router-link to="/statistics"
                     :class="{ 'hover:text-purple-600 text-purple-500 border-b-2 border-b-purple-500': $route.path.includes('/statistics') }"
                     @click="isMobileMenuOpen = false
        ">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </router-link>
        <button
            class="mt-4 px-4 py-2 bg-purple-500 rounded hover:bg-purple-600"
            @click="isMobileMenuOpen = false"
        >
          Close Menu
        </button>
      </div>
    </transition>

    <!-- Main content -->
    <div class="lg:w-5/6 w-full p-10 min-h-100 gradient-background text-gray-100 bg-cover">
      <router-view />
    </div>
  </div>
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
