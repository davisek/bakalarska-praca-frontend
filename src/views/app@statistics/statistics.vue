<script setup lang="ts">
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import { ref, onMounted, computed } from 'vue';
import axiosInstance from "@/plugins/axios";
import { Sensor, SensorGroup, SensorStatistics } from '@/types';
import ALoadingScreen from "@/components/a-loading-screen.vue";
import AErrorMessage from "@/components/a-error-message.vue";
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import CrosshairPlugin from "chartjs-plugin-crosshair";
import { formatDateTime } from "@/utils/dateUtil";
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/utils/themeUtil';

ChartJS.register(CrosshairPlugin, Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

const { t } = useI18n();
const isDarkMode = useTheme();

const groups = ref<SensorGroup[]>([]);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

const sensorChartData = ref(new Map<string, {
  chartLabels: string[];
  chartData: number[];
  chartOptions: any;
  symbol: string;
  statistics: SensorStatistics;
  percentageDifference: number | null;
  valueDifference: number | null;
  isLoading: boolean;
  errorMessage: string | null;
}>());

const fetchSensorGroups = async () => {
  isLoading.value = true;
  try {
    const response = await axiosInstance.get<SensorGroup[]>('/sensor-groups');
    groups.value = response;

    for (const group of groups.value) {
      for (const sensor of group.sensors) {
        sensorChartData.value.set(sensor.type, {
          chartLabels: [],
          chartData: [],
          chartOptions: {},
          symbol: '',
          statistics: {
            avg: null,
            min: null,
            max: null
          },
          percentageDifference: null,
          valueDifference: null,
          isLoading: true,
          errorMessage: null
        });

        loadSensorData(sensor);
      }
    }
  } catch (err) {
    errorMessage.value = t('groups.loadError');
  } finally {
    isLoading.value = false;
  }
};

const loadSensorData = async (sensor: Sensor) => {
  const sensorData = sensorChartData.value.get(sensor.type);
  if (!sensorData) return;

  sensorData.isLoading = true;
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fromDate = sevenDaysAgo.toISOString().slice(0, 10);
    const toDate = now.toISOString().slice(0, 10);

    const params = {
      from: fromDate,
      to: toDate
    };

    const response = await axiosInstance.get(`/sensor-readings/collection/${sensor.type}`, { params });

    if (response.length !== 0) {
      sensorData.chartLabels = response.map((item) => formatDateTime(item.created_at));
      sensorData.chartData = response.map((item) =>
        item.value !== null ? parseFloat(item.value.toFixed(2)) : null
      );
      sensorData.symbol = response[0]?.symbol || '';

      sensorData.statistics.avg = parseFloat(
        (sensorData.chartData.reduce((sum, value) => sum + (value as number), 0) / sensorData.chartData.length).toFixed(2)
      );
      sensorData.statistics.min = Math.min(...(sensorData.chartData as number[]));
      sensorData.statistics.max = Math.max(...(sensorData.chartData as number[]));

      if (sensorData.chartData.length >= 2) {
        const oldestValue = sensorData.chartData[0];
        const newestValue = sensorData.chartData[sensorData.chartData.length - 1];
        if (oldestValue !== 0) {
          sensorData.percentageDifference = ((newestValue - oldestValue) / Math.abs(oldestValue)) * 100;
          sensorData.valueDifference = newestValue - oldestValue;
        } else {
          sensorData.percentageDifference = null;
          sensorData.valueDifference = null;
        }
      }

      sensorData.chartOptions = {
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
              label: function (context) {
                const value = context.raw;
                if (value === 0 || value) {
                  return `${value} ${sensorData.symbol}`;
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

      sensorData.errorMessage = null;
    } else {
      sensorData.errorMessage = t('common.noDataForRange');
    }
  } catch (err) {
    sensorData.errorMessage = t('common.failedToLoad');
  } finally {
    sensorData.isLoading = false;
  }
};

onMounted(async () => {
  await fetchSensorGroups();
});
</script>

<template>
  <ABreadcrumb/>

  <div class="lg:p-6 p-0">
    <ALoadingScreen :is-loading="isLoading" />

    <div v-for="group in groups" :key="group.group_value" class="mb-12">
      <div v-if="group.sensors.length !== 0" class="flex items-center mb-6">
        <h2 :class="['text-3xl font-bold bg-clip-text', isDarkMode ? 'dark-text-gradient-color' : 'light-text-gradient-color']">
          {{ group.group_name }}
        </h2>
        <div class="h-0.5 flex-grow ml-4 bg-gradient-to-r from-purple-500/50"></div>
      </div>

      <div v-for="sensor in group.sensors" :key="sensor.type" class="mb-8">
        <div :class="['sensor-card rounded-xl overflow-hidden shadow-lg', isDarkMode ? 'bg-gray-800/90 border border-white/5' : 'bg-white/90 border border-gray-200/50']">
          <div class="flex flex-col xl:flex-row">
            <div class="xl:w-1/4 p-6 flex flex-col border-b lg:border-b-0 lg:border-r"
                 :class="isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                  <img v-if="sensor.icon_path" :src="sensor.icon_path" :alt="sensor.sensor_name" class="w-8 h-8" />
                </div>
                <div>
                  <h3 :class="['text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
                    {{ sensor.display_name }}
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ sensor.type }}</p>
                </div>
              </div>

              <div class="mt-2 grid grid-cols-2 gap-2">
                <div :class="['stat-card', isDarkMode ? 'dark-stat-card' : 'light-stat-card']">
                  <div :class="['stat-icon-wrapper', isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600']">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h5 :class="['stat-label', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ t('sensor.minimumValue') }}</h5>
                    <div :class="['stat-value', isDarkMode ? 'text-white' : 'text-gray-900']">
                      {{ sensorChartData.get(sensor.type)?.statistics?.min }}
                      <span :class="['stat-unit', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                        {{ sensorChartData.get(sensor.type)?.symbol }}
                      </span>
                    </div>
                  </div>
                </div>

                <div :class="['stat-card', isDarkMode ? 'dark-stat-card' : 'light-stat-card']">
                  <div :class="['stat-icon-wrapper', isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600']">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.499 8.248h15m-15 7.501h15" />
                    </svg>
                  </div>
                  <div>
                    <h5 :class="['stat-label', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ t('sensor.averageValue') }}</h5>
                    <div :class="['stat-value', isDarkMode ? 'text-white' : 'text-gray-900']">
                      {{ sensorChartData.get(sensor.type)?.statistics?.avg }}
                      <span :class="['stat-unit', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                        {{ sensorChartData.get(sensor.type)?.symbol }}
                      </span>
                    </div>
                  </div>
                </div>

                <div :class="['stat-card', isDarkMode ? 'dark-stat-card' : 'light-stat-card']">
                  <div :class="['stat-icon-wrapper', isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600']">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h5 :class="['stat-label', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ t('sensor.maximumValue') }}</h5>
                    <div :class="['stat-value', isDarkMode ? 'text-white' : 'text-gray-900']">
                      {{ sensorChartData.get(sensor.type)?.statistics?.max }}
                      <span :class="['stat-unit', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                        {{ sensorChartData.get(sensor.type)?.symbol }}
                      </span>
                    </div>
                  </div>
                </div>

                <div :class="['stat-card', isDarkMode ? 'dark-stat-card' : 'light-stat-card']">
                  <div
                    class="stat-icon-wrapper"
                    :class="sensorChartData.get(sensor.type)?.percentageDifference === null ?
                          (isDarkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100 text-gray-600') :
                          sensorChartData.get(sensor.type)?.percentageDifference > 0 ?
                          (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600') :
                          (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600')"
                  >
                    <svg v-if="sensorChartData.get(sensor.type)?.percentageDifference === null" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
                    </svg>
                    <svg v-else-if="sensorChartData.get(sensor.type)?.percentageDifference <= 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stat-icon">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                    </svg>
                  </div>
                  <div>
                    <h5 :class="['stat-label', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ t('sensor.trend') }}</h5>
                    <div :class="['stat-value', isDarkMode ? 'text-white' : 'text-gray-900']">
                      <span>{{ sensorChartData.get(sensor.type)?.percentageDifference !== null ? sensorChartData.get(sensor.type)?.percentageDifference.toFixed(2) + "%" : "N/A" }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="xl:w-3/4">
              <h3 :class="['chart-title px-6 py-4 border-b',
                    isDarkMode ? 'text-white border-gray-700/50' : 'text-gray-900 border-gray-200/50']">
                {{ t('sensor.readings', { name: sensor.display_name }) }}
              </h3>
              <div class="p-4 h-72">
                <Line
                  v-if="sensorChartData.get(sensor.type)?.chartData.length > 0"
                  :data="{
                    labels: sensorChartData.get(sensor.type)?.chartLabels,
                    datasets: [
                      {
                        label: sensor.display_name,
                        data: sensorChartData.get(sensor.type)?.chartData,
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
                  :options="sensorChartData.get(sensor.type)?.chartOptions"
                />
                <div
                  v-else
                  :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                  class="h-full flex items-center justify-center text-lg"
                >
                  {{ sensorChartData.get(sensor.type)?.errorMessage || t('common.noDataForRange') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AErrorMessage :errorMessage="errorMessage" />
  </div>
</template>

<style scoped>
.sensor-card {
  @apply transition-all duration-300;
}

.sensor-card:hover {
  @apply shadow-xl;
}

.chart-title {
  @apply text-xl font-bold;
}

.stat-card {
  @apply flex items-center p-3 rounded-lg transition-all duration-200;
}

.dark-stat-card {
  @apply bg-gray-900/70 border border-gray-700/50;
}

.light-stat-card {
  @apply bg-gray-50 border border-gray-200;
}

.stat-icon-wrapper {
  @apply flex items-center justify-center w-8 h-8 rounded-lg mr-3;
}

.stat-icon {
  @apply w-5 h-5;
}

.stat-label {
  @apply text-xs mb-1;
}

.stat-value {
  @apply text-sm font-bold;
}

.stat-unit {
  @apply text-sm;
}
</style>