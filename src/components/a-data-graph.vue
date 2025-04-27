<script setup lang="ts">
import {ref, onMounted, watch, reactive, onUnmounted} from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Line } from 'vue-chartjs';
import CrosshairPlugin from "chartjs-plugin-crosshair"
import axiosInstance from "@/plugins/axios";
import {formatDateTime} from "@/utils/dateUtil";
import { Sensor, SensorReading, SensorStatistics, ChartOptions, ChartContext } from '@/types';
import AErrorMessage from "@/components/a-error-message.vue";
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/utils/themeUtil'

ChartJS.register(CrosshairPlugin, Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

const { t } = useI18n();
const isDarkMode = useTheme();

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

const chartRef = ref(null);

const symbol = ref('');
const percentageDifference = ref<number | null>(null);
const valueDifference = ref<number | null>(null);

const chartLabels = ref<string[]>([]);
const chartData = ref<number[]>([]);
const chartOptions = ref<ChartOptions>({});
const errorMessage = ref<string | null>(null);
const isLoading = ref(true);
const chartContainerRef = ref<HTMLElement | null>(null);

const toggleFullscreen = () => {
  if (!chartContainerRef.value) return;

  if (!document.fullscreenElement) {
    chartContainerRef.value.requestFullscreen().catch();
  } else {
    document.exitFullscreen();
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
      chartLabels.value = response.map((item: SensorReading) => formatDateTime(item.created_at));
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
              color: isDarkMode.value ? '#e2e8f0' : '#334155',
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
                const value = context.raw;
                if (value === 0 || value) {
                  return `${value} ${symbol.value}`;
                }
                return 'No data';
              }
            },
            backgroundColor: isDarkMode.value ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            titleColor: '#a78bfa',
            bodyColor: isDarkMode.value ? '#f8fafc' : '#1e293b',
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
              color: isDarkMode.value ? 'rgba(75, 85, 99, 0.3)' : 'rgba(75, 85, 99, 0.1)',
              drawBorder: false,
            },
            ticks: {
              maxTicksLimit: 10,
              autoSkip: true,
              font: {
                size: 12,
              },
              color: isDarkMode.value ? '#9ca3af' : '#4b5563',
            },
          },
          y: {
            grid: {
              color: isDarkMode.value ? 'rgba(75, 85, 99, 0.3)' : 'rgba(75, 85, 99, 0.1)',
              drawBorder: false,
            },
            ticks: {
              font: {
                size: 12,
              },
              color: isDarkMode.value ? '#9ca3af' : '#4b5563',
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
      errorMessage.value = t('common.noDataForRange');
    }
  } catch (error) {
    errorMessage.value = t('common.failedToLoad');
  } finally {
    isLoading.value = false;
  }
};

const resizeChart = () => {
  if (chartRef.value) {
    const chartInstance = chartRef.value.chart;
    if (chartInstance) {
      chartInstance.resize();
    }
  }
};

onMounted(async () => {
  await loadChartData();
  document.addEventListener('fullscreenchange', () => {
    setTimeout(resizeChart, 100);
  });

  resizeChart();
});

watch([() => props.fromDate, () => props.toDate], () => {
  loadChartData();
});

watch(() => props.sensor.type, () => {
  loadChartData();
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', resizeChart);
});
</script>

<template>
  <div class="rounded-lg">

    <div v-if="errorMessage">
      <AErrorMessage :errorMessage="errorMessage" />
    </div>

    <div v-else :class="['mb-8 rounded-xl overflow-hidden border', isDarkMode ? 'bg-gray-900/70 border-gray-700/50' : 'bg-white border-gray-200']">
      <div>
        <h2 :class="['chart-title', isDarkMode ? 'text-white' : 'text-gray-900']">{{ t('sensor.readings', { name: props.sensor.display_name }) }}</h2>
        <button
          @click="toggleFullscreen"
          class="expand-button mr-4"
          :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'"
          :title="t('common.toggleFullscreen')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 ml-1 mt-1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </button>
        <div class="p-4 h-96" ref="chartContainerRef">
          <Line
              ref="chartRef"
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

      <div :class="['stat-card', isDarkMode ? 'bg-gray-900/70' : 'bg-white']">
        <div :class="['stat-icon-wrapper min-icon', isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600']">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div>
          <h5 :class="['stat-label', isDarkMode ? 'text-gray-400' : 'text-gray-900']">{{ t('sensor.minimumValue') }}</h5>
          <div :class="['stat-value', isDarkMode ? 'text-white' : 'text-gray-900']">{{ statistics.min }} <span :class="['stat-unit', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ symbol }}</span></div>
        </div>
      </div>

      <div :class="['stat-card', isDarkMode ? 'bg-gray-900/70' : 'bg-white']">
        <div :class="['stat-icon-wrapper avg-icon', isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600']">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.499 8.248h15m-15 7.501h15" />
          </svg>
        </div>
        <div>
          <h5 :class="['stat-label', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ t('sensor.averageValue') }}</h5>
          <div :class="['stat-value', isDarkMode ? 'text-white' : 'text-gray-900']">{{ statistics.avg }} <span :class="['stat-unit', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ symbol }}</span></div>
        </div>
      </div>

      <div :class="['stat-card', isDarkMode ? 'bg-gray-900/70' : 'bg-white']">
        <div :class="['stat-icon-wrapper max-icon', isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600']">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div>
          <h5 :class="['stat-label', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ t('sensor.maximumValue') }}</h5>
          <div :class="['stat-value', isDarkMode ? 'text-white' : 'text-gray-900']">{{ statistics.max }} <span :class="['stat-unit', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ symbol }}</span></div>
        </div>
      </div>

      <div :class="['stat-card', isDarkMode ? 'bg-gray-900/70' : 'bg-white']">
        <div
            class="stat-icon-wrapper"
            :class="percentageDifference === null ? (isDarkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100 text-gray-600') :
                 percentageDifference > 0 ? (isDarkMode ? 'up-icon bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600') :
                 (isDarkMode ? 'down-icon bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600')"
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
          <h5 :class="['stat-label', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ t('sensor.trend') }}</h5>
          <div :class="['stat-value', isDarkMode ? 'text-white' : 'text-gray-900']">
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
  @apply text-xl font-bold py-4 px-6;
}

.dark-theme .chart-title {
  @apply bg-gray-800/80 border-b border-gray-700/50;
  background-image: linear-gradient(to right, rgba(124, 58, 237, 0.05), rgba(79, 209, 197, 0.05));
}

.light-theme .chart-title {
  @apply bg-gray-50 border-b border-gray-200;
  background-image: linear-gradient(to right, rgba(124, 58, 237, 0.02), rgba(79, 209, 197, 0.02));
}

.stat-card {
  @apply flex items-center p-4 rounded-lg border transition-all duration-200;
  @apply hover:shadow-lg;
}

.dark-theme .stat-card {
  @apply border-gray-700/50;
}

.light-theme .stat-card {
  @apply border-gray-200;
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
  @apply text-sm mb-1;
}

.stat-value {
  @apply text-xl font-bold;
}

.stat-unit {
  @apply text-lg;
}
</style>