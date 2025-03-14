<template>
    <div class="sidebar">
      <!-- 添加 Logo -->
      <div class="logo-container">
        <img src="/pic1.jpg" alt="Logo" class="logo">
      </div>
  
      <!-- 导航菜单 -->
      <router-link to="/" class="nav-item">
        <i class="bi bi-house-door"></i> HOME
      </router-link>
      <router-link to="/inform" class="nav-item">
        <i class="bi bi-info-circle"></i> INFORM
      </router-link>
  
      <!-- 分隔线 -->
      <div class="divider"></div>
  
      <!-- 额外的静态信息 -->
      <div class="nav-item static">CONTACT US</div>
      <div class="nav-item static">SUPPORT</div>
    </div>
  </template>
  
  <style scoped>
  /* 侧边栏整体样式 */
  .sidebar {
    width: 200px;
    height: 100vh;
    background-color: #e49b72;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;
    position: fixed;
    left: 0;
    top: 0;
  }
  
  /* Logo 容器 */
  .logo-container {
    width: 100%;
    height: auto;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
  }
  
  /* Logo 图片 */
  .logo {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
  
  /* 导航按钮样式 */
  .nav-item {
    color: white;
    text-decoration: none;
    font-size: 18px;
    padding: 15px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    justify-content: center;
    font-weight: bold;
  }
  
  /* 鼠标悬停 */
  .nav-item:hover {
    background-color: #d18b63;
  }
  
  /* Bootstrap 图标 */
  i {
    font-size: 20px;
  }


  </style>