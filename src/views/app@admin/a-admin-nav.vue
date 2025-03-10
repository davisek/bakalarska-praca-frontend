<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/utils/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isActive = (path: string) => {
  return route.path.includes(path);
};

const navItems = [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    route: '/admin',
    exact: true
  },
  {
    label: 'Users Management',
    icon: 'pi pi-users',
    route: '/admin/users'
  },
  {
    label: 'Sensors Management',
    icon: 'pi pi-tablet',
    route: '/admin/sensors'
  },
];

const goToMainDashboard = () => {
  router.push('/dashboard');
};

const currentUser = computed(() => {
  if (!authStore.user) return null;
  return authStore.user;
});
</script>

<template>
  <div class="admin-navbar h-full flex flex-col">
    <div class="border-b border-gray-700 p-6">
      <div class="flex items-center mb-4">
        <div class="shadow-lg p-2 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 mr-3">
          <i class="pi pi-shield text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-white">Admin Panel</h1>
          <p class="text-sm text-gray-400">Sensor Data Management</p>
        </div>
      </div>

      <div class="flex items-center mt-4">
        <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
          <i class="pi pi-user text-purple-400"></i>
        </div>
        <div class="flex-1 overflow-hidden">
          <p class="text-white font-medium truncate">{{ currentUser?.name }} {{ currentUser?.surname }}</p>
          <p class="text-xs text-gray-400">Administrator</p>
        </div>
      </div>
    </div>

    <div class="flex-1 p-4 overflow-y-auto">
      <ul class="space-y-2">
        <li v-for="item in navItems" :key="item.route">
          <router-link
              :to="item.route"
              class="flex items-center px-4 py-3 rounded-lg text-gray-300 transition-colors"
              :class="[
              'nav-item',
              { 'active': isActive(item.route) && (item.exact ? route.path === item.route : true) }
            ]"
          >
            <i :class="[item.icon, 'mr-3']"></i>
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="p-4 border-t border-gray-700">
      <button
          @click="goToMainDashboard"
          class="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-300 transition-colors"
      >
        <i class="pi pi-arrow-left mr-2"></i>
        <span>Back to App</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.nav-item:hover {
  @apply bg-gray-700 text-white;
}

.nav-item.active {
  @apply bg-purple-900/30 text-purple-300 font-medium border-l-2 border-purple-500;
}
</style>