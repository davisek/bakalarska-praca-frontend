<script setup lang="ts">
import axiosInstance from "@/plugins/axios";
import {onMounted, ref} from "vue";
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import {RouterLink, useRoute} from "vue-router";
import { SensorGroup } from '@/types';

const groupsWithSensors = ref<SensorGroup[]>([]);
const errorMessage = ref<string | null>(null);

const fetchSensorData = async () => {
  try {
    const response = await axiosInstance.get<SensorGroup[]>('/sensor-groups');

    groupsWithSensors.value = response;
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

  <div class="p-6">
    <div class="grid gap-6">
      <div
          v-for="group in groupsWithSensors"
          :key="group.group_value"
          class="flex flex-col lg:flex-row items-stretch bg-gray-800 rounded-lg shadow-box overflow-hidden"
      >
        <div
            class="lg:w-1/3 w-full min-h-40 relative bg-cover bg-center hover:text-purple-300 lg:mr-5"
            :style="`background-image: url(${group.image_path});`"
        >
          <router-link :to="`${route.path}/${group.group_value}`">
            <div class="absolute inset-0 bg-gray-900 bg-opacity-75"></div>

            <div class="flex items-center justify-start h-full pl-6">
              <h2 class="text-xl font-bold z-10">{{ group.group_name }}</h2>
            </div>
          </router-link>
        </div>

        <div class="xl:flex xl:flex-wrap justify-center gap-4 lg:pr-5">
          <div v-for="sensor in group.sensors" :key="sensor.type" class="flex justify-center shadow-box items-center gap-4 p-4 pr-7 bg-gray-700 my-5 lg:mx-0 mx-5 rounded-lg text-center">
            <img
                :src="sensor.icon_path"
                alt=""
                class="w-10 h-10 object-cover rounded-md"
            />
            <div>
              <h3 class="text-lg font-bold">{{ sensor.display_name }}</h3>
              <p class="text-sm text-gray-400">{{ sensor.type }}</p>
            </div>
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