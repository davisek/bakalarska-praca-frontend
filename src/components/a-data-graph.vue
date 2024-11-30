<script setup lang="ts">
import {ref, onMounted, watch, reactive} from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Line } from 'vue-chartjs';
import axiosInstance from "@/plugins/axios";

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

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const fromDate = ref('');
const toDate = ref('');
const chartLabels = ref<string[]>([]);
const chartData = ref<number[]>([]);
const chartOptions = ref({});
const errorMessage = ref<string | null>(null);

const loadChartData = async () => {
  try {
    if (!fromDate.value) {
      fromDate.value = getTodayDate();
    }
    if (!toDate.value) {
      toDate.value = getTodayDate();
    }

    const response = await axiosInstance.get('/sensor-readings/collection/' + props.type, {
      params: {
        from: fromDate.value,
        to: toDate.value,
      }
    });

    chartLabels.value = response.map((item: any) => item.recorded_at);
    chartData.value = response.map((item: any) =>
        item.value !== null ? parseFloat(item.value.toFixed(2)) : null
    );
    const symbol = response[0]?.symbol || '';

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
              return `${value} ${symbol}`;
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
  await loadChartData();
});

watch([fromDate, toDate], () => loadChartData());
watch(() => props.type, () => {
  loadChartData();
});
</script>

<template>
  <div>
    <h3 class="text-xl font-bold mb-4 text-center">{{ props.displayName }} Sensor Graph</h3>
    <div class="inputs mb-4 flex justify-center gap-4">
      <label for="from">From:</label>
      <input
          type="date"
          id="from"
          v-model="fromDate"
          class="border p-2 rounded"
      />

      <label for="to">To:</label>
      <input
          type="date"
          id="to"
          v-model="toDate"
          class="border p-2 rounded"
      />
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
  <div class="grid grid-cols-3">
    <div>
      <p>Average: {{ statistics.avg }}</p>
    </div>
    <div>
      <p>Min: {{ statistics.min }}</p>
    </div>
    <div>
      <p>Max: {{ statistics.max }}</p>
    </div>
  </div>
</template>

<style scoped>
</style>