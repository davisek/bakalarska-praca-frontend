<script setup lang="ts">
import {onMounted, onUnmounted, reactive, ref, watch} from 'vue';
import axiosInstance from '@/plugins/axios';
import mqttClient from '@/plugins/mqtt';
import {formatDateTime} from "@/utils/dateUtil.ts";
import {Sensor, CurrentSensorData, MqttSensorPayload} from '@/types';
import ALoadingScreen from "@/components/a-loading-screen.vue";

const props = defineProps({
  sensor: {
    type: Object as () => Sensor,
    required: true,
  },
});

const sensorData = reactive<CurrentSensorData>({
  value: null,
  symbol: '',
  recordedAt: '',
  error: null,
});

const isLoading = ref(true);

const fetchSensorData = async () => {
  isLoading.value = true;
  try {
    const response = await axiosInstance.get('/sensor-readings/' + props.sensor.type);
    sensorData.value = response.value;
    sensorData.symbol = response.symbol;
    sensorData.recordedAt = response.recorded_at;
    console.log(sensorData)
    sensorData.error = null;
  } catch (err) {
    sensorData.error = `Failed to load ${props.sensor.type} data`;
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const handleMQTTMessage = (topic: string, message: Buffer) => {
  const payload = JSON.parse(message.toString()) as MqttSensorPayload;
  if (topic === `${props.sensor.type}-data`) {
    sensorData.value = payload.value;
    sensorData.recordedAt = payload.created_at;
  }
};

const subscribeToMQTTTopics = () => {
  mqttClient.subscribe(`${props.sensor.type}-data`, (err) => {
    if (!err) console.log('Subscribed to sensor');
    sensorData.error = null;
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

    <div class="text-center p-3 text-red-500" v-if="sensorData.error">{{ sensorData.error }}</div>
    <div v-else>
      <div class="lg:flex flex-none justify-center lg:ml-2 ml-0">
        <div class="w-full lg:w-5/6">
          <h3 class="text-md font-bold mb-2 text-gray-500">{{ props.sensor.display_name }} Data</h3>
          <p class="text-md">{{ props.sensor.display_name }}: <span class="font-bold">{{ sensorData.value }} {{ sensorData.symbol }}</span></p>
          <p class="text-md"><span>Recorded at:</span> <span class="font-bold" v-if="sensorData.recordedAt">{{ formatDateTime(sensorData.recordedAt) }}</span>
            <span v-else>No data available</span>
          </p>
        </div>
        <div class="w-full lg:w-1/6 justify-center mt-2 mr-2">
          <img :src="sensor.icon_path" :alt="sensor.sensor_name" class="lg:w-10/12 w-6/12 m-auto" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>