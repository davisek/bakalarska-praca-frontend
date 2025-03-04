<script setup lang="ts">
import {ref, onMounted, watch, reactive} from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Line } from 'vue-chartjs';
import CrosshairPlugin from "chartjs-plugin-crosshair"
import axiosInstance from "@/plugins/axios";
import {formatDateTime} from "@/utils/dateUtil";
import { Sensor, SensorReading, SensorStatistics, ChartOptions, ChartContext } from '@/types';
import AErrorMessage from "@/components/a-error-message.vue";

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
const isLoading = ref(true);

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
  isLoading.value = true;
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
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#e2e8f0',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: 20
            },
            onClick: null,
          },
          crosshair: {
            line: {
              color: 'rgba(147, 51, 234, 0.5)',
              width: 2,
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
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleColor: '#a78bfa',
            bodyColor: '#f8fafc',
            borderColor: 'rgba(124, 58, 237, 0.5)',
            borderWidth: 1,
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
              color: 'rgba(75, 85, 99, 0.3)',
              drawBorder: false,
            },
            ticks: {
              maxTicksLimit: 10,
              autoSkip: true,
              font: {
                size: 12,
              },
              color: '#9ca3af',
            },
          },
          y: {
            grid: {
              color: 'rgba(75, 85, 99, 0.3)',
              drawBorder: false,
            },
            ticks: {
              font: {
                size: 12,
              },
              color: '#9ca3af',
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
  } finally {
    isLoading.value = false;
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
  <div class="rounded-lg">

    <div v-if="errorMessage">
      <AErrorMessage :errorMessage="errorMessage" />
    </div>

    <div v-else class="bg-gray-900/70 mb-8 rounded-xl overflow-hidden border border-gray-700/50">
      <div>
        <h2 class="chart-title">{{ props.sensor.display_name }} Readings</h2>
        <div class="p-4 h-96">
          <Line
              :data="{
              labels: chartLabels,
              datasets: [
                {
                  label: props.sensor.display_name,
                  data: chartData,
                  borderColor: 'rgba(139, 92, 246, 1)',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderWidth: 3,
                  pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                  pointBorderColor: '#fff',
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  tension: 0.3,
                  fill: true,
                },
              ],
            }"
              :options="chartOptions"
          />
        </div>
      </div>
    </div>

    <div v-if="errorMessage === null" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

      <div class="stat-card">
        <div class="stat-icon-wrapper min-icon bg-blue-900/30 text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div>
          <h5 class="stat-label">Minimum Value</h5>
          <div class="stat-value">{{ statistics.min }} <span class="stat-unit">{{ symbol }}</span></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper avg-icon bg-purple-900/30 text-purple-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.499 8.248h15m-15 7.501h15" />
          </svg>
        </div>
        <div>
          <h5 class="stat-label">Average Value</h5>
          <div class="stat-value">{{ statistics.avg }} <span class="stat-unit">{{ symbol }}</span></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper max-icon bg-orange-900/30 text-orange-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div>
          <h5 class="stat-label">Maximum Value</h5>
          <div class="stat-value">{{ statistics.max }} <span class="stat-unit">{{ symbol }}</span></div>
        </div>
      </div>

      <div class="stat-card">
        <div
            class="stat-icon-wrapper"
            :class="percentageDifference === null ? 'bg-gray-800/50 text-gray-400' :
                 percentageDifference > 0 ? 'up-icon bg-green-900/30 text-green-400' : 'down-icon bg-red-900/30 text-red-400'"
        >
          <svg v-if="percentageDifference === null" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
          </svg>
          <svg v-else-if="percentageDifference <= 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
          </svg>
        </div>
        <div>
          <h5 class="stat-label">Trend</h5>
          <div class="stat-value">
            <span>{{ percentageDifference !== null ? percentageDifference.toFixed(2) + "%" : "N/A" }}</span>
            <span class="text-sm font-normal ml-2 opacity-80" v-if="valueDifference !== null">
              ({{ valueDifference > 0 ? '+' : '' }}{{ valueDifference.toFixed(2) }} {{ symbol }})
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-title {
  @apply text-xl font-bold text-white py-4 px-6 bg-gray-800/80 border-b border-gray-700/50;
  background-image: linear-gradient(to right, rgba(124, 58, 237, 0.05), rgba(79, 209, 197, 0.05));
}

.stat-card {
  @apply flex items-center p-4 rounded-lg bg-gray-900/70 border border-gray-700/50 transition-all duration-200;
  @apply hover:shadow-lg;
}

.stat-icon-wrapper {
  @apply flex items-center justify-center w-12 h-12 rounded-lg mr-4;
}

.min-icon {
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.2);
}

.avg-icon {
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
}

.max-icon {
  box-shadow: 0 0 15px rgba(251, 146, 60, 0.2);
}

.up-icon {
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);
}

.down-icon {
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
}

.stat-icon {
  @apply w-6 h-6;
}

.stat-label {
  @apply text-gray-400 text-sm mb-1;
}

.stat-value {
  @apply text-xl font-bold text-white;
}

.stat-unit {
  @apply text-lg text-gray-400;
}
</style>