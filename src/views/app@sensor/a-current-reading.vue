<script setup lang="ts">
import {onMounted, onUnmounted, reactive, ref, watch} from 'vue';
import axiosInstance from '@/plugins/axios';
import mqttClient from '@/plugins/mqtt';
import {formatDateTime} from "@/utils/dateUtil.ts";
import {Sensor, CurrentSensorData, MqttSensorPayload} from '@/types';
import ALoadingScreen from "@/components/a-loading-screen.vue";
import AErrorMessage from "@/components/a-error-message.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  sensor: {
    type: Object as () => Sensor,
    required: true,
  },
});

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
    errorMessage.value = t('currentReading.loadError', { sensor: props.sensor.type });
  } finally {
    isLoading.value = false;
    sensorData.symbol = props.sensor.unit_of_measurement;
  }
};

const handleMQTTMessage = (topic: string, message: Buffer) => {
  const payload = JSON.parse(message.toString()) as MqttSensorPayload;
  if (topic === `${props.sensor.type}-data`) {
    sensorData.value = payload.value;
    sensorData.created_at = payload.created_at;
  }
};

const subscribeToMQTTTopics = () => {
  mqttClient.subscribe(`${props.sensor.type}-data`, (err) => {
    if (!err) console.log('Subscribed to sensor');
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
  <div class="rounded-lg relative flex flex-col justify-center items-center h-full pb-8">
    <ALoadingScreen :is-loading="isLoading" />
    <AErrorMessage :errorMessage="errorMessage" />

    <div v-if="!isLoading && !errorMessage" class="flex flex-col justify-center items-center h-full w-full">
      <div class="mb-4">
        <h3 class="text-lg font-bold text-gray-500">{{ props.sensor.display_name }}</h3>
      </div>

      <div class="flex flex-col justify-center items-center">
        <div class="flex items-baseline justify-center">
          <span class="value-number">{{ sensorData.value }}</span>
          <span class="value-unit">{{ sensorData.symbol }}</span>
        </div>
        <div class="flex items-center text-lg text-gray-400 mt-6 justify-center">
          <i class="pi pi-clock mr-2 text-gray-400"></i>
          <span v-if="sensorData.created_at">{{ formatDateTime(sensorData.created_at) }}</span>
          <span v-else class="text-gray-500">{{ t('currentReading.noData') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.value-number {
  @apply xl:text-8xl text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 shadow-sm;
}

.value-unit {
  @apply xl:text-4xl text-lg ml-2 text-gray-400 font-medium;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.value-number {
  animation: pulse 3s infinite ease-in-out;
}
</style>