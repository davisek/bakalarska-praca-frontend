import { createApp } from 'vue'

import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';
import Aura from '@primeuix/themes/aura';
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
import Paginator from 'primevue/paginator';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import InputNumber from "primevue/inputnumber";
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";

import './style.css';
import './primevue-style.css';
import App from './App.vue';
import router from './plugins/router';
import { createPinia } from 'pinia';
import i18n from './plugins/i18n';
import axiosInstance, { setupAuthErrorHandling } from './plugins/axios';
import mqttClient from './plugins/mqtt';

const pinia = createPinia()

const app = createApp(App)
    .use(pinia)
    .use(router)
    .use(i18n)
    .use(PrimeVue, {
        ripple: true,
        theme: {
            preset: Aura,
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
app.component('Paginator', Paginator);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ColumnGroup', ColumnGroup);
app.component('Row', Row);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('InputNumber', InputNumber);
app.component('Tag', Tag);
app.component('Dialog', Dialog);
app.component('DatePicker', DatePicker);
app.component('Select', Select);

app.directive('focustrap', FocusTrap);
app.config.globalProperties.$axios = axiosInstance;
app.config.globalProperties.$mqtt = mqttClient;

router.isReady().then(() => {
    setupAuthErrorHandling(router);

    app.mount('#app')
});