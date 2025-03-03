import { createApp } from 'vue'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
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

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    }
})

const app = createApp(App)
    .use(pinia)
    .use(router)
    .use(i18n)
    .use(vuetify)

app.config.globalProperties.$axios = axiosInstance;
app.config.globalProperties.$mqtt = mqttClient;

router.isReady().then(() => {
    app.mount('#app')
})