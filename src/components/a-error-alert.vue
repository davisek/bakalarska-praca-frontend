<!-- components/a-error-alert.vue -->
<script setup lang="ts">
defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'info'].includes(value)
  }
});
</script>

<template>
  <div
      :class="[
      'rounded-lg p-4 shadow-box mb-4',
      type === 'error' ? 'bg-red-900 bg-opacity-25 border-l-4 border-red-500' :
      type === 'warning' ? 'bg-yellow-900 bg-opacity-25 border-l-4 border-yellow-500' :
      'bg-blue-900 bg-opacity-25 border-l-4 border-blue-500'
    ]"
  >
    <div class="flex">
      <div class="flex-shrink-0">
      </div>
      <div class="ml-3">
        <p class="text-sm font-medium">{{ message }}</p>
      </div>
    </div>
  </div>
</template>