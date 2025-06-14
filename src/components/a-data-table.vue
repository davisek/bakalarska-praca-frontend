<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import axiosInstance from "@/plugins/axios";
import {formatDateTime} from "@/utils/dateUtil";
import {Sensor, SensorReading, PaginationMeta, PaginatedResponse} from '@/types';
import AErrorMessage from "@/components/a-error-message.vue";
import {showError, showSuccess} from "@/utils/notificationUtil.ts";
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/utils/themeUtil';

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

const paginationMeta = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 15
});

const sortField = ref('created_at');
const sortOrder = ref(-1);

const tableData = ref<SensorReading[]>([]);
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);

const calculatePercentageChange = (data: SensorReading[], sortOrder) => {
  return data.map((item, index) => {
    let currentValue = item.value;
    let previousValue;

    if (sortOrder === -1) {
      previousValue = data[index - 1]?.value;
    } else {
      previousValue = data[index + 1]?.value;
    }

    if (previousValue !== undefined && previousValue !== 0) {
      const change = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
      return { ...item, percentageChange: parseFloat(change.toFixed(2)) };
    } else {
      return { ...item, percentageChange: null };
    }
  });
};

const fetchRawData = async () => {
  isLoading.value = true;
  try {
    const params: { [key: string]: any } = {
      page: paginationMeta.value.current_page,
      per_page: paginationMeta.value.per_page,
      sort_by: sortField.value,
      sort_dir: sortOrder.value === 1 ? 'asc' : 'desc',
    };

    if (props.fromDate) params.from = props.fromDate;
    if (props.toDate) params.to = props.toDate;

    const response = await axiosInstance.get<PaginatedResponse<SensorReading>>(`/sensor-readings/collection/${props.sensor.type}/raw`, { params });
    if (response.data.length !== 0) {
      tableData.value = calculatePercentageChange(response.data, sortOrder);
      paginationMeta.value = {
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
        per_page: response.per_page,
      };
      errorMessage.value = null;
    } else {
      errorMessage.value = t('common.noDataForRange');
      tableData.value = [];
    }
  } catch (error) {
    errorMessage.value = t('common.failedToLoad');
  } finally {
    isLoading.value = false;
  }
};

const exportXLSX = async () => {
  try {
    isLoading.value = true;
    const params: { [key: string]: any } = {};

    if (props.fromDate) params.from = props.fromDate;
    if (props.toDate) params.to = props.toDate;

    const queryParams = new URLSearchParams(params).toString();
    const downloadUrl = `${axiosInstance.defaults.baseURL}/sensor-readings/collection/${props.sensor.type}/download?${queryParams}`;

    window.open(downloadUrl, '_blank');

    showSuccess(t('sensor.exportSuccess'));
    errorMessage.value = null;
  } catch (error) {
    showError(t('sensor.exportError'));
  } finally {
    isLoading.value = false;
  }
};

const onPage = (event) => {
  paginationMeta.value.current_page = event.page + 1;
  paginationMeta.value.per_page = event.rows;
  fetchRawData();
};

const onSort = (event) => {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
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
</script>

<template>
  <div :class="['overflow-x-auto rounded-lg border', isDarkMode ? 'bg-gray-800/70 border-gray-700/50' : 'border-gray-200/80']">
    <DataTable
        v-if="!errorMessage"
        :value="tableData"
        :paginator="true"
        :rows="paginationMeta.per_page"
        :totalRecords="paginationMeta.total"
        :rowsPerPageOptions="[10, 15, 25, 50]"
        :lazy="true"
        :sortField="sortField"
        :sortOrder="sortOrder"
        @page="onPage"
        @sort="onSort"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        :loading="isLoading"
        responsiveLayout="scroll"
        :class="isDarkMode ? 'dark-table' : 'light-table'"
    >
      <template #paginatorstart>
        <Button
          @click="fetchRawData"
          type="button"
          icon="pi pi-refresh"
          text
          :title="t('common.refresh')"
          :class="isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'"
        />
      </template>
      <template #paginatorend>
        <Button
          @click="exportXLSX"
          type="button"
          icon="pi pi-download"
          text
          :title="t('common.download')"
          :class="isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'"
        />
      </template>

      <Column
          field="value"
          sortable
          :headerStyle="{ width: '33%' }"
          :bodyStyle="{ textAlign: 'center' }"
      >
        <template #header>
          <div
            :class="['w-full text-center font-semibold']"
          >
            {{ t('sensor.value') }}
          </div>
        </template>
        <template #body="{ data }">
          <span :class="['font-bold', isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ data.value }}</span>
          <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-sm ml-1">{{ data.symbol }}</span>
        </template>
      </Column>

      <Column
          field="created_at"
          sortable
          :headerStyle="{ width: '33%' }"
          :bodyStyle="{ textAlign: 'center' }"
      >
        <template #header>
          <div
            :class="['w-full text-center font-semibold']"
          >
            {{ t('sensor.recordedAt') }}
          </div>
        </template>
        <template #body="{ data }">
          <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
            {{ formatDateTime(data.created_at) }}
          </span>
        </template>
      </Column>

      <Column
          field="percentageChange"
          :headerStyle="{ width: '33%' }"
          :bodyStyle="{ textAlign: 'center' }"
      >
        <template #header>
          <div
            :class="['w-full text-center font-semibold']"
          >
            {{ t('sensor.percentageChange') }}
          </div>
        </template>
        <template #body="{ data }">
          <span v-if="data.percentageChange !== null"
                :class="data.percentageChange > 0 ? 'text-green-400' :
                     data.percentageChange != 0 ? 'text-red-400' : (isDarkMode ? 'text-gray-500' : 'text-gray-400')"
          >
            {{ data.percentageChange > 0 ? '+' : '' }}{{ data.percentageChange }}%
          </span>
          <span v-else :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">–</span>
        </template>
      </Column>
    </DataTable>

    <AErrorMessage
        v-else
        :errorMessage="errorMessage"
    />
  </div>
</template>

<style scoped>
.dark-table :deep(.p-datatable-tbody > tr) {
  background-color: rgba(31, 41, 55, 0.3);
}

.dark-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
  background-color: rgba(31, 41, 55, 0.5);
}

.light-table :deep(.p-datatable-tbody > tr) {
  background-color: rgba(255, 255, 255, 0.8);
}

.light-table :deep(.p-paginator) {
  background-color: rgba(243, 244, 246, 0.8);
  border-top: 1px solid rgba(209, 213, 219, 0.5);
}
</style>