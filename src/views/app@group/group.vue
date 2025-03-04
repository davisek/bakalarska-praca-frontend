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

  <div class="lg:p-6 p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    <div
        v-for="sensor in props.sensors"
        :key="sensor.type"
        :class="[(sensor.color_class || 'default-card'), 'sensor-card']"
    >
      <router-link
          :to="`${route.path}/${sensor.type}`"
          class="block h-full rounded-xl"
      >
        <div
            class="w-full h-48 bg-cover bg-center relative"
            :style="`background-image: url('${sensor.image_path}');`"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-gray-900/20"></div>

          <div class="absolute top-3 right-3 w-11 h-11 bg-gray-800/80 rounded-full flex items-center justify-center border border-white/10 shadow">
            <img
                v-if="sensor.icon_path"
                :src="sensor.icon_path"
                :alt="sensor.sensor_name"
                class="w-6 h-6 object-contain"
            />
          </div>
        </div>

        <div class="p-4 text-center">
          <h3 class="text-xl font-bold text-white mb-1 transition-colors">{{ sensor.sensor_name }}</h3>
          <p class="text-sm text-gray-400 mb-3">{{ sensor.display_name }}</p>

          <div class="flex items-center justify-center gap-1 text-xs text-gray-500 opacity-80 group">
            <span>View details</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 transition-transform group-hover:translate-x-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.sensor-card {
  @apply bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-white/5;
  @apply transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02];
}

.temperature-card:hover {
  border-color: rgb(249 115 22) !important;
}
.temperature-card:hover h3 {
  color: rgb(253 186 116) !important;
}

.humidity-card:hover {
  border-color: rgb(59 130 246) !important;
}
.humidity-card:hover h3 {
  color: rgb(147 197 253) !important;
}

.pressure-card:hover {
  border-color: rgb(139 92 246) !important;
}
.pressure-card:hover h3 {
  color: rgb(196 181 253) !important;
}

.light-card:hover {
  border-color: rgb(234 179 8) !important;
}
.light-card:hover h3 {
  color: rgb(253 224 71) !important;
}

.motion-card:hover {
  border-color: rgb(34 197 94) !important;
}
.motion-card:hover h3 {
  color: rgb(134 239 172) !important;
}

.air-card:hover {
  border-color: rgb(20 184 166) !important;
}
.air-card:hover h3 {
  color: rgb(94 234 212) !important;
}

.default-card:hover {
  border-color: rgb(99 102 241) !important;
}
.default-card:hover h3 {
  color: rgb(165 180 252) !important;
}
</style>