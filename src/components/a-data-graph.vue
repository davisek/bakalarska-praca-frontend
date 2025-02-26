<script setup lang="ts">
import {ref, onMounted, watch, reactive} from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Line } from 'vue-chartjs';
import CrosshairPlugin from "chartjs-plugin-crosshair"
import axiosInstance from "@/plugins/axios";
import {formatDateTime} from "@/utils/dateUtil";
import { Sensor, SensorReading, SensorStatistics, ChartOptions, ChartContext } from '@/types';

ChartJS.register(CrosshairPlugin, Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

const props = defineProps({
  sensor: {
    type: Object as () => Sensor,
    required: true,
  },
  fromDate: {
    type: String,
    default: ''
  },
  toDate: {
    type: String,
    default: ''
  }
});

const statistics = reactive<SensorStatistics>({
  avg: null,
  min: null,
  max: null,
});

const symbol = ref('');
const percentageDifference = ref<number | null>(null);
const valueDifference = ref<number | null>(null);

const chartLabels = ref<string[]>([]);
const chartData = ref<number[]>([]);
const chartOptions = ref<ChartOptions>({});
const errorMessage = ref<string | null>(null);

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
    const params: { [key: string]: any } = {};

    if (props.fromDate) {
      params.from = props.fromDate;
    }

    if (props.toDate) {
      params.to = props.toDate;
    }

    const response = await axiosInstance.get<SensorReading[]>('/sensor-readings/collection/' + props.sensor.type, { params });
    if (response.length !== 0) {
      chartLabels.value = response.map((item: SensorReading) => formatDateTime(item.recorded_at));
      chartData.value = response.map((item: SensorReading) =>
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
              label: function (context: ChartContext) {
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
  await loadChartData();
});

watch([() => props.fromDate, () => props.toDate], () => {
  loadChartData();
});

watch(() => props.sensor.type, () => {
  loadChartData();
});
</script>

<template>
  <div>
    <div v-if="errorMessage" class="text-red-500 text-center py-4">
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