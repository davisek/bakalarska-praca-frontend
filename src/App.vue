<script setup lang="ts">
import ANavbar from "@/components/a-navbar.vue";
</script>

<template>
  <ANavbar />
  <div class="max-w-screen-xl m-auto p-8 text-center">
    <router-view />
  </div>
</template>

<style scoped>

</style>
