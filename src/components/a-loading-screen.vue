<script setup lang="ts">
defineProps({
  isLoading: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: 'Loading...'
  }
});
</script>

<template>
  <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center z-20 bg-gray-900/50 backdrop-blur-sm rounded-lg"
  >
    <div class="flex flex-col items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
      <p class="text-purple-300">{{ message }}</p>
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