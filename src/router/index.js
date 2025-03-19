import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Inform from '../views/Inform.vue';
const routes = [
  { path: '/', component: Home },
  { path: '/inform', component: Inform },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;