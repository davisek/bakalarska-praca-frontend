import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './plugins/router';
import { createPinia } from 'pinia';
import {createI18n} from "vue-i18n";
import axiosInstance from './plugins/axios';
import mqttClient from './plugins/mqtt';

const pinia = createPinia()

const i18n = createI18n({
    defaultLocale: 'sk',
    fallbackLocale: 'en'
})

const app = createApp(App)
    .use(pinia)
    .use(router)
    .use(i18n)

app.config.globalProperties.$axios = axiosInstance;
app.config.globalProperties.$mqtt = mqttClient;

router.isReady().then(() => {
    app.mount('#app')
})