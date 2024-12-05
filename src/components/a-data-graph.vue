<script setup lang="ts">
import {ref, onMounted, watch, reactive} from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Line } from 'vue-chartjs';
import CrosshairPlugin from "chartjs-plugin-crosshair"
import axiosInstance from "@/plugins/axios";
import {formatDateTime} from "@/utils/dateUtil.ts";

ChartJS.register(CrosshairPlugin, Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

const props = defineProps({
  sensor: {
    type: Object as () => {
      sensor_name: string;
      type: string;
      display_name: string;
      icon_path?: string;
    },
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

const isMenuOpen = ref(false);

const percentageDifference = ref<number | null>(null);
const valueDifference = ref<number | null>(null);

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

const calculatePercentageDifference = (data: number[]) => {
  if (data.length >= 2) {
    const oldestValue = data[0];
    const newestValue = data[data.length - 1];
    if (oldestValue !== 0) {
      percentageDifference.value = ((newestValue - oldestValue) / Math.abs(oldestValue)) * 100;
      valueDifference.value = newestValue - oldestValue;
    } else {
      percentageDifference.value = null;
      valueDifference.value = null;
    }
  } else {
    percentageDifference.value = null;
    valueDifference.value = null;
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

    const response = await axiosInstance.get('/sensor-readings/collection/' + props.sensor.type, { params });
    if (response.length !== 0) {
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
      calculatePercentageDifference(chartData.value);

      chartOptions.value = {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            onClick: null,
          },
          crosshair: {
            line: {
              color: 'rgba(216, 180, 254, 0.75)',
              width: 1,
            },
            snap: {
              enabled: true
            },
            zoom: {
              enabled: false
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context: any) {
                const value = context.raw || '';
                return `${value} ${symbol.value}`;
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            bodyFont: {
              size: 14,
              weight: 'bold',
            },
            titleFont: {
              size: 14,
              weight: 'bold',
            },
            padding: 12,
            cornerRadius: 8,
            boxPadding: 8,
          },
        },
        scales: {
          x: {
            grid: {
              display: true,
            },
            ticks: {
              maxTicksLimit: 10,
              autoSkip: true,
              font: {
                size: 14,
              },
            },
          },
          y: {
            ticks: {
              font: {
                size: 14,
              },
            },
          }
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
      };

      errorMessage.value = null;
    } else {
      errorMessage.value = 'There are no data for this date range.';
    }
  } catch (error) {
    errorMessage.value = 'Failed to load data. Please try again.';
    console.error(error);
  }
};

onMounted(async () => {
  timeStartSetup();
  await loadChartData();
});

watch([fromDate, toDate], () => {
    loadChartData();
});
watch(() => props.sensor.type, () => {
  timeStartSetup();
  loadChartData();
});
</script>

<template>
  <div>
    <h3 class="text-xl font-bold mb-4 text-center">Sensor Graph</h3>

    <!-- Hamburger menu -->
    <div class="lg:hidden flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Filters</h2>
      <button
          @click="isMenuOpen = !isMenuOpen"
          :class="[
              'p-2 rounded-md bg-purple-500 hover:bg-purple-600 shadow-box',
              isMenuOpen ? 'bg-purple-600' : ''
          ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>
      </button>
    </div>
    <div
        :class="[
        'justify-center lg:gap-4 text-center px-4 mb-4',
        'lg:block',
        isMenuOpen ? 'block' : 'hidden'
      ]"
    >
      <div class="mb-4 lg:gap-4 gap-1 grid lg:grid-cols-9 md:grid-cols-3 grid-cols-2">
        <button
            v-for="(range, index) in timeRanges"
            :key="index"
            @click="setTimeRange(range.value)"
            :class="[
              'p-2 bg-blend-darken rounded-lg shadow-box hover:bg-purple-600 transition font-semibold lg:text-sm',
              selectedRange === range.value ? 'bg-purple-500' : 'bg-blend-darken'
            ]"
        >
          {{ range.label }}
        </button>
      </div>
      <div class="lg:flex gap-4 justify-center font-semibold">
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


    <div v-if="errorMessage" class="text-red-500 text-center">
      {{ errorMessage }}
    </div>

    <Line
        class="mb-6 p-6 shadow-box"
        v-else
        :data="{
          labels: chartLabels,
          datasets: [
            {
              label: props.sensor.display_name,
              data: chartData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
          ],
        }"
        :options="chartOptions"
    />
  </div>

  <div v-if="errorMessage === null" class="grid grid-cols-1 md:grid-cols-4 gap-10">
    <div class="flex justify-center items-center py-4 px-16 bg-blend-darken rounded-lg shadow-box">
      <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <div class="ml-4 flex flex-col items-start">
        <h5 class="text-gray-500 text-sm font-medium">Min Value</h5>
        <div class="text-xl font-semibold">{{ statistics.min + " " + symbol }}</div>
      </div>
    </div>

    <div class="flex justify-center items-center py-4 px-16 bg-blend-darken rounded-lg shadow-box">
      <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-green-600">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.499 8.248h15m-15 7.501h15" />
        </svg>

      </div>
      <div class="ml-4">
        <h5 class="text-gray-500 text-sm font-medium">Avg Value</h5>
        <div class="text-xl font-semibold">{{ statistics.avg + " " + symbol }}</div>
      </div>
    </div>

    <div class="flex justify-center items-center py-4 px-16 bg-blend-darken rounded-lg shadow-box">
      <div class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-orange-800">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <div class="ml-4">
        <h5 class="text-gray-500 text-sm font-medium">Max Value</h5>
        <div class="text-xl font-semibold">{{ statistics.max + " " + symbol }}</div>
      </div>
    </div>

    <div class="flex justify-center items-center py-4 px-16 bg-blend-darken rounded-lg shadow-box">
      <div :class="['flex items-center justify-center w-12 h-12 rounded-full',
             percentageDifference === null || percentageDifference <= 0 ? 'bg-red-100' : 'bg-green-100'
           ]"
      >
        <svg v-if="percentageDifference === null || percentageDifference <= 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-red-800">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
        </svg>
        <svg v-else-if="percentageDifference > 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-green-800">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      </div>
      <div class="ml-4">
        <h5 class="text-gray-500 text-sm font-medium">Trend</h5>
        <div class="text-lg font-semibold">
          {{ percentageDifference !== null ? percentageDifference.toFixed(2) + " %" : "N/A" }}
          {{ valueDifference !== null ? "(" + valueDifference.toFixed(2) + " " + symbol + ")" : "" }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>