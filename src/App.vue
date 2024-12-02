<script setup lang="ts">
import ANavbar from "@/components/a-navbar.vue";
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <ANavbar class="sticky top-0 h-screen w-1/6 bg-gray-800 text-gray-300"/>

    <!-- Main content -->
    <div class="w-5/6 p-10 min-h-100 gradient-background text-gray-100 bg-cover">
      <router-view />
    </div>
  </div>
</template>

<style scoped>

</style>
