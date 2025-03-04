<script setup lang="ts">

const props = defineProps({
  errorMessage: {
    type: String,
    required: false
  }
});

</script>

<template>
  <div v-if="errorMessage" class="error-message">
    {{ errorMessage }}
  </div>
</template>

<style scoped>
.error-message {
  @apply mt-8 p-4 bg-red-500/20 text-red-300 font-semibold;
  @apply rounded-lg border-l-4 border-red-500 text-center;
}
</style>