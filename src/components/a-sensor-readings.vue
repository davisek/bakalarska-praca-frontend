<script setup lang="ts">
import {onMounted, onUnmounted, reactive, ref, watch} from 'vue';
import axiosInstance from '@/plugins/axios';
import mqttClient from '@/plugins/mqtt';
import {formatDateTime} from "@/utils/dateUtil.ts";
import {Sensor, CurrentSensorData, MqttSensorPayload} from '@/types';
import ALoadingScreen from "@/components/a-loading-screen.vue";
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/utils/themeUtil'

const { t } = useI18n();
const props = defineProps<{ sensor: Sensor }>()
const isDarkMode = useTheme();

const sensorData = reactive<CurrentSensorData>({
  value: null,
  symbol: '',
  created_at: '',
});

const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

const fetchSensorData = async () => {
  isLoading.value = true;
  try {
    const response = await axiosInstance.get('/sensor-readings/' + props.sensor.type);
    sensorData.value = response.value;
    sensorData.symbol = response.symbol;
    sensorData.created_at = response.created_at;
    errorMessage.value = null;
  } catch (err) {
    errorMessage.value = t('sensor.failedToLoadData', { type: props.sensor.type });
  } finally {
    isLoading.value = false;
  }
};

const handleMQTTMessage = (topic: string, message: Buffer) => {
  const payload = JSON.parse(message.toString()) as MqttSensorPayload;
  if (topic === `${props.sensor.type}-data`) {
    sensorData.value      = payload.value;
    sensorData.created_at = new Date().toISOString();
    sensorData.symbol = props.sensor.unit_of_measurement;
  }
};

const subscribeToMQTTTopics = () => {
  mqttClient.subscribe(`${props.sensor.type}-data`, (err) => {
    errorMessage.value = null;
  });

  mqttClient.on('message', handleMQTTMessage);
};

const unsubscribeFromMQTTTopics = () => {
  mqttClient.unsubscribe(`${props.sensor.type}-data`);
};

watch(() => props.sensor.type, () => {
  fetchSensorData();
  unsubscribeFromMQTTTopics();
  subscribeToMQTTTopics();
});

onMounted(async () => {
  await fetchSensorData();
  subscribeToMQTTTopics();
});

onUnmounted(() => {
  unsubscribeFromMQTTTopics();
});
</script>

<template>
  <div>
    <ALoadingScreen :is-loading="isLoading" />

    <div class="lg:flex flex-none justify-center lg:ml-2 ml-0">
      <div class="w-full lg:w-5/6">
        <h3 :class="['text-md font-bold mb-2', isDarkMode ? 'text-gray-500' : 'text-gray-600']">
          {{ t('sensor.liveDataTitle', { name: props.sensor.display_name }) }}
        </h3>
        <p :class="['value-number text-xl font-bold bg-clip-text shadow-sm', isDarkMode ? 'dark-text-gradient-color' : 'light-text-gradient-color']"><span class="font-bold">{{ sensorData.value }} {{ sensorData.symbol || props.sensor.unit_of_measurement }}</span></p>
        <p :class="['text-md', isDarkMode ? 'text-white' : 'text-gray-700']">  <span>{{ t('sensor.recordedAt') }}:</span> <span class="font-bold" v-if="sensorData.created_at">{{ formatDateTime(sensorData.created_at) }}</span>
          <span v-else>{{ t('common.noDataFound') }}</span>
        </p>
      </div>
      <div class="w-full lg:w-1/6 justify-center mt-2">
        <img :src="sensor.icon_path" :alt="sensor.sensor_name" class="lg:w-10/12 w-4/12 m-auto" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.value-number {
  animation: pulse 3s infinite ease-in-out;
}
</style>