import mqtt from 'mqtt';

const options = {
    connectTimeout: 4000,
    clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
    username: import.meta.env.VITE_MQTT_BROKER_USERNAME,
    password: import.meta.env.VITE_MQTT_BROKER_PASSWORD,
};
const mqttClient = mqtt.connect(import.meta.env.VITE_MQTT_BROKER_URL, options);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
});

mqttClient.on('error', (err) => {
    console.error('MQTT Connection error:', err);
});

export default mqttClient;
