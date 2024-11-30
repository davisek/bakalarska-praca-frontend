<script setup lang="ts">
import ASensorReadings from "@/components/a-sensor-readings.vue";
import ADataGraph from "@/components/a-data-graph.vue";

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-center mb-6">Welcome to the {{ props.displayName }} screen</h1>
  </div>
  <div class="mb-10">
    <ASensorReadings :type="props.type" :display-name="props.displayName"></ASensorReadings>
  </div>
  <div>
    <ADataGraph :type="props.type" :display-name="props.displayName"></ADataGraph>
  </div>
  <div>

  </div>
</template>

<style scoped>

</style>