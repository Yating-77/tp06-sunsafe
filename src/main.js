import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js'; // 确保路径正确
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

const app = createApp(App);
app.use(router);
app.mount('#app');