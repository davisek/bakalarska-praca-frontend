<script setup lang="ts">
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import {RouterLink, useRoute} from 'vue-router';

interface Sensor {
  type: string;
  display_name: string;
}

const props = defineProps({
  sensors: {
    type: Array as () => Sensor[],
    required: true,
  },
  groupValue: {
    type: String,
    required: true,
  },
});

const route = useRoute();
</script>

<template>
  <ABreadcrumb/>

  <div class="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14">
    <div
        v-for="sensor in sensors"
        :key="sensor.type"
        class="rounded-lg shadow-lg hover:shadow-lg hover:scale-105 transition-transform"
    >
      <router-link
          :to="`${route.path}/${sensor.type}`"
          class="block hover:outline hover:outline-purple-500 hover:outline-1 rounded-lg"
      >
        <div
            class="w-full min-h-48 bg-cover bg-center rounded-t-lg"
            :style="`background-image: url('https://media.istockphoto.com/id/1323823418/photo/low-angle-view-thermometer-on-blue-sky-with-sun-shining.jpg?s=612x612&w=0&k=20&c=LwLCGF902C-DNwKgCMCR12zFnB4g1INWzlk1JPOidRk=');`"
        ></div>

        <div class="p-4 text-center font-bold text-lg rounded-b-lg">
          {{ sensor.display_name }}
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>

</style>