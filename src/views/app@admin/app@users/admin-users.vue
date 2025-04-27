<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axiosInstance from '@/plugins/axios';
import ALoadingScreen from '@/components/a-loading-screen.vue';
import AErrorMessage from '@/components/a-error-message.vue';
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import { PaginatedResponse, PaginationMeta, User } from "@/types";
import { formatDateTime } from "@/utils/dateUtil";
import { showSuccess, showError } from '@/utils/notificationUtil';
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/utils/themeUtil';

const { t } = useI18n();
const isDarkMode = useTheme();

const users = ref<User[]>([]);
const errorMessage = ref<string | null>(null);
const isLoading = ref(true);
const isDeleting = ref(false);

const selectedUser = ref<User | null>(null);
const deleteModalVisible = ref(false);

const paginationMeta = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 15
});

const searchQuery = ref('');
const sortField = ref('name');
const sortOrder = ref(1);

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const params: { [key: string]: any } = {
      page: paginationMeta.value.current_page,
      per_page: paginationMeta.value.per_page,
      sort_by: sortField.value,
      sort_dir: sortOrder.value === 1 ? 'asc' : 'desc'
    };

    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    const response = await axiosInstance.get<PaginatedResponse<User>>('/users', { params });
    users.value = response.data;
    paginationMeta.value = {
      current_page: response.current_page,
      last_page: response.last_page,
      total: response.total,
      per_page: response.per_page,
    };
    errorMessage.value = null;
  } catch (error) {
    errorMessage.value = t('admin.users.failedToLoad');
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  paginationMeta.value.current_page = 1;
  fetchUsers();
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
  fetchUsers();
};

const onSort = (event) => {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
  fetchUsers();
};

const confirmDelete = (user: User) => {
  selectedUser.value = user;
  deleteModalVisible.value = true;
};

const closeDeleteModal = () => {
  deleteModalVisible.value = false;
  setTimeout(() => {
    selectedUser.value = null;
  }, 200);
};

const deleteUser = async () => {
  if (!selectedUser.value) return;

  isDeleting.value = true;
  try {
    const response = await axiosInstance.delete(`/users/${selectedUser.value.id}`);
    showSuccess(response.message);

    if (users.value.length === 1 && paginationMeta.value.current_page > 1) {
      paginationMeta.value.current_page--;
    }
    fetchUsers();
  } catch (error) {
    showError(t('admin.users.failedToDelete'));
  } finally {
    isDeleting.value = false;
    closeDeleteModal();
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="lg:p-6 p-2">
    <ABreadcrumb class="lg:pl-4 lg:pt-4" />
    <ALoadingScreen :is-loading="isLoading" />

    <div class="p-4 bg-gray-800/90 rounded-lg shadow-lg border border-gray-700/50 m-6">

      <div class="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h2 class="text-xl font-bold text-white">{{ t('admin.users.title') }}</h2>

        <div class="card flex flex-wrap gap-4">
          <IconField v-if="!isLoading">
            <InputIcon class="pi pi-search" />
            <InputText v-model="searchQuery" :placeholder="t('admin.users.searchPlaceholder')" />
          </IconField>

          <IconField v-else>
            <InputText v-model="searchQuery" variant="filled" />
            <InputIcon class="pi pi-spin pi-spinner" />
          </IconField>
        </div>
      </div>

      <div :class="['overflow-x-auto rounded-lg border', isDarkMode ? 'bg-gray-800/70 border-gray-700/50' : ' border-gray-200/80']">
        <DataTable
            :value="users"
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
s            :loading="isLoading"
            responsiveLayout="scroll"
            :class="isDarkMode ? 'dark-table' : 'light-table'"
        >
        <template #paginatorstart>
          <Button
            @click="fetchUsers"
            type="button"
            icon="pi pi-refresh"
            text
            :title="t('common.refresh')"
            :class="isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'"
          />
        </template>

          <Column field="name" :header="t('admin.users.name')" sortable>
            <template #body="{ data }">
              <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ data.name }}</span>
            </template>
          </Column>

          <Column field="surname" :header="t('admin.users.surname')" sortable>
            <template #body="{ data }">
              <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ data.surname }}</span>
            </template>
          </Column>

          <Column field="email" :header="t('admin.users.email')" sortable>
            <template #body="{ data }">
              <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ data.email }}</span>
            </template>
          </Column>

          <Column field="email_verified_at" :header="t('admin.users.emailVerified')" sortable>
            <template #body="{ data }">
              <div v-if="data.email_verified_at" class="flex items-center">
                <i class="pi pi-check-circle text-green-500 mr-2"></i>
                <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ formatDateTime(data.email_verified_at) }}</span>
              </div>
              <div v-else class="flex items-center">
                <i class="pi pi-times-circle text-red-400 mr-2"></i>
                <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ t('admin.users.notVerified') }}</span>
              </div>
            </template>
          </Column>

          <Column field="locale.label" :header="t('admin.users.locale')">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <img v-if="data.locale.symbol" :src="data.locale.symbol" class="w-5 h-5" alt="Locale flag" />
                <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ data.locale.label }}</span>
              </div>
            </template>
          </Column>

          <Column field="is_admin" :header="t('admin.users.admin')" sortable>
            <template #body="{ data }">
              <Tag v-if="data.is_admin" severity="warn" :value="t('admin.users.admin')" />
              <Tag v-else severity="info" :value="t('admin.users.user')" />
            </template>
          </Column>

          <Column field="created_at" :header="t('admin.users.createdAt')" sortable>
            <template #body="{ data }">
              <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ formatDateTime(data.created_at) }}</span>
            </template>
          </Column>

          <Column
              :bodyStyle="{ textAlign: 'center' }"
          >
            <template #header>
              <div style="width: 100%; text-align: center; font-weight: 600;">{{ t('admin.users.actions') }}</div>
            </template>
            <template #body="{ data }">
              <div class="flex gap-2 justify-center">
                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    rounded
                    :aria-label="t('admin.users.delete')"
                    v-if="!data.is_admin"
                    @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <AErrorMessage :errorMessage="errorMessage" />
    </div>
  </div>

  <Dialog
      v-model:visible="deleteModalVisible"
      :style="{ width: '450px' }"
      :header="t('admin.users.confirmDeletionTitle')"
      :modal="true"
      :closable="!isDeleting"
      :closeOnEscape="!isDeleting"
  >
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle mr-3 text-red-500 text-2xl"></i>
      <span v-if="selectedUser">
        {{ t('admin.users.confirmDeletionText', { fullName: selectedUser.name + ' ' + selectedUser.surname }) }}
      </span>
    </div>
    <template #footer>
      <Button
          :label="t('admin.users.no')"
          icon="pi pi-times"
          @click="closeDeleteModal"
          class="p-button-text"
          :disabled="isDeleting"
      />
      <Button
          :label="t('admin.users.yesDelete')"
          icon="pi pi-check"
          @click="deleteUser"
          severity="danger"
          :loading="isDeleting"
          autofocus
      />
    </template>
  </Dialog>
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