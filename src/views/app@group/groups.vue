<script setup lang="ts">
import axiosInstance from "@/plugins/axios";
import {computed, onMounted, ref} from "vue";
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import {RouterLink, useRoute} from "vue-router";
import { SensorGroup } from '@/types';
import ALoadingScreen from "@/components/a-loading-screen.vue";
import AErrorMessage from "@/components/a-error-message.vue";
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/utils/themeUtil';

const { t } = useI18n();
const isDarkMode = useTheme();

const groupsWithSensors = ref<SensorGroup[]>([]);
const errorMessage = ref<string | null>(null);
const isLoading = ref(true);

const fetchSensorData = async () => {
  isLoading.value = true;
  try {
    const response = await axiosInstance.get<SensorGroup[]>('/sensor-groups');
    groupsWithSensors.value = response;
  } catch (err) {
    errorMessage.value = t('groups.loadError');
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchSensorData();
});

const route = useRoute();
const totalSensors = computed(() => {
  return groupsWithSensors.value.reduce((total, group) => total + group.sensors.length, 0);
});

</script>

<template>
  <ABreadcrumb/>

  <div class="lg:p-6 p-0">
    <ALoadingScreen :is-loading="isLoading" />

    <div :class="['sensor-groups p-6 shadow-lg mb-8 rounded-xl border',
         isDarkMode ? 'bg-gray-800/80 border-white/5' : 'bg-white/90 border-gray-200/50']">
      <h1 :class="['text-2xl font-bold mb-4',
           isDarkMode ? 'bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300' : 'text-gray-800']">
        {{ t('groups.title') }}
      </h1>
      <div class="flex flex-wrap gap-6">
        <div :class="['rounded-lg p-4 shadow-md flex items-center border',
             isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-50 border-gray-200']">
          <div class="p-3 rounded-full bg-blue-500/20 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-sm">{{ t('groups.sensorGroups') }}</p>
            <p :class="['text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">{{ groupsWithSensors.length }}</p>
          </div>
        </div>
        <div :class="['rounded-lg p-4 shadow-md flex items-center border',
             isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-50 border-gray-200']">
          <div class="p-3 rounded-full bg-purple-500/20 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-purple-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </div>
          <div>
            <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-sm">{{ t('groups.totalSensors') }}</p>
            <p :class="['text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">{{ totalSensors }}</p>
          </div>
        </div>
      </div>
    </div>

    <div :class="['h-0.5 flex-grow mb-8', isDarkMode ? 'bg-gradient-to-r from-purple-500/50' : 'bg-gradient-to-r from-purple-500/30']"></div>

    <div class="grid gap-6">
      <div
          v-for="group in groupsWithSensors"
          :key="group.group_value"
          :class="['group-card', isDarkMode ? 'dark-group-card' : 'light-group-card']"
      >
        <div
            class="group-image"
            :style="`background-image: url(${group.image_path});`"
        >
          <router-link :to="`${route.path}/${group.group_value}`" class="block w-full h-full">
            <div :class="['image-overlay', isDarkMode ? 'dark-overlay' : 'light-overlay']"></div>
            <div class="group-title">
              <h2 :class="['text-2xl font-bold transition-colors',
                    isDarkMode ? 'text-white' : 'text-white']">{{ group.group_name }}</h2>
            </div>
          </router-link>
        </div>

        <div class="sensors-grid">
          <div v-for="sensor in group.sensors"
               :key="sensor.type"
               :class="['sensor-item', isDarkMode ? 'dark-sensor-item' : 'light-sensor-item']">
            <div :class="['sensor-icon', isDarkMode ? 'dark-sensor-icon' : 'light-sensor-icon']">
              <img
                  :src="sensor.icon_path"
                  alt=""
              />
            </div>
            <div>
              <h3 :class="['font-semibold mb-1', isDarkMode ? 'text-white' : 'text-gray-900']">{{ sensor.display_name }}</h3>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-sm">{{ sensor.type }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AErrorMessage :errorMessage="errorMessage" />
  </div>
</template>

<style scoped>
.group-card {
  @apply flex flex-col rounded-xl overflow-hidden;
  @apply shadow-lg transition-transform;
  @apply lg:flex-row;
}

.group-card:hover {
  @apply -translate-y-1 shadow-xl;
}

.group-image {
  @apply w-full min-h-48 relative bg-cover bg-center;
  @apply flex-shrink-0 lg:w-1/3;
}

.image-overlay {
  @apply absolute inset-0 transition-colors;
}

.group-title {
  @apply relative z-10 flex items-center h-full pl-8;
}

.group-title h2 {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.sensors-grid {
  @apply p-6 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3;
}

.sensor-item {
  @apply flex items-center gap-4 p-4 rounded-xl;
  @apply transition-all;
  @apply border border-transparent;
}

.sensor-item:hover {
  @apply -translate-y-1;
}

.sensor-icon {
  @apply flex justify-center items-center w-12 h-12;
  @apply rounded-lg p-2 transition-colors;
}

.sensor-icon img {
  @apply w-full h-full object-contain;
}

.dark-group-card {
  @apply bg-gray-800 border border-white/5;
}

.dark-group-card:hover .group-title h2 {
  @apply text-purple-300;
}

.dark-overlay {
  background: linear-gradient(to top, rgba(17, 24, 39, 0.9), rgba(17, 24, 39, 0.6));
}

.dark-group-card:hover .dark-overlay {
  background: linear-gradient(to top, rgba(17, 24, 39, 0.8), rgba(79, 70, 229, 0.4));
}

.dark-sensor-item {
  @apply bg-gray-700/70;
}

.dark-sensor-item:hover {
  @apply bg-purple-900/20 border-purple-500/20;
}

.dark-sensor-icon {
  @apply bg-white/10;
}

.dark-sensor-item:hover .dark-sensor-icon {
  @apply bg-purple-500/30;
}

.light-group-card {
  @apply bg-white border border-gray-200/50;
}

.light-group-card:hover .group-title h2 {
  @apply text-purple-400;
}

.light-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4));
}

.light-group-card:hover .light-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(79, 70, 229, 0.3));
}

.light-sensor-item {
  @apply bg-gray-100/80;
}

.light-sensor-item:hover {
  @apply bg-purple-100/50 border-purple-400/20;
}

.light-sensor-icon {
  @apply bg-white shadow;
}

.light-sensor-item:hover .light-sensor-icon {
  @apply bg-purple-200/50;
}
</style>