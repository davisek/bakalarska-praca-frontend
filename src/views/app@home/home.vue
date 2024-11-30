<script setup lang="ts">
import ASensorReadings from "@/components/a-sensor-readings.vue";
import axiosInstance from "@/plugins/axios";
import {onMounted, ref} from "vue";

const groups = ref({});

const fetchSensors = async () => {
  try {
    const response = await axiosInstance.get('/meta-data/groups');
    groups.value = response;
  } catch (err) {
    console.error(err);
  }
};

onMounted(async () => {
  await fetchSensors();
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-center mb-6">Welcome to the Home Page</h1>

    <div v-for="group in groups" :key="group.group_value" class="mb-6">
      <h2 v-if="group.sensors.length !== 0" class="text-2xl font-bold mb-6">{{ group.group_name }}</h2>

      <div class="grid grid-cols-3 gap-6" v-if="group.sensors.length">
        <ASensorReadings
            v-for="sensor in group.sensors"
            :key="sensor.type"
            :type="sensor.type"
            :display-name="sensor.display_name"
            class="bg-gray-800 text-white p-4 rounded shadow"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>