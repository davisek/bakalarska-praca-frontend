<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstance from '@/plugins/axios';
import ABreadcrumb from '@/components/a-breadcrumb.vue';
import {StatisticData} from "@/types";
import ALoadingScreen from "@/components/a-loading-screen.vue";

const router = useRouter();
const stats = ref<StatisticData>({
  total_users: 0,
  admin_users: 0,
  total_sensors: 0,
  new_users_today: 0,
  new_readings_today: 0
});

const isLoading = ref(true);

const fetchAdminStats = async () => {
  try {
    isLoading.value = true;
    const response = await axiosInstance.get('admin/statistics');
    stats.value = response;
  } catch (error) {
    console.error('Failed to load admin stats:', error);
  } finally {
    isLoading.value = false;
  }
};

const navigateTo = (path: string) => {
  router.push(path);
};

onMounted(() => {
  fetchAdminStats();
});
</script>

<template>
  <div class="lg:p-6 p-2">
    <ABreadcrumb />
    <ALoadingScreen :is-loading="isLoading" />

    <div class="p-6">
      <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 mb-6">
        Admin Dashboard
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="stat-card" @click="navigateTo('/admin/users')">
          <div class="icon-wrapper bg-blue-900/30 text-blue-400">
            <i class="pi pi-users text-2xl"></i>
          </div>
          <div>
            <h3 class="stat-label">Total Users</h3>
            <div class="stat-value">{{ stats.total_users }}</div>
            <div class="stat-info">
              <span class="text-green-400">+{{ stats.new_users_today }}</span> new today
            </div>
          </div>
        </div>

        <div class="stat-card" @click="navigateTo('/admin/users')">
          <div class="icon-wrapper bg-purple-900/30 text-purple-400">
            <i class="pi pi-shield text-2xl"></i>
          </div>
          <div>
            <h3 class="stat-label">Admin Users</h3>
            <div class="stat-value">{{ stats.admin_users }}</div>
            <div class="stat-info">
              <span class="text-gray-400">{{ ((stats.admin_users / stats.total_users) * 100).toFixed(1) }}%</span> of total users
            </div>
          </div>
        </div>

        <div class="stat-card" @click="navigateTo('/admin/sensors')">
          <div class="icon-wrapper bg-emerald-900/30 text-emerald-400">
            <i class="pi pi-tablet text-2xl"></i>
          </div>
          <div>
            <h3 class="stat-label">Total Sensors</h3>
            <div class="stat-value">{{ stats.total_sensors }}</div>
            <div class="stat-info">
              <span class="text-emerald-400">{{ stats.new_readings_today }}</span> new readings today
            </div>
          </div>
        </div>
      </div>

      <h2 class="text-xl font-bold text-gray-200 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
        <Button
            label="Manage Users"
            icon="pi pi-users"
            iconPos="left"
            severity="info"
            class="p-button-lg"
            @click="navigateTo('/admin/users')"
        />

        <Button
            label="Manage Sensors"
            icon="pi pi-tablet"
            iconPos="left"
            severity="success"
            class="p-button-lg"
            @click="navigateTo('/admin/sensors')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  @apply flex items-center p-6 rounded-lg bg-gray-800/70 border border-gray-700/50 transition-all duration-200;
  @apply hover:shadow-lg hover:border-purple-500/20 cursor-pointer;
}

.icon-wrapper {
  @apply flex items-center justify-center w-14 h-14 rounded-lg mr-4;
  @apply shadow-lg;
}

.stat-label {
  @apply text-gray-400 text-sm mb-1;
}

.stat-value {
  @apply text-2xl font-bold text-white;
}

.stat-info {
  @apply text-sm text-gray-400 mt-1;
}

:deep(.p-button:hover) {
  @apply transform -translate-y-1;
}
</style>