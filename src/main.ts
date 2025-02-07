import { createApp } from 'vue';
import App from './App.vue';
import vue3GoogleLogin from 'vue3-google-login';

const app = createApp(App);

app.use(vue3GoogleLogin, {
  clientId: '150428135378-7p5fkl7douv1sj3kd0tofav3kneks7lv.apps.googleusercontent.com' // Reemplaza 'TU_CLIENT_ID' con tu Client ID real
});

app.mount('#app');
