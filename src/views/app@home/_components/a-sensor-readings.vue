<script setup lang="ts">
import {onMounted, onUnmounted, reactive} from 'vue';
import axiosInstance from '@/plugins/axios';
import mqttClient from '@/plugins/mqtt';

const sensorData = reactive({
  temperature: null as number | null,
  symbolTemp: '' as string,
  recordedAtTemp: '' as string,

  humidity: null as number | null,
  symbolHum: '' as string,
  recordedAtHum: '' as string,

  error: '' as string | null,
});


const fetchSensorData = async (sensorType: string) => {
  try {
    const response = await axiosInstance.get('/sensor-readings', {
      params: { sensor: sensorType }
    });

    if (sensorType === 'temperature') {
      sensorData.temperature = response.value;
      sensorData.symbolTemp = response.symbol;
      sensorData.recordedAtTemp = response.recorded_at;
    } else if (sensorType === 'humidity') {
      sensorData.humidity = response.value;
      sensorData.symbolHum = response.symbol;
      sensorData.recordedAtHum = response.recorded_at;
    }

    sensorData.error = null;
  } catch (err) {
    sensorData.error = `Failed to load ${sensorType} data`;
    console.error(err);
  }
};

const handleMQTTMessage = (topic: string, message: Buffer) => {
  const payload = JSON.parse(message.toString());

  if (topic === 'sensor-data') {
    sensorData.temperature = payload.temperature_data;
    sensorData.humidity = payload.humidity_data;
    sensorData.recordedAtTemp = payload.created_at;
    sensorData.recordedAtHum = payload.created_at;
  }

};

const subscribeToMQTTTopics = () => {
  mqttClient.subscribe('sensor-data', (err) => {
    if (!err) console.log('Subscribed to sensor');
  });

  mqttClient.on('message', handleMQTTMessage);
};

const unsubscribeFromMQTTTopics = () => {
  mqttClient.unsubscribe('sensor-data');
};

onMounted(async () => {
  await fetchSensorData('temperature');
  await fetchSensorData('humidity');

  subscribeToMQTTTopics();
});

onUnmounted(() => {
  unsubscribeFromMQTTTopics();
});
</script>

<template>
  <div>
    <h2>Sensor Data</h2>

    <div v-if="sensorData.error">{{ sensorData.error }}</div>
    <div v-else>
      <div>
        <h3>Temperature Data</h3>
        <p>Temperature: {{ sensorData.temperature }} {{ sensorData.symbolTemp }}</p>
        <p>Recorded At: {{ sensorData.recordedAtTemp }}</p>
      </div>

      <div>
        <h3>Humidity Data</h3>
        <p>Humidity: {{ sensorData.humidity }} {{ sensorData.symbolHum }}</p>
        <p>Recorded At: {{ sensorData.recordedAtHum }}</p>
      </div>
    </div>
  </div>
</template>



<style scoped>

</style>