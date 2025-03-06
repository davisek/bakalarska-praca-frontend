<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import axiosInstance from '@/plugins/axios';
import { showSuccess, showError } from '@/utils/notificationUtil';
import ANotification from "@/components/a-notification.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const loading = ref(true);
const savingNotifications = ref(false);
const notificationSettings = ref([]);

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
    showError('Failed to load notification settings');
    loading.value = false;
  }
};

const saveNotificationSettings = async () => {
  try {
    savingNotifications.value = true;

    const updates = notificationSettings.value.map(setting => ({
      id: setting.id,
      email_notification_allowed: setting.email_notification_allowed
    }));

    const response = await axiosInstance.put('/settings', { settings: updates });
    showSuccess(response.message);
    savingNotifications.value = false;
  } catch (error) {
    showError('Failed to update notification settings');
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
        <h3 class="text-xl font-semibold text-purple-300 mb-2">Email Notifications</h3>
        <p class="text-gray-300">Choose which sensors you want to receive email notifications for.</p>
      </div>

      <div class="card flex justify-end mb-4">
        <ToggleButton
            v-model="allEnabled"
            onLabel="Enabled"
            offLabel="Disabled"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            class="w-auto"
            aria-label="Toggle All Notifications"
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
                :class="setting.sensor.color_class"
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
            </div>
          </div>

          <div class="card flex justify-center">
            <ToggleSwitch v-model="setting.email_notification_allowed">
              <template #handle="{ checked }">
                <i :class="['!text-xs pi', { 'pi-check': checked, 'pi-times': !checked }]" />
              </template>
            </ToggleSwitch>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <Button
            :label="!savingNotifications ? 'Save changes' : 'Saving...'"
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