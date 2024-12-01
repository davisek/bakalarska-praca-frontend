<script setup lang="ts">
import { RouterLink } from 'vue-router';

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
console.log(props)
</script>

<template>
  <div>
    <h1 class="mb-4 text-3xl">Sensors</h1>
    <div v-for="sensor in sensors" :key="sensor.type">
      <router-link
          :to="`/${props.groupValue}/${sensor.type}`"
          class="block px-4 py-2 hover:bg-gray-600 hover:text-white hover:rounded-md"
      >
        {{ sensor.display_name }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>

</style>