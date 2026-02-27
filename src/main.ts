import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import './style.css'
import { PrimeVue } from '@primevue/core';
import DialogService from 'primevue/dialogservice';
import Aura from '@primeuix/themes/aura';


const app = createApp(App)

app.use(router)
app.use(Vue3Toastify, {
  autoClose: 3000,
});
app.use(PrimeVue,{
       theme: {
        preset: Aura
    }
})
app.use(DialogService)
app.mount('#app')
