<script setup lang="ts">
import ASensorReadings from "@/components/a-sensor-readings.vue";
import axiosInstance from "@/plugins/axios";
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import { onMounted, ref, computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { SensorGroup } from '@/types/index';
import ALoadingScreen from "@/components/a-loading-screen.vue";

const groups = ref<SensorGroup[]>([]);
const isLoading = ref(true);

const fetchSensors = async () => {
  isLoading.value = true;
  try {
    const response = await axiosInstance.get<SensorGroup[]>('sensor-groups');
    groups.value = response;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchSensors();
});

const route = useRoute();

// const getSensorColorClass = (sensorType: string) => {
//   const type = sensorType.toLowerCase();
//
//   if (type.includes('temp')) return 'temperature-card';
//   if (type.includes('humid')) return 'humidity-card';
//   if (type.includes('press')) return 'pressure-card';
//   if (type.includes('light')) return 'light-card';
//   if (type.includes('motion')) return 'motion-card';
//   if (type.includes('air') || type.includes('quality')) return 'air-card';
//
//   return 'default-card';
// };

const totalSensors = computed(() => {
  return groups.value.reduce((total, group) => total + group.sensors.length, 0);
});
</script>

<template>
  <ABreadcrumb />

  <div class="p-6">
    <ALoadingScreen :is-loading="isLoading" />

    <div v-if="!isLoading && groups.length > 0" class="mb-8">
      <div class="bg-gray-800/80 rounded-xl p-6 shadow-lg border border-gray-700/50">
        <h1 class="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300">
          Sensor Dashboard
        </h1>
        <div class="flex flex-wrap gap-6">
          <div class="bg-gray-900/60 rounded-lg p-4 shadow-md border border-gray-800 flex items-center">
            <div class="p-3 rounded-full bg-purple-500/20 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-purple-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </div>
            <div>
              <p class="text-gray-400 text-sm">Total Sensors</p>
              <p class="text-xl font-bold">{{ totalSensors }}</p>
            </div>
          </div>
          <div class="bg-gray-900/60 rounded-lg p-4 shadow-md border border-gray-800 flex items-center">
            <div class="p-3 rounded-full bg-blue-500/20 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <p class="text-gray-400 text-sm">Sensor Groups</p>
              <p class="text-xl font-bold">{{ groups.length }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-for="group in groups" :key="group.group_value" class="mb-12 sensor-group">
      <div v-if="group.sensors.length !== 0" class="flex items-center mb-6">
        <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300">
          {{ group.group_name }}
        </h2>
        <div class="h-0.5 flex-grow ml-4 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <router-link
            v-for="sensor in group.sensors"
            :key="sensor.type"
            :to="`${route.path}/${group.group_value}/${sensor.type}`"
            class="sensor-card group relative overflow-hidden"
            :class="sensor.color_class || 'default-card'"
        >
          <div class="card-glow absolute inset-0 opacity-0 group-hover:opacity-100"></div>
          <div class="relative z-10 flex flex-col h-full">
            <div class="flex items-center mb-4">
              <div class="sensor-icon-wrapper">
                <img v-if="sensor.icon_path" :src="sensor.icon_path" :alt="sensor.display_name || sensor.sensor_name" class="sensor-icon" />
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="sensor-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 class="ml-3 text-xl font-bold">{{ sensor.display_name || sensor.sensor_name }}</h3>
            </div>

            <div class="flex-grow">
              <ASensorReadings :sensor="sensor" />
            </div>

            <div class="flex justify-end items-center mt-4 text-sm opacity-70 group-hover:opacity-100 transition-opacity">
              <span class="mr-2">View Details</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sensor-group {
  animation: fadeIn 0.5s ease-in-out;
}

.sensor-card {
  @apply p-6 rounded-xl shadow-lg relative transition-all duration-300;
  @apply bg-gradient-to-br from-gray-800/95 to-gray-900/95;
  @apply border border-gray-700/50;
  @apply hover:shadow-2xl hover:border-purple-500/30 hover:scale-103;
  animation: slideIn 0.5s ease-out;
}

.sensor-icon-wrapper {
  @apply p-2 rounded-lg flex items-center justify-center;
  @apply bg-gray-800/80 border border-gray-700;
  @apply w-10 h-10;
}

.sensor-icon {
  @apply w-6 h-6;
}

.temperature-card .card-glow {
  @apply bg-gradient-to-t from-orange-600/20 via-transparent to-transparent;
}

.humidity-card .card-glow {
  @apply bg-gradient-to-t from-blue-600/20 via-transparent to-transparent;
}

.pressure-card .card-glow {
  @apply bg-gradient-to-t from-purple-600/20 via-transparent to-transparent;
}

.light-card .card-glow {
  @apply bg-gradient-to-t from-yellow-600/20 via-transparent to-transparent;
}

.motion-card .card-glow {
  @apply bg-gradient-to-t from-green-600/20 via-transparent to-transparent;
}

.air-card .card-glow {
  @apply bg-gradient-to-t from-teal-600/20 via-transparent to-transparent;
}

.default-card .card-glow {
  @apply bg-gradient-to-t from-indigo-600/20 via-transparent to-transparent;
}

.card-glow {
  @apply transition-opacity duration-500;
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

.card-glow {
  @apply opacity-0 group-hover:opacity-100;
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

.hover\:scale-103:hover {
  transform: scale(1.03);
}
</style>