<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/utils/themeUtil';

const { t } = useI18n();
const isDarkMode = useTheme();

const steps = ref([
  {
    id: 1,
    name: t('admin.sensors.steps.step1Title'),
    text: t('admin.sensors.steps.step1Text'),
    image: 'step-gpio-1.png'
  },
  {
    id: 2,
    name: t('admin.sensors.steps.step2Title'),
    text: t('admin.sensors.steps.step2Text'),
    image: 'step-api-function-2.png'
  },
  {
    id: 3,
    name: t('admin.sensors.steps.step3Title'),
    text: t('admin.sensors.steps.step3Text'),
    image: 'step-mqtt-function-3.png'
  },
  {
    id: 4,
    name: t('admin.sensors.steps.step4Title'),
    text: t('admin.sensors.steps.step4Text'),
    image: 'step-mqtt-node-4.png'
  },
  {
    id: 5,
    name: t('admin.sensors.steps.step5Title'),
    text: t('admin.sensors.steps.step5Text'),
    image: 'step-http-node-5.png'
  }
]);
</script>

<template>
  <div class="p-4 tutorial-container">
    <div class="card">
      <Carousel
        :value="steps"
        :numVisible="1"
        :numScroll="1"
        verticalViewPortHeight="330px"
        containerClass="flex items-start"
      >
        <template #item="slotProps">
          <div :class="['border rounded m-2 p-4', isDarkMode ? 'border-surface-700' : 'border-surface-200']">
            <div class="mb-4">
              <div class="relative mx-auto">
                <img :src="`/images/tutorial/${slotProps.data.image}`" :alt="slotProps.data.name" class="w-full rounded object-cover" />
              </div>
            </div>
            <div :class="['mb-4 font-medium', isDarkMode ? 'text-gray-200' : 'text-gray-200']">
              <h4 class="text-lg font-bold mb-2">
                {{ slotProps.data.name }}
              </h4>
              {{ slotProps.data.text }}
            </div>
          </div>
        </template>
      </Carousel>
    </div>

    <div class="mt-8">
      <h3 :class="['font-bold text-lg mb-4', isDarkMode ? 'text-purple-300' : 'text-purple-300']">
        {{ t('admin.sensors.steps.bestPractices') }}
      </h3>
      <ul class="space-y-3">
        <li :class="['flex items-start gap-2', isDarkMode ? 'text-gray-300' : 'text-gray-300']">
          <span class="text-purple-500 font-bold text-lg">•</span>
          {{ t('admin.sensors.steps.bestPractice1') }}
        </li>
        <li :class="['flex items-start gap-2', isDarkMode ? 'text-gray-300' : 'text-gray-300']">
          <span class="text-purple-500 font-bold text-lg">•</span>
          {{ t('admin.sensors.steps.bestPractice2') }}
        </li>
        <li :class="['flex items-start gap-2', isDarkMode ? 'text-gray-300' : 'text-gray-300']">
          <span class="text-purple-500 font-bold text-lg">•</span>
          {{ t('admin.sensors.steps.bestPractice3') }}
        </li>
        <li :class="['flex items-start gap-2', isDarkMode ? 'text-gray-300' : 'text-gray-300']">
          <span class="text-purple-500 font-bold text-lg">•</span>
          {{ t('admin.sensors.steps.bestPractice4') }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.tutorial-container {
  max-width: 100%;
}
</style>