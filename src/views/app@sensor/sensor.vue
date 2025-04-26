<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import ADataGraph from "@/components/a-data-graph.vue";
import ADataTable from "@/components/a-data-table.vue";
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import ACurrentReading from "@/views/app@sensor/a-current-reading.vue";
import { Sensor, TimeRangeOption } from '@/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  sensor: {
    type: Object as () => Sensor,
    required: true,
  },
});

const timeRanges: TimeRangeOption[] = [
  { label: t('time.24h'), value: 1 },
  { label: t('time.48h'), value: 2 },
  { label: t('time.1w'), value: 7 },
  { label: t('time.2w'), value: 14 },
  { label: t('time.1m'), value: 30 },
  { label: t('time.3m'), value: 90 },
  { label: t('time.6m'), value: 180 },
  { label: t('time.1y'), value: 365 },
  { label: t('time.max'), value: "max" },
];

const selectedTimeRange = ref<number | string | null>(1);
const fromDate = ref('');
const toDate = ref('');

const dates = ref<[Date, Date] | null>(null);

const isTimeRangeMenuOpen = ref(false);

const updateTimeRange = (range: number | string) => {
  selectedTimeRange.value = range;
  const now = new Date();
  toDate.value = now.toISOString().slice(0, 10);

  if (range === "max") {
    fromDate.value = "";
    dates.value = null;
  } else {
    const days = typeof range === 'number' ? range : parseInt(range as string);
    const newFromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    fromDate.value = newFromDate.toISOString().slice(0, 10);
    dates.value = [ newFromDate, now ];
  }
};

const formatLocalDateSkIso = (date: Date): string => {
  const parts = date.toLocaleDateString('sk', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('. ');
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

watch(dates, (newDates) => {
  if (newDates && newDates.length === 2) {
    fromDate.value = formatLocalDateSkIso(newDates[0]);
    toDate.value = formatLocalDateSkIso(newDates[1]);
  }
  console.log(toDate.value);
});

const closeTimeRangeMenu = () => {
  isTimeRangeMenuOpen.value = false;
};

onMounted(() => {
  window.addEventListener('scroll', closeTimeRangeMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', closeTimeRangeMenu);
});

updateTimeRange(1);
</script>

<template>
  <ABreadcrumb/>

  <div class="lg:p-6 p-0">
    <div class="bg-gray-800/70 rounded-lg shadow-box p-4 mb-6 gradient-subtle">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="rounded-full p-3 bg-gradient-to-tr from-purple-600 to-purple-300 shadow-glow animate-pulse-glow">
            <img v-if="props.sensor.icon_path" :src="props.sensor.icon_path" :alt="props.sensor.sensor_name" class="w-10 h-10" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold">{{ props.sensor.display_name }}</h1>
            <p class="text-gray-400 text-sm">{{ t('sensor.sensorId') }}: {{ props.sensor.type }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="sensor-content">
        <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 pb-2 sensor-content-border">{{ t('sensor.currentReading') }}</h2>
        <ACurrentReading :sensor="props.sensor" />
      </div>

      <div class="lg:col-span-2 sensor-content">
        <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 pb-2 mb-4 sensor-content-border">{{ t('sensor.historicalData') }}</h2>
        <ADataTable :sensor="props.sensor" :from-date="fromDate" :to-date="toDate" />
      </div>
    </div>

    <div class="mt-6 sensor-content">
      <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 pb-2 mb-4 sensor-content-border">{{ t('sensor.dataVisualization') }}</h2>
      <ADataGraph :sensor="props.sensor" :from-date="fromDate" :to-date="toDate" />
    </div>

  </div>

  <div class="fixed top-4 right-16 lg:top-10 lg:right-4 z-50">
    <Button
        icon="pi pi-clock"
        class="h-10"
        @click="isTimeRangeMenuOpen = !isTimeRangeMenuOpen"
        variant="outlined"
        severity="help"
    />
  </div>

  <Dialog
      v-model:visible="isTimeRangeMenuOpen"
      :header="t('time.selectTimeRange')"
      :modal="false"
      closable
      style="position: fixed; top:10px; right:10px; width: 300px;"
  >
    <div class="p-4">
      <div class="grid grid-cols-3 gap-2 mb-6">
        <button
            v-for="range in timeRanges"
            :key="range.label"
            @click="updateTimeRange(range.value)"
            :class="[
                    'px-2 py-1.5 rounded-md text-sm transition-all duration-200 text-center border',
                    selectedTimeRange === range.value
                      ? 'bg-purple-600 text-white btn-border'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  ]"
        >
          {{ range.label }}
        </button>
      </div>
      <DatePicker
          v-model="dates"
          size="small"
          showIcon
          selectionMode="range"
          :manualInput="false"
          class="w-full"
          variant="outlined"
          :maxDate="new Date()"
          :hideOnRangeSelection="true"
      />
    </div>
  </Dialog>
</template>
<style scoped>
.gradient-subtle {
  @apply border border-purple-600/20;
  background-image: linear-gradient(120deg, rgba(107,70,193,0.15) 0%, rgba(75,192,192,0.15) 100%);
}

.btn-border {
  border: 1px solid;
  border-color: rgb(255, 255, 255, 0.2) !important;
}

.sensor-content {
  @apply p-6 rounded-xl shadow-lg;
  @apply bg-gradient-to-br from-gray-800/95 to-gray-900/95;
  @apply border border-gray-700/50;
  @apply hover:shadow-2xl hover:border-purple-500/30;
}

.sensor-content-border {
  @apply border-b border-white/20
}
</style>