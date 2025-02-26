<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import axiosInstance from "@/plugins/axios";
import {formatDateTime} from "@/utils/dateUtil";
import {Sensor, SensorReading, PaginationMeta, PaginatedResponse} from '@/types';

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

const paginationMeta = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  total: 0,
});

const currentPage = ref(1);
const perPage = ref(15);
const sortField = ref<string>('created_at');
const sortDirection = ref<string>('desc');

const tableData = ref<SensorReading[]>([]);
const errorMessage = ref<string | null>(null);

const calculatePercentageChange = (data: SensorReading[], sortDirection: string) => {
  return data.map((item, index) => {
    let currentValue = item.value;
    let previousValue;

    if (sortDirection === 'desc') {
      previousValue = data[index + 1]?.value;
    } else {
      previousValue = data[index - 1]?.value;
    }

    if (previousValue !== undefined && previousValue !== 0) {
      const change = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
      return { ...item, percentageChange: parseFloat(change.toFixed(2)) };
    } else {
      return { ...item, percentageChange: null };
    }
  });
};

const setSorting = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
  fetchRawData();
};

const fetchRawData = async () => {
  try {
    const params: { [key: string]: any } = {
      page: currentPage.value,
      per_page: perPage.value,
      sort: [{ field: sortField.value, direction: sortDirection.value }],
    };

    if (props.fromDate) params.from = props.fromDate;
    if (props.toDate) params.to = props.toDate;

    const response = await axiosInstance.get<PaginatedResponse<SensorReading>>(`/sensor-readings/collection/${props.sensor.type}/raw`, { params });
    if (response.data.length !== 0) {
      tableData.value = calculatePercentageChange(response.data, sortDirection.value);
      paginationMeta.value = {
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
      };
      errorMessage.value = null;
    } else {
      errorMessage.value = 'There are no data for this date range.';
      tableData.value = [];
    }
  } catch (error) {
    errorMessage.value = 'Failed to load data. Please try again.';
    console.error(error);
  }
};

onMounted(async () => {
  await fetchRawData();
});

watch([() => props.fromDate, () => props.toDate], () => {
  fetchRawData();
});

watch(() => props.sensor.type, () => {
  fetchRawData();
});

watch(currentPage, () => fetchRawData());
</script>

<template>
  <div>
    <div class="mb-4 flex justify-between items-center">
      <div>
        <button @click="setSorting('value')" class="p-2 rounded shadow-box bg-blend-darken hover:bg-gray-800 mr-2">
          Sort by Value
          <span v-if="sortField === 'value'">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
        <button @click="setSorting('created_at')" class="p-2 rounded shadow-box bg-blend-darken hover:bg-gray-800">
          Sort by Recorded At
          <span v-if="sortField === 'created_at'">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
      </div>
    </div>

    <div class="mt-4 flex justify-center items-center gap-4">
      <button
          @click="currentPage > 1 && (currentPage -= 1)"
          :disabled="currentPage === 1"
          class="p-2 rounded shadow-box bg-blend-darken hover:bg-gray-800"
          :class="{'opacity-50 cursor-not-allowed': currentPage === 1}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
        </svg>
      </button>
      <span>Page {{ paginationMeta.current_page }} of {{ paginationMeta.last_page }}</span>
      <button
          @click="currentPage < paginationMeta.last_page && (currentPage += 1)"
          :disabled="currentPage === paginationMeta.last_page"
          class="p-2 rounded shadow-box bg-blend-darken hover:bg-gray-800"
          :class="{'opacity-50 cursor-not-allowed': currentPage === paginationMeta.last_page}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>

    <div class="text-lg px-2 py-6 mt-4 shadow-box">
      <div class="grid grid-cols-3 mb-2 font-semibold">
        <h3 class="text-left">Value</h3>
        <h3 class="text-center">Recorded at</h3>
        <h3 class="text-right">Percentage change</h3>
      </div>
      <div v-if="errorMessage" class="mt-6 text-red-500 text-center">
        {{ errorMessage }}
      </div>
      <div class="grid grid-cols-3 p-2 border-b border-b-cyan-300" v-for="(item, index) in tableData" :key="index">
        <div class="text-left">{{ item.value }} {{ item.symbol }}</div>
        <div class="text-center">{{ formatDateTime(item.recorded_at) }}</div>
        <div class="text-right">
          <span v-if="item.percentageChange !== null"
                :class="item.percentageChange > 0 ? 'text-green-400' : 'text-red-400'">
            {{ item.percentageChange }} %
          </span>
          <span v-else>
            N/A
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>