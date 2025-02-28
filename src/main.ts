import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import vue3GoogleLogin from 'vue3-google-login';
import './style.css'
import router from './router/routes.js';



const pinia = createPinia()
const app = createApp(App);

app.use(pinia)
app.use(router)

app.use(vue3GoogleLogin, {
  clientId: '150428135378-7p5fkl7douv1sj3kd0tofav3kneks7lv.apps.googleusercontent.com' // Reemplaza 'TU_CLIENT_ID' con tu Client ID real
});

app.mount('#app');
