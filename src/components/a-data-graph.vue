<script setup lang="ts">
import {ref, onMounted, watch, reactive} from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Line } from 'vue-chartjs';
import axiosInstance from "@/plugins/axios";
import {formatDateTime} from "@/utils/dateUtil.ts";

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

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

const statistics = reactive({
  avg: null as number | null,
  min: null as number | null,
  max: null as number | null,
});

const timeRanges = [
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

const fromDate = ref('');
const toDate = ref('');
const selectedRange = ref(null);
const symbol = ref('');

const chartLabels = ref<string[]>([]);
const chartData = ref<number[]>([]);
const chartOptions = ref({});
const errorMessage = ref<string | null>(null);

const timeStartSetup = () => {
  const now = new Date();
  toDate.value = now.toISOString();
  fromDate.value = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  selectedRange.value = 1
}

const setTimeRange = (days) => {
  selectedRange.value = days;
  if (days === "max") {
    fromDate.value = "";
    toDate.value = new Date().toISOString();
  } else {
    const now = new Date();
    const newFromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    fromDate.value = newFromDate.toISOString();
    toDate.value = now.toISOString();
  }
};

const loadChartData = async () => {
  try {
    const params = {};

    if (fromDate.value) {
      params.from = fromDate.value;
    }

    if (toDate.value) {
      params.to = toDate.value;
    }

    const response = await axiosInstance.get('/sensor-readings/collection/' + props.type, { params });

    chartLabels.value = response.map((item: any) => formatDateTime(item.recorded_at));
    chartData.value = response.map((item: any) =>
        item.value !== null ? parseFloat(item.value.toFixed(2)) : null
    );
    symbol.value = response[0]?.symbol || '';

    statistics.avg = parseFloat(
        (chartData.value.reduce((sum, value) => sum + (value as number), 0) / chartData.value.length).toFixed(2)
    );
    statistics.min = Math.min(...(chartData.value as number[]));
    statistics.max = Math.max(...(chartData.value as number[]));

    chartOptions.value = {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const value = context.raw || '';
              return `${value} ${symbol.value}`;
            }
          }
        }
      }
    };

    errorMessage.value = null;
  } catch (error) {
    errorMessage.value = 'Failed to load data. Please try again.';
    console.error(error);
  }
};

onMounted(async () => {
  timeStartSetup()
  await loadChartData();
});

watch([fromDate, toDate], () => loadChartData());
watch(() => props.type, () => {
  timeStartSetup()
  loadChartData();
});
</script>

<template>
  <div>
    <h3 class="text-xl font-bold mb-4 text-center">Sensor Graph</h3>

    <div class="mb-4 gap-4 grid grid-cols-9">
      <button
          v-for="(range, index) in timeRanges"
          :key="index"
          @click="setTimeRange(range.value)"
          :class="[
            'p-2 bg-blend-darken rounded-lg shadow-md hover:bg-amber-900 focus:outline-none transition',
            selectedRange === range.value ? 'bg-amber-800 text-white' : 'bg-blend-darken text-white'
          ]"
      >
        {{ range.label }}
      </button>
    </div>
    <div class="mb-4 flex justify-center gap-4">
      <div>
        <label class="mr-3" for="from">From:</label>
        <input
            type="date"
            id="from"
            v-model="fromDate"
            class="border-b p-2 rounded"
        />
      </div>
      <div>
        <label class="mr-3" for="to">To:</label>
        <input
            type="date"
            id="to"
            v-model="toDate"
            class="border-b p-2 rounded"
        />
      </div>
    </div>


    <div v-if="errorMessage" class="text-red-500 text-center">
      {{ errorMessage }}
    </div>

    <Line
        class="mb-6"
        v-else
        :data="{
          labels: chartLabels,
          datasets: [
            {
              label: props.displayName,
              data: chartData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
          ],
        }"
        :options="chartOptions"
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="m-auto flex items-center py-4 px-16 bg-blend-darken rounded-lg shadow-md">
      <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
        <svg class="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c.414 0 .75-.336.75-.75S12.414 6.5 12 6.5 11.25 6.836 11.25 7.25 11.586 8 12 8zM8.25 12a.75.75 0 010-1.5H12a.75.75 0 010 1.5H8.25zM8.25 15.75a.75.75 0 010-1.5H12a.75.75 0 010 1.5H8.25zM15.75 7.25a.75.75 0 010 1.5h-1.5a.75.75 0 010-1.5h1.5z" />
        </svg>
      </div>
      <div class="ml-4 flex flex-col items-start">
        <h5 class="text-gray-500 text-sm font-medium">Min Value</h5>
        <div class="text-xl font-semibold text-white-800">{{ statistics.min + " " + symbol }}</div>
      </div>
    </div>

    <div class="m-auto flex items-center py-4 px-16 bg-blend-darken rounded-lg shadow-md">
      <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
        <svg class="w-6 h-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c.414 0 .75-.336.75-.75S12.414 6.5 12 6.5 11.25 6.836 11.25 7.25 11.586 8 12 8zM8.25 12a.75.75 0 010-1.5H12a.75.75 0 010 1.5H8.25zM8.25 15.75a.75.75 0 010-1.5H12a.75.75 0 010 1.5H8.25zM15.75 7.25a.75.75 0 010 1.5h-1.5a.75.75 0 010-1.5h1.5z" />
        </svg>
      </div>
      <div class="ml-4">
        <h5 class="text-gray-500 text-sm font-medium">Avg Value</h5>
        <div class="text-xl font-semibold text-white-800">{{ statistics.avg + " " + symbol }}</div>
      </div>
    </div>

    <div class="m-auto flex items-center py-4 px-16 bg-blend-darken rounded-lg shadow-md">
      <div class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
        <svg class="w-6 h-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c.414 0 .75-.336.75-.75S12.414 6.5 12 6.5 11.25 6.836 11.25 7.25 11.586 8 12 8zM8.25 12a.75.75 0 010-1.5H12a.75.75 0 010 1.5H8.25zM8.25 15.75a.75.75 0 010-1.5H12a.75.75 0 010 1.5H8.25zM15.75 7.25a.75.75 0 010 1.5h-1.5a.75.75 0 010-1.5h1.5z" />
        </svg>
      </div>
      <div class="ml-4">
        <h5 class="text-gray-500 text-sm font-medium">Max Value</h5>
        <div class="text-xl font-semibold text-white-800">{{ statistics.max + " " + symbol }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>