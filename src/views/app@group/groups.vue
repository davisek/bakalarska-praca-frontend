<script setup lang="ts">
import axiosInstance from "@/plugins/axios";
import {onMounted, ref} from "vue";
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import {RouterLink, useRoute} from "vue-router";
import { SensorGroup } from '@/types';
import ALoadingScreen from "@/components/a-loading-screen.vue";

const groupsWithSensors = ref<SensorGroup[]>([]);
const errorMessage = ref<string | null>(null);
const isLoading = ref(true);

const fetchSensorData = async () => {
  isLoading.value = true;
  try {
    const response = await axiosInstance.get<SensorGroup[]>('/sensor-groups');
    groupsWithSensors.value = response;
  } catch (err) {
    errorMessage.value = 'Failed to load data. Please try again.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchSensorData();
});

const route = useRoute();
</script>

<template>
  <ABreadcrumb/>

  <div class="groups-container">
    <ALoadingScreen :is-loading="isLoading" />

    <div class="groups-grid">
      <div
          v-for="group in groupsWithSensors"
          :key="group.group_value"
          class="group-card"
      >
        <div
            class="group-image"
            :style="`background-image: url(${group.image_path});`"
        >
          <router-link :to="`${route.path}/${group.group_value}`" class="group-link">
            <div class="image-overlay"></div>
            <div class="group-title">
              <h2>{{ group.group_name }}</h2>
            </div>
          </router-link>
        </div>

        <div class="sensors-container">
          <div v-for="sensor in group.sensors" :key="sensor.type" class="sensor-item">
            <div class="sensor-icon">
              <img
                  :src="sensor.icon_path"
                  alt=""
              />
            </div>
            <div class="sensor-info">
              <h3>{{ sensor.display_name }}</h3>
              <p>{{ sensor.type }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.groups-container {
  @apply p-6 animate-fadeIn;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease;
}

.groups-grid {
  @apply grid gap-6;
}

.group-card {
  @apply flex flex-col bg-gray-800 rounded-xl overflow-hidden;
  @apply shadow-lg border border-white/5;
  @apply transition duration-300 ease-in-out;
  @apply lg:flex-row;
}

.group-card:hover {
  @apply transform -translate-y-1 shadow-xl;
}

.group-image {
  @apply w-full min-h-48 relative bg-cover bg-center overflow-hidden;
  @apply lg:w-1/3;
}

.group-link {
  @apply block w-full h-full;
}

.image-overlay {
  @apply absolute inset-0 transition duration-300;
  background: linear-gradient(to top, rgba(17, 24, 39, 0.9), rgba(17, 24, 39, 0.6));
}

.group-card:hover .image-overlay {
  background: linear-gradient(to top, rgba(17, 24, 39, 0.8), rgba(79, 70, 229, 0.4));
}

.group-title {
  @apply relative z-10 flex items-center h-full pl-8;
}

.group-title h2 {
  @apply text-white text-2xl font-bold relative transition duration-300;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.group-card:hover .group-title h2 {
  @apply transform translate-x-1 text-purple-300;
}

.group-title h2::after {
  content: '';
  @apply absolute bottom-[-5px] left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300;
}

.group-card:hover .group-title h2::after {
  @apply w-full;
}

.sensors-container {
  @apply p-6 grid gap-4;
  @apply grid-cols-1 sm:grid-cols-2 xl:grid-cols-3;
  @apply lg:p-4;
}

.sensor-item {
  @apply flex items-center gap-4 p-4 rounded-xl;
  @apply bg-gray-700/70 shadow border border-white/5;
  @apply transition duration-200 ease-in-out;
}

.sensor-item:hover {
  @apply transform -translate-y-1 bg-purple-900/20 shadow-md;
}

.sensor-icon {
  @apply flex justify-center items-center w-12 h-12;
  @apply bg-white/10 rounded-lg p-2;
  @apply transition duration-200;
}

.sensor-item:hover .sensor-icon {
  @apply bg-purple-500/30;
}

.sensor-icon img {
  @apply w-full h-full object-contain;
}

.sensor-info {
  @apply flex-1;
}

.sensor-info h3 {
  @apply text-lg font-semibold mb-1 text-white;
}

.sensor-info p {
  @apply text-sm text-gray-400 opacity-80;
}

.error-message {
  @apply mt-8 p-4 bg-red-500/20 text-red-300 font-semibold;
  @apply rounded-lg border-l-4 border-red-500 text-center;
}
</style>