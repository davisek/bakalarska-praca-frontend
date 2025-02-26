<script setup lang="ts">
import ASensorReadings from "@/components/a-sensor-readings.vue";
import axiosInstance from "@/plugins/axios";
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import {onMounted, ref} from "vue";
import {RouterLink, useRoute} from "vue-router";
import { SensorGroup } from '@/types/index';

const groups = ref<SensorGroup[]>([]);

const fetchSensors = async () => {
  try {
    const response = await axiosInstance.get<SensorGroup[]>('sensor-groups');

    groups.value = response;
  } catch (err) {
    console.error(err);
  }
};

onMounted(async () => {
  await fetchSensors();
});
const route = useRoute();
</script>

<template>
  <ABreadcrumb/>

  <div class="p-6">
    <div v-for="group in groups" :key="group.group_value" class="mb-8">
      <h2 v-if="group.sensors.length !== 0" class="text-3xl font-bold mb-4">{{ group.group_name }}</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
        <router-link
            v-for="sensor in group.sensors"
            :key="sensor.type"
            :to="`${route.path}/${group.group_value}/${sensor.type}`"
            class="p-4 rounded-lg shadow-box transition-transform duration-300 hover:scale-105 block"
        >
          <ASensorReadings :sensor="sensor"/>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>