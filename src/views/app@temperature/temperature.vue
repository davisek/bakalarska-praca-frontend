<script setup lang="ts">

import ASensorReadings from "@/components/a-sensor-readings.vue";
import ADataGraph from "@/components/a-data-graph.vue";
</script>

<template>
  <div>
    <h1>Welcome to the Temperature screen</h1>
  </div>
  <div>
    <ASensorReadings></ASensorReadings>
  </div>
  <div>
    <h1>Sensor Graph</h1>
    <ADataGraph sensor-type="temperature"></ADataGraph>
  </div>
  <div>

  </div>
</template>

<style scoped>

</style>