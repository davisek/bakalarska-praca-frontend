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

const selectedTimeRange = ref<number | string>(1);
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
      <div class="flex items-center gap-4">
        <div class="rounded-full p-4 bg-gradient-to-tr from-purple-600 to-purple-300 shadow-glow animate-pulse-glow">
          <img v-if="props.sensor.icon_path" :src="props.sensor.icon_path" :alt="props.sensor.sensor_name" class="w-10 h-10" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold">{{ props.sensor.display_name }}</h1>
          <p class="text-gray-400 text-sm">Sensor ID: {{ props.sensor.type }}</p>
        </div>
        <div class="mb-4 flex flex-wrap gap-2 justify-center">
          <button
              v-for="range in timeRanges"
              :key="range.label"
              @click="updateTimeRange(range.value)"
              :class="[
            'px-4 py-2 rounded-md transition-colors',
            selectedTimeRange === range.value
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          ]"
          >
            {{ range.label }}
          </button>
        </div>
        <div class="lg:flex gap-4 justify-center">
          <div class="flex flex-col lg:flex-row lg:items-center lg:mb-0 mb-4 gap-2 lg:flex-none">
            <label class="font-medium" for="from">From:</label>
            <input
                type="date"
                id="from"
                v-model="fromDate"
                class="border p-2 rounded-lg shadow-box focus:ring focus:ring-purple-400 focus:outline-none bg-gray-800"
            />
          </div>

          <div class="flex flex-col lg:flex-row lg:items-center gap-2">
            <label class="font-medium" for="to">To:</label>
            <input
                type="date"
                id="to"
                v-model="toDate"
                class="border p-2 rounded-lg shadow-box focus:ring focus:ring-purple-400 focus:outline-none bg-gray-800"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-gray-800/70 rounded-lg shadow-box p-4">
        <h2 class="text-xl font-bold mb-4 text-purple-300 pb-2 border-b border-gray-700">Current Reading</h2>
        <div class="rounded-full shadow-box p-2 gradient-component">
          <div class="bg-gray-900 rounded-full text-center shadow-box py-5">
            <ASensorReadings :sensor="props.sensor" />
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 bg-gray-800/70 rounded-lg shadow-box p-4">
        <h2 class="text-xl font-bold mb-4 text-purple-300 pb-2 border-b border-gray-700">Historical Data</h2>
        <ADataTable :sensor="props.sensor" :from-date="fromDate" :to-date="toDate" />
      </div>
    </div>

    <div class="mt-6 bg-gray-800/70 rounded-lg shadow-box p-4">
      <h2 class="text-xl font-bold mb-4 text-purple-300 pb-2 border-b border-gray-700">Data Visualization</h2>
      <ADataGraph :sensor="props.sensor" :from-date="fromDate" :to-date="toDate" />
    </div>
  </div>
</template>
<style scoped>
.gradient-subtle {
  background-image: linear-gradient(120deg, rgba(107,70,193,0.15) 0%, rgba(75,192,192,0.15) 100%);
}

.shadow-glow {
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
}

@keyframes pulse-subtle {
  0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
  100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.3); }
}

.animate-pulse-glow {
  animation: pulse-subtle 3s infinite;
}
</style>