<script setup>
import Sidebar from './components/Sidebar.vue';
</script>

<template>
  <div class="app-container">
    <Sidebar />
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped>
/* 主容器，确保侧边栏和内容布局正确 */
.app-container {
  display: flex;
}

/* 页面内容 */
.content {
  margin-left: 200px; /* 让内容右移，避免被侧边栏覆盖 */
  padding: 20px;
  flex-grow: 1;
}
</style>