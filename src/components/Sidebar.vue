<template>
  <div class="navbar">
    <div class="logo-container">
      <router-link to="/">
        <img src="/pic1.jpg" alt="Logo" class="logo">
      </router-link>
    </div>
    <div class="nav-links">
      <router-link to="/" class="nav-item" active-class="active-link">
        <i class="bi bi-house-door"></i> HOME
      </router-link>
      <router-link to="/inform" class="nav-item" active-class="active-link">
        <i class="bi bi-info-circle"></i> Check UV
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: white;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 10px 20px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 50px;
  width: auto;
  object-fit: contain;
  cursor: pointer;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-item {
  color: black; 
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  height: 45px;
  text-align: center;
}

.active-link {
  color: white !important;
  background: orange !important;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(255, 165, 0, 0.3);
}

.nav-item:hover {
  background: orange;
  transform: scale(1.05); 
  color: white;
  border-radius: 8px;
  transition: 0.3s ease;
}

.nav-item:active {
  transform: scale(0.95);
  background: orange;
}

i {
  font-size: 18px;
  margin-left: 0;
  padding-left: 0;
}
</style>
