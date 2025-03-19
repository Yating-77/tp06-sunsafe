<script setup>
import Sidebar from './components/Sidebar.vue';
import Footer from './components/Footer.vue';
</script>

<template>
  <div class="app-container">
    <Sidebar />
    <div class="main-content">
      <router-view></router-view>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.footer {
  background-color: orange;
  color: white;
  text-align: center;
  padding: 15px;
  width: 100%;
  position: relative;
}
</style>
