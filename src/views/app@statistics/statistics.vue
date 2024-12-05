<script setup lang="ts">
import ABreadcrumb from "@/components/a-breadcrumb.vue";
</script>

<template>
  <ABreadcrumb/>

  <div class="p-10">
<!--    <div>-->
<!--      <button-->
<!--          @click="toggleSection(sections[1])"-->
<!--          class='w-full flex items-center bg-blend-darken shadow-box py-2 px-4 rounded-md text-lg hover:bg-gray-800 transition'-->
<!--      >-->
<!--        <span class="mr-auto">{{ sections[1].visible.value ? "Hide" : "Show" }} {{ sections[1].label }}</span>-->
<!--        <span-->
<!--            :class="[-->
<!--              'transition-transform transform duration-300 ease-in-out',-->
<!--              sections[1].visible.value ? 'rotate-180' : 'rotate-0',-->
<!--            ]"-->
<!--        >-->
<!--          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">-->
<!--            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"/>-->
<!--          </svg>-->
<!--        </span>-->
<!--      </button>-->
<!--      <transition name="fade-down" mode="out-in">-->
<!--        <div v-show="sections[1].visible.value" class="mt-2 border gradient-border p-4 rounded-md">-->
<!--          <component :is="sections[1].component" :sensor="props.sensor" />-->
<!--        </div>-->
<!--      </transition>-->
<!--    </div>-->
  </div>
</template>
<style scoped>

</style>