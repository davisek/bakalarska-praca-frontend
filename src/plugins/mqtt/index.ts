import mqtt from 'mqtt';

const options = {
    connectTimeout: 4000,
    clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
    username: 'david',
    password: 'davidko123',
};

const mqttClient = mqtt.connect('ws://192.168.137.48:9001', options);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
});

mqttClient.on('error', (err) => {
    console.error('MQTT Connection error:', err);
});

export default mqttClient;
