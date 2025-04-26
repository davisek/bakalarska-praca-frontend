<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  isLoading?: boolean;
  message?: string;
}>();

const messageText = computed(() => props.message ?? t('common.loading'));
</script>

<template>
  <div
    v-if="props.isLoading"
    class="absolute inset-0 flex items-center justify-center z-20 bg-gray-900/50 backdrop-blur-sm rounded-lg"
  >
    <div class="flex flex-col items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
      <p class="text-purple-300">{{ messageText }}</p>
    </div>
  </div>
</template>
<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>