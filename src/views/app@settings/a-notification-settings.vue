<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import axiosInstance from '@/plugins/axios';
import { showSuccess, showError } from '@/utils/notificationUtil';
import ANotification from "@/components/a-notification.vue";
import { NotificationSetting } from "@/types";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const notificationSettings = ref<NotificationSetting[]>([]);
const loading = ref(true);
const savingNotifications = ref(false);
const allEnabled = ref(false);

const areAllNotificationsEnabled = computed(() => {
  if (notificationSettings.value.length === 0) return false;
  return notificationSettings.value.every(setting => setting.email_notification_allowed);
});

const fetchNotificationSettings = async () => {
  try {
    loading.value = true;
    const response = await axiosInstance.get('/settings');
    notificationSettings.value = response;
    allEnabled.value = areAllNotificationsEnabled.value;
    loading.value = false;
  } catch (error) {
    showError(t('notifications.loadError'));
    loading.value = false;
  }
};

const saveNotificationSettings = async () => {
  try {
    savingNotifications.value = true;

    const updates = notificationSettings.value.map(setting => ({
      id: setting.id,
      email_notification_allowed: setting.email_notification_allowed,
      threshold: setting.threshold,
      cooldown: setting.cooldown,
      min_unit_diff: setting.min_unit_diff,
    }));

    const response = await axiosInstance.put('/settings', { settings: updates });
    if (response.type === 'success') {
      showSuccess(response.message);
    } else {
      showError(response.message);
    }
    savingNotifications.value = false;
  } catch (error) {
    const firstError = Object.values(error.response.data.errors)[0];
    showError(Array.isArray(firstError) ? firstError[0] : t('notifications.validationError'));
  } finally {
    savingNotifications.value = false;
  }
};

watch(allEnabled, (newValue) => {
  notificationSettings.value.forEach(setting => {
    setting.email_notification_allowed = newValue;
  });
});

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    fetchNotificationSettings();
  }
});

onMounted(() => {
  if (props.isOpen) {
    fetchNotificationSettings();
  }
});
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>

    <div v-else>
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-purple-300 mb-2">{{ t('notifications.title') }}</h3>
        <p class="text-gray-300">{{ t('notifications.description') }}</p>
      </div>

      <div class="card flex justify-end mb-4">
        <ToggleButton
            v-model="allEnabled"
            :onLabel="t('notifications.enabled')"
            :offLabel="t('notifications.disabled')"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            class="w-auto"
            :aria-label="t('notifications.toggleAll')"
        />
      </div>

      <div class="space-y-4 mb-8">
        <div
            v-for="setting in notificationSettings"
            :key="setting.id"
            class="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div
                class="w-12 h-12 rounded-full p-2 flex items-center justify-center"
                :class="setting.sensor.color_class.value"
            >
              <img
                  v-if="setting.sensor.icon_path"
                  :src="setting.sensor.icon_path"
                  :alt="setting.sensor.display_name"
                  class="h-8 w-8"
              />
            </div>

            <div>
              <div class="font-medium">{{ setting.sensor.display_name }}</div>
              <div class="text-sm text-gray-400">{{ setting.sensor.group_name }}</div>
              <div class="text-sm text-gray-400">{{ t('notifications.binary') }}: {{ setting.sensor.is_output_binary ? 1 : 0 }}</div>
            </div>
          </div>

          <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
            <div class="w-16 flex justify-start md:justify-center">
              <ToggleSwitch v-model="setting.email_notification_allowed">
                <template #handle="{ checked }">
                  <i :class="['!text-xs pi', { 'pi-check': checked, 'pi-times': !checked }]" />
                </template>
              </ToggleSwitch>
            </div>

            <div class="gap-4">
              <div class="" v-if="!setting.sensor.is_output_binary">
                <label class="text-sm text-gray-300 block mb-1">{{ t('notifications.threshold') }}</label>
                <InputNumber
                    v-model="setting.threshold"
                    :disabled="!setting.email_notification_allowed"
                    class="p-1 rounded bg-gray-700 text-white"
                    variant="outlined"
                    showButtons
                    buttonLayout="horizontal"
                    suffix=" %"
                    :max-fraction-digits="2"
                    :min="1"
                    :max="100"
                    :step="0.01"
                >
                  <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                  </template>
                  <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                  </template>
                </InputNumber>
              </div>
              <div v-else class="hidden sm:block"></div>

              <div class="" v-if="!setting.sensor.is_output_binary">
                <label class="text-sm text-gray-300 block mb-1">{{ t('notifications.minUnitDiff') }}</label>
                <InputNumber
                    v-model="setting.min_unit_diff"
                    :disabled="!setting.email_notification_allowed"
                    type="number"
                    class="w-full p-1 rounded bg-gray-700 text-white"
                    variant="outlined"
                    showButtons
                    buttonLayout="horizontal"
                    :suffix="' ' + setting.sensor.unit_of_measurement"
                    :max-fraction-digits="2"
                    :max="99.99"
                    :step="0.01"
                >
                  <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                  </template>
                  <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                  </template>
                </InputNumber>
              </div>
              <div v-else class="hidden sm:block w-32"></div>

              <div class="">
                <label class="text-sm text-gray-300 block mb-1">{{ t('notifications.cooldown') }}</label>
                <InputNumber
                    v-model="setting.cooldown"
                    :disabled="!setting.email_notification_allowed"
                    type="number"
                    class="w-full p-1 rounded bg-gray-700 text-white"
                    variant="outlined"
                    showButtons
                    buttonLayout="horizontal"
                    suffix=" h"
                    :min="1"
                    :step="1"
                >
                  <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                  </template>
                  <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                  </template>
                </InputNumber>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="flex justify-end">
        <Button
            :label="!savingNotifications ? t('notifications.saveChanges') : t('notifications.saving')"
            severity="help"
            variant="outlined"
            icon="pi pi-check"
            iconPos="right"
            @click="saveNotificationSettings"
            :disabled="savingNotifications"
        />
      </div>
    </div>
    <ANotification position="top-right" />
  </div>
</template>

<style scoped>
.temperature-card {
  @apply border-orange-700/30 bg-orange-900/20;
}

.humidity-card {
  @apply border-blue-700/30 bg-blue-900/20;
}

.pressure-card {
  @apply border-purple-700/30 bg-purple-900/20;
}

.light-card {
  @apply border-yellow-700/30 bg-yellow-900/20;
}

.motion-card {
  @apply border-green-700/30 bg-green-900/20;
}

.air-card {
  @apply border-teal-700/30 bg-teal-900/20;
}
</style>