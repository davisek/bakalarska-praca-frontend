<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Line } from 'vue-chartjs';
import axiosInstance from "@/plugins/axios";

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

const props = defineProps({
  sensorType: {
    type: String,
    required: true,
  },
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

    const response = await axiosInstance.get('/sensor-readings/collection', {
      params: {
        sensor: 'temperature',
        from: fromDate.value,
        to: toDate.value,
      }
    });

    chartLabels.value = response.map((item: any) => item.recorded_at);
    chartData.value = response.map((item: any) =>
        item.value !== null ? parseFloat(item.value.toFixed(2)) : null
    );
    const symbol = response[0]?.symbol || '';

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

loadChartData();
watch([fromDate, toDate], loadChartData);
</script>

<template>
  <div>
    <div class="inputs">
      <label for="from">From:</label>
      <input
          type="date"
          id="from"
          v-model="fromDate"
      />

      <label for="to">To:</label>
      <input
          type="date"
          id="to"
          v-model="toDate"
      />
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <Line
        v-else
        :data="{
        labels: chartLabels,
        datasets: [
          {
            label: 'Temperature',
            data: chartData,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
        ],
      }"
        :options="chartOptions"
    />
  </div>
</template>

<style scoped>
</style>