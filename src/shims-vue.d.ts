import { AxiosInstance } from 'axios';
import { MqttClient } from 'mqtt';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $axios: AxiosInstance;
        $mqtt: MqttClient;
    }
}