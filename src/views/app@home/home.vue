<script setup lang="ts">
import ASensorReadings from "@/components/a-sensor-readings.vue";
import axiosInstance from "@/plugins/axios";
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import { onMounted, ref, computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { SensorGroup } from '@/types/index';
import ALoadingScreen from "@/components/a-loading-screen.vue";
import AErrorMessage from "@/components/a-error-message.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const groups = ref<SensorGroup[]>([]);
const errorMessage = ref<string | null>(null);
const isLoading = ref(true);

const fetchSensors = async () => {
  isLoading.value = true;
  try {
    const response = await axiosInstance.get<SensorGroup[]>('sensor-groups');
    groups.value = response;
  } catch (err) {
    errorMessage.value = t('home.loadError');
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchSensors();
});

const route = useRoute();
</script>

<template>
  <ABreadcrumb />

  <div class="lg:p-6 p-0">
    <ALoadingScreen :is-loading="isLoading" />

    <div v-for="group in groups" :key="group.group_value" class="mb-12 sensor-group">
      <div v-if="group.sensors.length !== 0" class="flex items-center mb-6">
        <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300">
          {{ group.group_name }}
        </h2>
        <div class="h-0.5 flex-grow ml-4 bg-gradient-to-r from-purple-500/50"></div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <router-link
            v-for="sensor in group.sensors"
            :key="sensor.type"
            :to="`${route.path}/${group.group_value}/${sensor.type}`"
            class="sensor-card group relative overflow-hidden"
            :class="sensor.color_class.value || 'default-card'"
        >
          <div class="absolute inset-0"></div>
          <div class="relative z-10 flex flex-col h-full">
            <div class="flex items-center mb-4">
              <div class="sensor-icon-wrapper w-10 h-10">
                <img v-if="sensor.icon_path" :src="sensor.icon_path" :alt="sensor.display_name || sensor.sensor_name" class="sensor-icon w-6 h-6" />
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="sensor-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 class="ml-3 text-xl font-bold">{{ sensor.display_name || sensor.sensor_name }}</h3>
            </div>

            <div class="flex-grow">
              <ASensorReadings :sensor="sensor" />
            </div>

            <div class="flex justify-end items-center mt-4 text-sm opacity-70">
              <span class="mr-2">{{ t('home.viewDetails') }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <AErrorMessage :errorMessage="errorMessage" />
  </div>
</template>

<style scoped>
.sensor-group {
  animation: fadeIn 0.5s ease-in-out;
}

.sensor-card {
  @apply p-6 rounded-xl shadow-lg duration-300;
  @apply bg-gradient-to-br from-gray-800/95 to-gray-900/95;
  @apply border border-gray-700/50;
  @apply hover:shadow-2xl hover:border-purple-500/30 hover:scale-[1.02];
  animation: slideIn 0.5s ease-out;
}

.sensor-icon-wrapper {
  @apply p-2 rounded-lg flex items-center justify-center;
  @apply bg-gray-800/80 border border-gray-700;
}

.temperature-card .sensor-icon-wrapper {
  @apply border-orange-700/30 bg-orange-900/20;
}

.humidity-card .sensor-icon-wrapper {
  @apply border-blue-700/30 bg-blue-900/20;
}

.pressure-card .sensor-icon-wrapper {
  @apply border-purple-700/30 bg-purple-900/20;
}

.light-card .sensor-icon-wrapper {
  @apply border-yellow-700/30 bg-yellow-900/20;
}

.motion-card .sensor-icon-wrapper {
  @apply border-green-700/30 bg-green-900/20;
}

.air-card .sensor-icon-wrapper {
  @apply border-teal-700/30 bg-teal-900/20;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>