<script setup lang="ts">
import {onMounted, onUnmounted, reactive, watch} from 'vue';
import axiosInstance from '@/plugins/axios';
import mqttClient from '@/plugins/mqtt';

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

const sensorData = reactive({
  value: null as number | null,
  symbol: '' as string,
  recordedAt: '' as string,

  error: '' as string | null,
});


const fetchSensorData = async () => {
  try {
    const response = await axiosInstance.get('/sensor-readings/' + props.type);
    sensorData.value = response.value;
    sensorData.symbol = response.symbol;
    sensorData.recordedAt = response.recorded_at;

    sensorData.error = null;
  } catch (err) {
    sensorData.error = `Failed to load ${props.type} data`;
    console.error(err);
  }
};

const handleMQTTMessage = (topic: string, message: Buffer) => {
  const payload = JSON.parse(message.toString());
  if (topic === `${props.type}-data`) {
    sensorData.value = payload.value;
    sensorData.recordedAt = payload.created_at;
  }

};

const subscribeToMQTTTopics = () => {
  mqttClient.subscribe(`${props.type}-data`, (err) => {
    if (!err) console.log('Subscribed to sensor');
  });

  mqttClient.on('message', handleMQTTMessage);
};

const unsubscribeFromMQTTTopics = () => {
  mqttClient.unsubscribe(`${props.type}-data`);
};

watch(() => props.type, () => {
  fetchSensorData();
  unsubscribeFromMQTTTopics();
  subscribeToMQTTTopics()
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
    <div v-if="sensorData.error">{{ sensorData.error }}</div>
    <div v-else>
      <div>
        <h3 class="text-xl font-bold mb-2">{{ props.displayName }} Data</h3>
        <p>{{ props.displayName }}: {{ sensorData.value }} {{ sensorData.symbol }}</p>
        <p>Recorded At: {{ sensorData.recordedAt }}</p>
      </div>
    </div>
  </div>
</template>



<style scoped>

</style>