<script setup lang="ts">
import {ref} from "vue";
import ASensorReadings from "@/components/a-sensor-readings.vue";
import ADataGraph from "@/components/a-data-graph.vue";
import ADataTable from "@/components/a-data-table.vue";
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import { Sensor, TimeRangeOption } from '@/types';

const props = defineProps({
  sensor: {
    type: Object as () => Sensor,
    required: true,
  },
});

const timeRanges: TimeRangeOption[] = [
  { label: "24h", value: 1 },
  { label: "48h", value: 2 },
  { label: "1T", value: 7 },
  { label: "2T", value: 14 },
  { label: "1M", value: 30 },
  { label: "3M", value: 90 },
  { label: "6M", value: 180 },
  { label: "1Y", value: 365 },
  { label: "MAX", value: "max" },
];

const selectedTimeRange = ref<number | string | null>(1);
const fromDate = ref('');
const toDate = ref('');

const updateTimeRange = (range: number | string) => {
  selectedTimeRange.value = range;

  const now = new Date();
  if (range === "max") {
    fromDate.value = "";
  } else {
    const daysAsNumber = typeof range === 'number' ? range : parseInt(range as string);
    const newFromDate = new Date(now.getTime() - daysAsNumber * 24 * 60 * 60 * 1000);
    fromDate.value = newFromDate.toISOString();
  }
  toDate.value = now.toISOString();
};

updateTimeRange(1);
</script>

<template>
  <ABreadcrumb/>

  <div class="p-6">
    <div class="bg-gray-800/70 rounded-lg shadow-box p-4 mb-6 gradient-subtle">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="rounded-full p-3 bg-gradient-to-tr from-purple-600 to-purple-300 shadow-glow animate-pulse-glow">
            <img v-if="props.sensor.icon_path" :src="props.sensor.icon_path" :alt="props.sensor.sensor_name" class="w-10 h-10" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold">{{ props.sensor.display_name }}</h1>
            <p class="text-gray-400 text-sm">Sensor ID: {{ props.sensor.type }}</p>
          </div>
        </div>

        <div class="w-full lg:w-auto flex flex-col space-y-3">
          <div class="mb-3">
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2">
              <button
                  v-for="range in timeRanges"
                  :key="range.label"
                  @click="updateTimeRange(range.value)"
                  :class="[
                    'px-2 py-1.5 rounded-md text-sm transition-all duration-200 text-center',
                    selectedTimeRange === range.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  ]"
              >
                {{ range.label }}
              </button>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-2">
            <div class="relative w-full sm:w-auto">
              <div class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                  type="date"
                  id="from"
                  v-model="fromDate"
                  class="w-full sm:w-40 bg-gray-800 border border-gray-700 text-white text-sm rounded-md focus:ring-purple-500 focus:border-purple-500 block pl-8 p-1.5 hover:border-gray-600 transition-colors"
                  placeholder="From date"
                  @click="selectedTimeRange = null"
              />
            </div>

            <span class="text-gray-400">to</span>

            <div class="relative w-full sm:w-auto">
              <div class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                  type="date"
                  id="to"
                  v-model="toDate"
                  class="w-full sm:w-40 bg-gray-800 border border-gray-700 text-white text-sm rounded-md focus:ring-purple-500 focus:border-purple-500 block pl-8 p-1.5 hover:border-gray-600 transition-colors"
                  placeholder="To date"
                  @click="selectedTimeRange = null"
              />
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-gray-800/75 rounded-lg shadow-box p-4">
        <h2 class="text-xl font-bold mb-4 text-purple-300 pb-2 border-b border-gray-700">Current Reading</h2>
        <div class="rounded-full shadow-box p-2 gradient-component">
          <div class="bg-gray-900 rounded-full text-center shadow-box py-5">
            <ASensorReadings :sensor="props.sensor" />
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 bg-gray-800/75 rounded-lg shadow-box p-4">
        <h2 class="text-xl font-bold mb-4 text-purple-300 pb-2 border-b border-gray-700">Historical Data</h2>
        <ADataTable :sensor="props.sensor" :from-date="fromDate" :to-date="toDate" />
      </div>
    </div>

    <div class="mt-6 bg-gray-800/75 rounded-lg shadow-box p-4">
      <h2 class="text-xl font-bold mb-4 text-purple-300 pb-2 border-b border-gray-700">Data Visualization</h2>
      <ADataGraph :sensor="props.sensor" :from-date="fromDate" :to-date="toDate" />
    </div>
  </div>
</template>
<style scoped>
.gradient-subtle {
  background-image: linear-gradient(120deg, rgba(107,70,193,0.15) 0%, rgba(75,192,192,0.15) 100%);
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8) brightness(0.8) sepia(0.2) hue-rotate(240deg);
  cursor: pointer;
}
</style>