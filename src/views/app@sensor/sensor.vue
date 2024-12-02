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
    visible: ref(true),
  },
  {
    label: "Data Table",
    component: ADataTable,
    visible: ref(true),
  },
];

const toggleSection = (section) => {
  section.visible.value = !section.visible.value;
};
</script>

<template>
  <ABreadcrumb/>

  <div class="p-10 space-y-4">
    <div class="grid lg:grid-cols-3 grid-cols-1 gap-4">
      <!-- Sensor Readings -->
      <div>
        <button
            @click="toggleSection(sections[0])"
            class='w-full flex items-center bg-blend-darken shadow-box py-2 px-4 rounded-md text-lg hover:bg-gray-800 transition'
        >
          <span class="mr-auto">{{ sections[0].visible.value ? "Hide" : "Show" }} {{ sections[0].label }}</span>
          <span
              :class="[
                'transition-transform transform duration-300 ease-in-out',
                sections[0].visible.value ? 'rotate-180' : 'rotate-0',
              ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"/>
            </svg>
          </span>
        </button>
        <div class="flex justify-center items-center h-full">
          <transition name="fade-down" mode="out-in">
            <div
                v-show="sections[0].visible.value"
                class="flex justify-center items-center rounded-full shadow-box transition-all circle p-2 mb-12 gradient-component"
            >
              <div class="w-5/6 bg-gray-900 rounded-full h-5/6 flex justify-center items-center text-center shadow-box">
                <component :is="sections[0].component" :type="props.type" :display-name="props.displayName" />
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Data Table -->
      <div class="col-span-2">
        <button
            @click="toggleSection(sections[2])"
            class='w-full flex items-center bg-blend-darken shadow-box py-2 px-4 rounded-md text-lg hover:bg-gray-800 transition'
        >
          <span class="mr-auto">{{ sections[2].visible.value ? "Hide" : "Show" }} {{ sections[2].label }}</span>
          <span
              :class="[
                'transition-transform transform duration-300 ease-in-out',
                sections[2].visible.value ? 'rotate-180' : 'rotate-0',
              ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"/>
            </svg>
          </span>
        </button>
        <transition name="fade-down" mode="out-in">
          <div v-show="sections[2].visible.value" class="mt-2 border p-4 rounded-md">
            <component :is="sections[2].component" :type="props.type" :display-name="props.displayName" />
          </div>
        </transition>
      </div>
    </div>

    <!-- Data Graph -->
    <div>
      <button
          @click="toggleSection(sections[1])"
          class='w-full flex items-center bg-blend-darken shadow-box py-2 px-4 rounded-md text-lg hover:bg-gray-800 transition'
      >
        <span class="mr-auto">{{ sections[1].visible.value ? "Hide" : "Show" }} {{ sections[1].label }}</span>
        <span
            :class="[
              'transition-transform transform duration-300 ease-in-out',
              sections[1].visible.value ? 'rotate-180' : 'rotate-0',
            ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"/>
          </svg>
        </span>
      </button>
      <transition name="fade-down" mode="out-in">
        <div v-show="sections[1].visible.value" class="mt-2 border gradient-border p-4 rounded-md">
          <component :is="sections[1].component" :type="props.type" :display-name="props.displayName" />
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.circle {
  width: 25em;
  height: 25em;
}

.fade-down-enter-active,
.fade-down-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>