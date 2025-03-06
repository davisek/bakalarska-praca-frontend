import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';
import LaraDarkPurple from '@primeuix/themes/lara';
import FocusTrap from 'primevue/focustrap';

import ToggleButton from 'primevue/togglebutton';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import SelectButton from 'primevue/selectbutton';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

import './style.css';
import App from './App.vue';
import router from './plugins/router';
import { createPinia } from 'pinia';
import {createI18n} from "vue-i18n";
import axiosInstance, { setupAuthErrorHandling } from './plugins/axios';
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
    .use(PrimeVue, {
        ripple: true,
        inputStyle: 'filled',
        theme: {
            preset: LaraDarkPurple,
        }
    });

app.component('ToggleButton', ToggleButton);
app.component('ToggleSwitch', ToggleSwitch);
app.component('Button', Button);
app.component('Password', Password);
app.component('InputText', InputText);
app.component('Message', Message);
app.component('SelectButton', SelectButton);
app.component('Tabs', Tabs);
app.component('TabList', TabList);
app.component('Tab', Tab);
app.component('TabPanels', TabPanels);
app.component('TabPanel', TabPanel);

app.directive('focustrap', FocusTrap);
app.config.globalProperties.$axios = axiosInstance;
app.config.globalProperties.$mqtt = mqttClient;

router.isReady().then(() => {
    setupAuthErrorHandling(router);

    app.mount('#app')
});