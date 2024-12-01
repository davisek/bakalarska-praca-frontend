<script setup lang="ts">
import { ref } from "vue";
import ASensorReadings from "@/components/a-sensor-readings.vue";
import ADataGraph from "@/components/a-data-graph.vue";
import ADataTable from "@/components/a-data-table.vue";
import ABreadcrumb from "@/components/a-breadcrumb.vue";

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
});

const sections = [
  {
    label: "Sensor Readings",
    component: ASensorReadings,
    visible: ref(true),
  },
  {
    label: "Data Graph",
    component: ADataGraph,
    visible: ref(false),
  },
  {
    label: "Data Table",
    component: ADataTable,
    visible: ref(false),
  },
];

const toggleSection = (section) => {
  section.visible.value = !section.visible.value;
};
</script>

<template>
  <ABreadcrumb/>

  <div class="p-10">
    <div v-for="(section, index) in sections" :key="index" class="mb-4">
      <button
          @click="toggleSection(section)"
          :class="[
          'w-full flex items-center bg-blend-darken shadow-lg py-2 px-4 rounded-md text-white text-lg focus:outline-none hover:bg-gray-800 transition',
          section.visible.value ? 'bg-gray-900' : 'bg-blend-darken',
        ]"
      >
        <span class="mr-auto">{{ section.visible ? "Hide" : "Show" }} {{ section.label }}</span>
        <span
            :class="[
            'transition-transform transform duration-300 ease-in-out',
            section.visible.value  ? 'rotate-180' : 'rotate-0',
          ]"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"/>
        </svg>
      </span>
      </button>

      <div v-show="section.visible.value" class="mt-2 border p-4 rounded-md">
        <component :is="section.component" :type="props.type" :display-name="props.displayName" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>