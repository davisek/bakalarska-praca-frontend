<script setup lang="ts">
import {onMounted, onUnmounted, reactive, watch} from 'vue';
import axiosInstance from '@/plugins/axios';
import mqttClient from '@/plugins/mqtt';
import {formatDateTime} from "@/utils/dateUtil.ts";

const props = defineProps({
  sensor: {
    type: Object as () => {
      sensor_name: string;
      type: string;
      display_name: string;
      icon_path?: string;
    },
    required: true,
  },
});

const sensorData = reactive({
  value: null as number | null,
  symbol: '' as string,
  recordedAt: '' as string,

  error: '' as string | null,
});


const fetchSensorData = async () => {
  try {
    const response = await axiosInstance.get('/sensor-readings/' + props.sensor.type);
    sensorData.value = response.value;
    sensorData.symbol = response.symbol;
    sensorData.recordedAt = response.recorded_at;

    sensorData.error = null;
  } catch (err) {
    sensorData.error = `Failed to load ${props.sensor.type} data`;
    console.error(err);
  }
};

const handleMQTTMessage = (topic: string, message: Buffer) => {
  const payload = JSON.parse(message.toString());
  if (topic === `${props.sensor.type}-data`) {
    sensorData.value = payload.value;
    sensorData.recordedAt = payload.created_at;
  }

};

const subscribeToMQTTTopics = () => {
  mqttClient.subscribe(`${props.sensor.type}-data`, (err) => {
    if (!err) console.log('Subscribed to sensor');
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
    <div class="text-center p-3 text-red-500" v-if="sensorData.error">{{ sensorData.error }}</div>
    <div v-else>
      <div class="lg:flex flex-none justify-center lg:ml-2 ml-0">
        <div class="w-full lg:w-5/6">
          <h3 class="text-xl font-bold mb-2">{{ props.sensor.display_name }} Data</h3>
          <p>{{ props.sensor.display_name }}: {{ sensorData.value }} {{ sensorData.symbol }}</p>
          <p>
            Recorded at:
            <span v-if="sensorData.recordedAt">
            {{ formatDateTime(sensorData.recordedAt) }}
          </span>
            <span v-else>
            No data available
          </span>
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