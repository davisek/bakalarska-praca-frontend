<script setup lang="ts">
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import {RouterLink, useRoute} from 'vue-router';
import { Sensor } from '@/types';

const props = defineProps({
  sensors: {
    type: Array as () => Sensor[],
    required: true,
  }
});

const route = useRoute();
</script>

<template>
  <ABreadcrumb/>

  <div class="sensor-grid">
    <div
        v-for="sensor in props.sensors"
        :key="sensor.type"
        :class="[(sensor.color_class || 'default-card'), 'sensor-card']"
    >
      <router-link
          :to="`${route.path}/${sensor.type}`"
          class="sensor-link"
      >
        <div
            class="sensor-image"
            :style="`background-image: url('${sensor.image_path}');`"
        >
          <div class="sensor-overlay"></div>
          <div class="sensor-icon-badge">
            <img
                v-if="sensor.icon_path"
                :src="sensor.icon_path"
                :alt="sensor.sensor_name"
                class="icon"
            />
          </div>
        </div>

        <div class="sensor-info">
          <h3 class="sensor-name">{{ sensor.sensor_name }}</h3>
          <p class="sensor-display-name">{{ sensor.display_name }}</p>
          <div class="view-details">
            <span>View details</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="arrow-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.sensor-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-6;
}

.sensor-card {
  @apply rounded-xl overflow-hidden shadow-lg transition-all duration-300 bg-gray-800;
  @apply border border-white/5 h-full;
}

.sensor-card:hover {
  @apply transform -translate-y-2 scale-[1.02] shadow-xl;
}

.sensor-link {
  @apply block h-full relative transition-all duration-300;
}

.sensor-image {
  @apply w-full h-52 bg-cover bg-center relative;
}

.sensor-overlay {
  @apply absolute inset-0 transition-all duration-300;
  background: linear-gradient(0deg, rgba(30, 41, 59, 0.8) 0%, rgba(17, 24, 39, 0.4) 100%);
}

.sensor-icon-badge {
  @apply absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center z-10;
  @apply bg-gray-900/80 shadow border-2 border-white/10 transition-all duration-300;
}

.temperature-card:hover .sensor-link {
  @apply outline outline-2 outline-orange-500 rounded-xl;
}

.humidity-card:hover .sensor-link {
  @apply outline outline-2 outline-blue-500 rounded-xl;
}

.pressure-card:hover .sensor-link {
  @apply outline outline-2 outline-purple-500 rounded-xl;
}

.light-card:hover .sensor-link {
  @apply outline outline-2 outline-yellow-500 rounded-xl;
}

.motion-card:hover .sensor-link {
  @apply outline outline-2 outline-green-500 rounded-xl;
}

.air-card:hover .sensor-link {
  @apply outline outline-2 outline-teal-500 rounded-xl;
}

.default-card:hover .sensor-link {
  @apply outline outline-2 outline-indigo-500 rounded-xl;
}

.temperature-card:hover .sensor-overlay {
  background: linear-gradient(0deg, rgba(30, 41, 59, 0.5) 0%, rgba(249, 115, 22, 0.4) 100%);
}

.humidity-card:hover .sensor-overlay {
  background: linear-gradient(0deg, rgba(30, 41, 59, 0.5) 0%, rgba(59, 130, 246, 0.4) 100%);
}

.pressure-card:hover .sensor-overlay {
  background: linear-gradient(0deg, rgba(30, 41, 59, 0.5) 0%, rgba(124, 58, 237, 0.4) 100%);
}

.light-card:hover .sensor-overlay {
  background: linear-gradient(0deg, rgba(30, 41, 59, 0.5) 0%, rgba(234, 179, 8, 0.4) 100%);
}

.motion-card:hover .sensor-overlay {
  background: linear-gradient(0deg, rgba(30, 41, 59, 0.5) 0%, rgba(22, 163, 74, 0.4) 100%);
}

.air-card:hover .sensor-overlay {
  background: linear-gradient(0deg, rgba(30, 41, 59, 0.5) 0%, rgba(20, 184, 166, 0.4) 100%);
}

.default-card:hover .sensor-overlay {
  background: linear-gradient(0deg, rgba(30, 41, 59, 0.5) 0%, rgba(99, 102, 241, 0.4) 100%);
}

.temperature-card:hover .sensor-icon-badge {
  @apply transform scale-110 bg-orange-600/80;
}

.humidity-card:hover .sensor-icon-badge {
  @apply transform scale-110 bg-blue-600/80;
}

.pressure-card:hover .sensor-icon-badge {
  @apply transform scale-110 bg-purple-600/80;
}

.light-card:hover .sensor-icon-badge {
  @apply transform scale-110 bg-yellow-600/80;
}

.motion-card:hover .sensor-icon-badge {
  @apply transform scale-110 bg-green-600/80;
}

.air-card:hover .sensor-icon-badge {
  @apply transform scale-110 bg-teal-600/80;
}

.default-card:hover .sensor-icon-badge {
  @apply transform scale-110 bg-indigo-600/80;
}

.icon {
  @apply w-3/5 h-3/5 object-contain;
}

.sensor-info {
  @apply p-5 text-center relative;
}

.sensor-name {
  @apply text-xl font-bold mb-2 text-white transition-all duration-300;
}

.temperature-card:hover .sensor-name,
.temperature-card:hover .view-details {
  @apply text-orange-300;
}

.humidity-card:hover .sensor-name,
.humidity-card:hover .view-details {
  @apply text-blue-300;
}

.pressure-card:hover .sensor-name,
.pressure-card:hover .view-details {
  @apply text-purple-300;
}

.light-card:hover .sensor-name,
.light-card:hover .view-details {
  @apply text-yellow-300;
}

.motion-card:hover .sensor-name,
.motion-card:hover .view-details {
  @apply text-green-300;
}

.air-card:hover .sensor-name,
.air-card:hover .view-details {
  @apply text-teal-300;
}

.default-card:hover .sensor-name,
.default-card:hover .view-details {
  @apply text-indigo-300;
}

.sensor-display-name {
  @apply text-base text-gray-400 font-medium mb-4;
}

.view-details {
  @apply flex items-center justify-center gap-2 text-sm text-gray-400 opacity-0;
  @apply transform translate-y-2.5 transition-all duration-300;
}

.sensor-card:hover .view-details {
  @apply opacity-100 transform translate-y-0;
}

.arrow-icon {
  @apply w-4 h-4 transition-transform duration-300;
}

.sensor-card:hover .arrow-icon {
  @apply transform translate-x-1;
}
</style>