<script setup lang="ts">
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import { ref, onMounted } from 'vue';
import axiosInstance from "@/plugins/axios";

const aggregatedStats = ref({
  totalSensors: 0,
  activeSensors: 0,
  lastUpdated: null,
  topSensors: []
});

const fetchStatistics = async () => {
  try {
    const response = await axiosInstance.get('/statistics');
    aggregatedStats.value = response;
  } catch (err) {
    console.error('Failed to load statistics data', err);
  }
};

onMounted(async () => {
  await fetchStatistics();
});
</script>
<template>
  <ABreadcrumb/>

  <div class="lg:p-6 p-0">

  </div>
</template>
<style scoped>

</style>