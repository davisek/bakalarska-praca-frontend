<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axiosInstance from '@/plugins/axios';
import ALoadingScreen from '@/components/a-loading-screen.vue';
import AErrorMessage from '@/components/a-error-message.vue';
import {PaginatedResponse, PaginationMeta, Log, User} from "@/types";
import { formatDateTime } from "@/utils/dateUtil.ts";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const logs = ref<Log[]>([])
const errorMessage = ref<string | null>(null);
const isLoading = ref(true);

const paginationMeta = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 15
});

const searchQuery = ref('');
const sortField = ref('created_at');
const sortOrder = ref(1);

const fetchLogs = async () => {
  isLoading.value = true;
  try {
    const params: { [key: string]: any } = {
      page: paginationMeta.value.current_page,
      per_page: paginationMeta.value.per_page,
      sort_by: sortField.value,
      sort_dir: sortOrder.value === 1 ? 'desc' : 'asc'
    };

    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    const response = await axiosInstance.get<PaginatedResponse<User>>('/logs', { params });
    logs.value = response.data;
    paginationMeta.value = {
      current_page: response.current_page,
      last_page: response.last_page,
      total: response.total,
      per_page: response.per_page,
    };
    errorMessage.value = null;
  } catch (error) {
    errorMessage.value = t('admin.logs.loadError');
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  paginationMeta.value.current_page = 1;
  fetchLogs();
};

let searchTimeout: number | null = null;
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500) as unknown as number;
});

const onPage = (event) => {
  paginationMeta.value.current_page = event.page + 1;
  paginationMeta.value.per_page = event.rows;
  fetchLogs();
};

const onSort = (event) => {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
  fetchLogs();
};

onMounted(() => {
  fetchLogs();
});
</script>

<template>
  <ALoadingScreen :is-loading="isLoading" />
  <div class="p-4 bg-gray-800/90 rounded-lg shadow-lg border border-gray-700/50 m-6">

    <div class="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
      <h2 class="text-xl font-bold text-white">{{ t('admin.logs.title') }}</h2>

      <div class="card flex flex-wrap gap-4">
        <IconField v-if="!isLoading">
          <InputIcon class="pi pi-search" />
          <InputText v-model="searchQuery" :placeholder="t('admin.logs.search')" />
        </IconField>

        <IconField v-else>
          <InputText v-model="searchQuery" variant="filled" />
          <InputIcon class="pi pi-spin pi-spinner" />
        </IconField>
      </div>
    </div>

    <div class="overflow-x-auto">
      <DataTable
          :value="logs"
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
          stripedRows
          :loading="isLoading"
          responsiveLayout="scroll"
      >
        <template #paginatorstart>
          <Button @click="fetchLogs" type="button" icon="pi pi-refresh" text />
        </template>

        <Column
            field="message"
            :header="t('admin.logs.message')"
            :headerStyle="{ width: '70%' }"
        ></Column>

        <Column
            field="created_at"
            :header="t('admin.logs.createdAt')"
            sortable
            :headerStyle="{ width: '30%' }"
        >
          <template #body="{ data }">
            {{ formatDateTime(data.created_at) }}
          </template>
        </Column>
      </DataTable>
    </div>

    <AErrorMessage :errorMessage="errorMessage" />
  </div>
</template>

<style scoped>

</style>