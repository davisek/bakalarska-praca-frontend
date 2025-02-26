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

  <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14">
    <div
        v-for="sensor in props.sensors"
        :key="sensor.type"
        class="rounded-lg shadow-box hover:scale-105 transition-transform"
    >
      <router-link
          :to="`${route.path}/${sensor.type}`"
          class="block hover:outline hover:outline-purple-500 hover:outline-1 rounded-lg"
      >
        <div
            class="w-full min-h-48 bg-cover bg-center rounded-t-lg bg-image"
            :style="`background-image: url('${sensor.image_path}');`"
        >
        </div>

        <div class="p-4 text-center font-bold text-lg rounded-b-lg">
          <div>
            {{ sensor.sensor_name }}
          </div>
          <div>
            {{ sensor.display_name }}
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>

</style>