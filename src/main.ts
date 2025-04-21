import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import vue3GoogleLogin from 'vue3-google-login';
import './style.css'
import router from './router/index';



const pinia = createPinia()
const app = createApp(App);

app.use(pinia)
app.use(router)

app.use(vue3GoogleLogin, {
  clientId: '569719966413-vb4hran623dj2mj7urgumsc6u5627dmb.apps.googleusercontent.com' // Reemplaza 'TU_CLIENT_ID' con tu Client ID real
});

app.mount('#app');
