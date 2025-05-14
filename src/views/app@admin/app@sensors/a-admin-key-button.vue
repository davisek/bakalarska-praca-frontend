<script setup lang="ts">
import { ref } from 'vue';
import axiosInstance from '@/plugins/axios';
import { useI18n } from 'vue-i18n';
import { showSuccess, showError } from '@/utils/notificationUtil';
import { useTheme } from '@/utils/themeUtil';

const { t } = useI18n();
const isDarkMode = useTheme();

const keyDialogVisible = ref(false);
const generatedKey = ref('');
const loading = ref(false);

async function openKeyDialog() {
  loading.value = true;
  try {
    const response = await axiosInstance.post('/admin');
    generatedKey.value = response.auth_key;
    keyDialogVisible.value = true;
  } catch (err: any) {
    showError(err.response?.data?.message || t('admin.sensors.keyError'));
  } finally {
    loading.value = false;
  }
}

async function copyKey() {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(generatedKey.value);
      showSuccess(t('admin.sensors.keyCopied'));
    } catch (err: any) {
      showError(t('admin.sensors.keyCopyError'));
    }
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = generatedKey.value;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.prepend(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showSuccess(t('admin.sensors.keyCopied'));
    } catch (err: any) {
      showError(t('admin.sensors.keyCopyError'));
    } finally {
      textArea.remove();
    }
  }
}
</script>

<template>
  <Button
    :label="t('admin.sensors.generateKey', 'Generate Admin API Key')"
    icon="pi pi-key"
    severity="help"
    :loading="loading"
    @click="openKeyDialog"
    class="mr-2"
  />

  <Dialog
    v-model:visible="keyDialogVisible"
    :modal="true"
    :header="t('admin.sensors.generatedKey')"
    class="mx-4"
  >
    <div class="p-4">
      <p class="mb-2 text-sm text-gray-500">
        {{ t('admin.sensors.copyKeyInstructions') }}
      </p>
      <div
        class="flex items-center justify-between p-3 border rounded bg-gray-50"
        :class="isDarkMode ? 'bg-gray-800 border-gray-700' : ''"
      >
        <p
          class="break-all"
          :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'"
        >
          {{ generatedKey }}
        </p>
        <Button
          icon="pi pi-copy"
          :tooltip="t('admin.sensors.copyKey')"
          @click="copyKey"
          text
        />
      </div>
    </div>

    <template #footer>
      <Button
        :label="t('admin.sensors.close')"
        icon="pi pi-times"
        text
        @click="keyDialogVisible = false"
      />
    </template>
  </Dialog>
</template>

<style scoped>
</style>
