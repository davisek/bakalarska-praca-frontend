<script setup lang="ts">
import { computed} from 'vue';
import { activeNotifications, removeNotification} from '@/utils/notificationUtil';

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (val: string) => ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'].includes(val)
  }
});

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-4 right-4';
  }
});

const getNotificationClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-900 bg-opacity-80 border-l-4 border-green-500';
    case 'error':
      return 'bg-red-900 bg-opacity-80 border-l-4 border-red-500';
    case 'info':
      return 'bg-blue-900 bg-opacity-80 border-l-4 border-blue-500';
    case 'warning':
      return 'bg-yellow-900 bg-opacity-80 border-l-4 border-yellow-500';
    default:
      return 'bg-gray-900 bg-opacity-80 border-l-4 border-gray-500';
  }
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle';
    case 'error':
      return 'mdi-alert-circle';
    case 'info':
      return 'mdi-information';
    case 'warning':
      return 'mdi-alert';
    default:
      return 'mdi-bell';
  }
};

const closeNotification = (id: number) => {
  removeNotification(id);
};
</script>

<template>
  <div :class="`fixed z-50 w-full max-w-md flex flex-col gap-2 ${positionClasses}`">
    <transition-group name="notification">
      <div
          v-for="notification in activeNotifications"
          :key="notification.id"
          :class="`rounded-lg shadow-lg p-4 mb-2 flex items-start ${getNotificationClasses(notification.type)}`"
      >
        <v-icon :icon="getNotificationIcon(notification.type)" class="mr-3 mt-0.5" />

        <div class="flex-grow">
          <p class="text-white font-medium">{{ notification.message }}</p>
        </div>

        <button
            @click="closeNotification(notification.id)"
            class="ml-auto text-white opacity-70 hover:opacity-100"
        >
          <v-icon icon="mdi-close" size="small" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>