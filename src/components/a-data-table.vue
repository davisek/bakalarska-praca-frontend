<script setup lang="ts">
import {onMounted, reactive, ref, watch} from "vue";
import axiosInstance from "@/plugins/axios";
import {formatDateTime} from "@/utils/dateUtil.ts";

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

const paginationMeta = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
});

const isMenuOpen = ref(false);

const currentPage = ref(1);
const perPage = ref(15);
const fromDate = ref('');
const toDate = ref('');
const selectedRange = ref(null);
const sortField = ref<string>('created_at');
const sortDirection = ref<string>('desc');

const tableData = ref<any[]>([]);
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

const calculatePercentageChange = (data: any[], sortDirection: string) => {
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
    const params: Record<string, any> = {
      page: currentPage.value,
      per_page: perPage.value,
      sort: [{ field: sortField.value, direction: sortDirection.value }],
    };

    if (fromDate.value) params.from = fromDate.value;
    if (toDate.value) params.to = toDate.value;

    const response = await axiosInstance.get(`/sensor-readings/collection/${props.type}/raw`, { params });

    tableData.value = calculatePercentageChange(response.data, sortDirection.value);
    paginationMeta.value = {
      current_page: response.current_page,
      last_page: response.last_page,
      total: response.total,
    };
  } catch (error) {
    errorMessage.value = 'Failed to load data. Please try again.';
    console.error(error);
  }
};

onMounted(async () => {
  timeStartSetup()
  await fetchRawData();
});

watch([fromDate, toDate], () => fetchRawData());
watch(() => props.type, () => {
  timeStartSetup()
  fetchRawData();
});
watch(currentPage, () => fetchRawData());
</script>

<template>
  <div>
    <h3 class="text-2xl font-bold mb-4 text-center">Data Table</h3>

    <!-- Hamburger menu -->
    <div class="lg:hidden flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-white">Filters</h2>
      <button
          @click="isMenuOpen = !isMenuOpen"
          class="p-2 rounded-md bg-purple-500 hover:bg-purple-600 shadow-box"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>
      </button>
    </div>
    <div
        :class="[
        'justify-center lg:gap-4 text-center px-4',
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
      <div class="mb-4 lg:flex gap-4 justify-between font-semibold">
        <div class="md:flex gap-4 justify-center">
          <button @click="setSorting('value')" class="p-2 rounded shadow-box bg-blend-darken hover:bg-gray-800 lg:mb-0 mb-4">
            Sort by Value
            <span v-if="sortField === 'value'">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
          </button>
          <button @click="setSorting('created_at')" class="p-2 rounded shadow-box bg-blend-darken hover:bg-gray-800 lg:mb-0 mb-4">
            Sort by Recorded At
            <span v-if="sortField === 'created_at'">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
          </button>
        </div>
        <div class="lg:flex gap-4 items-center">
          <div class="flex flex-col lg:flex-row lg:items-center lg:mb-0 mb-4 gap-2 lg:flex-none">
            <label class="font-medium" for="from">From:</label>
            <input
                type="date"
                id="from"
                v-model="fromDate"
                class="border p-2 rounded-lg shadow-box focus:ring focus:ring-purple-400 focus:outline-none bg-gray-800 text-white"
            />
          </div>

          <div class="flex flex-col lg:flex-row lg:items-center gap-2">
            <label class="font-medium" for="to">To:</label>
            <input
                type="date"
                id="to"
                v-model="toDate"
                class="border p-2 rounded-lg shadow-box focus:ring focus:ring-purple-400 focus:outline-none bg-gray-800 text-white"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="mt-4 flex justify-center items-center gap-4">
      <button
          @click="currentPage > 1 && (currentPage -= 1)"
          :disabled="currentPage === 1"
          class="p-2 rounded shadow-box bg-blend-darken hover:bg-gray-800"
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
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
    <div class="text-lg lg:px-20 px-2 mt-4">
      <div class="grid grid-cols-3 mb-2">
        <h3 class="text-left">Value</h3>
        <h3 class="text-center">Recorded at</h3>
        <h3 class="text-right">Percentage change</h3>
      </div>
      <div class="grid grid-cols-3 p-2 border-b border-b-cyan-300" v-for="(item, index) in tableData" :key="index">
        <div class="text-left">{{ item.value }} {{ item.symbol }}</div>
        <div class="text-center">{{ formatDateTime(item.recorded_at) }}</div>
        <div class="text-right">
        <span v-if="item.percentageChange !== null">
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