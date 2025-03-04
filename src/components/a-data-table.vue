<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import axiosInstance from "@/plugins/axios";
import {formatDateTime} from "@/utils/dateUtil";
import {Sensor, SensorReading, PaginationMeta, PaginatedResponse} from '@/types';
import AErrorMessage from "@/components/a-error-message.vue";

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
const perPageOptions = [10, 15, 25, 50];
const sortField = ref<string>('created_at');
const sortDirection = ref<string>('desc');

const tableData = ref<SensorReading[]>([]);
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);

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
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
  }
};

const handlePerPageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  perPage.value = parseInt(target.value);
  currentPage.value = 1;
  fetchRawData();
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
    <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
      <div class="flex gap-2">
        <button
            @click="setSorting('value')"
            class="px-3 py-1.5 rounded bg-gray-700 text-gray-300 flex items-center gap-1"
            :class="sortField === 'value' ? 'bg-purple-700/40 text-purple-200 btn-sort' : 'btn-border'"
        >
          Value
          <span v-if="sortField === 'value'" class="ml-1">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </button>

        <button
            @click="setSorting('created_at')"
            class="px-3 py-1.5 rounded bg-gray-700 text-gray-300 flex items-center gap-1"
            :class="sortField === 'created_at' ? 'bg-purple-700/40 text-purple-200 btn-sort' : 'btn-border'"
        >
          Recorded at
          <span v-if="sortField === 'created_at'" class="ml-1">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <label for="perPage" class="text-gray-400 text-sm">Items per page:</label>
        <select
            id="perPage"
            v-model="perPage"
            @change="handlePerPageChange"
            class="bg-gray-700 rounded px-2 py-1 text-white btn-border"
        >
          <option v-for="option in perPageOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>

    <div class="bg-gray-900 rounded-lg overflow-hidden btn-border">
      <div class="grid grid-cols-3 p-3 bg-gray-800 font-semibold top-0">
        <div class="text-left">Value</div>
        <div class="text-center">Recorded at</div>
        <div class="text-right">Percentage change</div>
      </div>

      <div class="max-h-96 overflow-y-auto scrollbar">
        <div
            v-for="(item, index) in tableData"
            :key="index"
            class="grid grid-cols-3 p-3 border-b border-gray-700"
            :class="{ 'bg-gray-800/30': index % 2 !== 0 }"
        >
          <div class="text-left">
            <span class="font-bold">{{ item.value }}</span>
            <span class="text-gray-400 text-sm ml-1">{{ item.symbol }}</span>
          </div>

          <div class="text-center">
            {{ formatDateTime(item.recorded_at) }}
          </div>

          <div class="text-right">
            <span v-if="item.percentageChange !== null"
                  :class="item.percentageChange > 0 ? 'text-green-400' : item.percentageChange != 0 ? 'text-red-400' : 'text-gray-500'">
              {{ item.percentageChange > 0 ? '+' : '' }}{{ item.percentageChange }}%
            </span>
            <span v-else class="text-gray-500">–</span>
          </div>
        </div>
      </div>
    </div>

    <AErrorMessage :errorMessage="errorMessage" />

    <div v-if="errorMessage === null" class="flex justify-center items-center gap-4 mt-4">
      <button
          @click="currentPage > 1 && (currentPage -= 1)"
          :disabled="currentPage === 1"
          class="p-2 rounded-full bg-gray-700 flex items-center justify-center"
          :class="{'opacity-50 cursor-not-allowed': currentPage === 1}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
        </svg>
      </button>

      <div class="text-center">
        <span>Page {{ paginationMeta.current_page }} of {{ paginationMeta.last_page }}</span>
        <span class="text-sm text-gray-500 ml-1">({{ paginationMeta.total }} items)</span>
      </div>

      <button
          @click="currentPage < paginationMeta.last_page && (currentPage += 1)"
          :disabled="currentPage === paginationMeta.last_page"
          class="p-2 rounded-full bg-gray-700 flex items-center justify-center"
          :class="{'opacity-50 cursor-not-allowed': currentPage === paginationMeta.last_page}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn-sort {
  border: 1px solid;
  border-color: rgb(147, 51, 234) !important;
}

.btn-border {
  border: 1px solid;
  border-color: rgb(255, 255, 255, 0.2) !important;
}
</style>