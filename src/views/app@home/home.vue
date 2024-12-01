<script setup lang="ts">
import ASensorReadings from "@/components/a-sensor-readings.vue";
import axiosInstance from "@/plugins/axios";
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import {onMounted, ref} from "vue";
import {RouterLink} from "vue-router";

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
  <ABreadcrumb/>

  <div>
    <div v-for="group in groups" :key="group.group_value" class="p-10">
      <h2 v-if="group.sensors.length !== 0" class="text-3xl font-bold mb-4">{{ group.group_name }}</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
        <router-link
            v-for="sensor in group.sensors"
            :key="sensor.type"
            :to="`/dashboard/${group.group_value}/${sensor.type}`"
            class="p-4 rounded-lg shadow-xl hover:shadow-xl transition-transform duration-300 hover:scale-105 border-b-2 border-b-purple-500 block"
        >
          <ASensorReadings
              :type="sensor.type"
              :display-name="sensor.display_name"
          />
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>