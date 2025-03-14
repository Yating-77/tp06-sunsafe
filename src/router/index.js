import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Inform from '../views/Inform.vue'; // 添加 Inform.vue

const routes = [
  { path: '/', component: Home },
  { path: '/inform', component: Inform } // Inform 页面
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;