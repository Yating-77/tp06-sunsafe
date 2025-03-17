import { createRouter, createWebHashHistory } from 'vue-router'; // ✅ 改用 Hash Mode
import Home from '../views/Home.vue';
import Inform from '../views/Inform.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/inform', component: Inform }
];

const router = createRouter({
  history: createWebHashHistory(),  // ✅ 改成 Hash Mode，避免 Vue 拦截 API
  routes,
});

export default router;