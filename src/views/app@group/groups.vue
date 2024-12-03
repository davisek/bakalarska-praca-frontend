<script setup lang="ts">
import axiosInstance from "@/plugins/axios";
import {onMounted, ref} from "vue";
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import {RouterLink, useRoute} from "vue-router";

const groupsWithSensors = ref<any[]>([]);
const errorMessage = ref<string | null>(null);

const fetchSensorData = async () => {
  try {
    const response = await axiosInstance.get('/sensor-groups');

    groupsWithSensors.value = response
  } catch (err) {
    errorMessage.value = 'Failed to load data. Please try again.';
    console.error(err);
  }
};
onMounted(async () => {
  await fetchSensorData();
});
const route = useRoute();
</script>

<template>
  <ABreadcrumb/>

  <div class="p-10">
    <div class="grid gap-6">
      <div
          v-for="group in groupsWithSensors"
          :key="group.group_value"
          class="flex flex-col lg:flex-row items-stretch bg-gray-800 rounded-lg shadow-box overflow-hidden"
      >
        <div
            class="lg:w-1/3 w-full min-h-40 relative bg-cover bg-center hover:text-purple-300"
            :style="`background-image: url(https://www.unimier.sk/sub/unimier.sk/shop/product/obyvacka-flabo-782.jpg)`"
        >
          <router-link :to="`${route.path}/${group.group_value}`">
            <div class="absolute inset-0 bg-gray-900 bg-opacity-75"></div>

            <div class="flex items-center justify-start h-full pl-6">
              <h2 class="text-xl font-bold z-10">{{ group.group_name }}</h2>
            </div>
          </router-link>
        </div>

        <div class="flex flex-col items-start text-lg lg:w-2/3 w-full p-4">
          <div class="pl-4 py-4 flex-1">
            <ul class="list-disc list-inside">
              <li v-for="sensor in group.sensors" :key="sensor.type">
                {{ sensor.display_name }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="mt-6 text-red-500 font-bold">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>

</style>