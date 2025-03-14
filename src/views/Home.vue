<template>
  <div class="home-container">
    <!-- 头部欢迎标语 (背景填充整个 hero) -->
    <div class="hero">
      <div class="hero-overlay">
        <h1>了解 UV 指数，保护你的皮肤</h1>
        <p>紫外线可能对皮肤造成损害，学习如何有效防晒。</p>
      </div>
    </div>

    <!-- 1. 什么是 UV 辐射 -->
    <div class="info-section">
      <h2>What is UV radiation?</h2>
      <p>
        UV is a form of energy produced by the sun. The sun produces different types of energy:
      </p>
      <ul>
        <li><strong>Visible light</strong> – which we can see as sunlight.</li>
        <li><strong>Infrared radiation</strong> – which we feel as heat.</li>
        <li><strong>UV radiation</strong> – which we cannot see or feel.</li>
      </ul>
      <p>
        UV radiation levels are influenced by location, altitude, time of year, and cloud cover.
        Even on cool days, UV levels can be high, increasing the risk of skin damage.
      </p>
    </div>

    <!-- 2. 什么是 UV 指数 -->
    <div class="info-section">
      <h2>What is the UV Index?</h2>
      <p>The UV Index is a tool to help protect yourself from UV radiation. It classifies UV radiation levels into:</p>
      <ul>
        <li><strong>Low (1-2)</strong> - Safe exposure</li>
        <li><strong>Moderate (3-5)</strong> - Caution needed</li>
        <li><strong>High (6-7)</strong> - Protective measures advised</li>
        <li><strong>Very High (8-10)</strong> - Dangerous UV levels</li>
        <li><strong>Extreme (11+)</strong> - Maximum sun exposure risk</li>
      </ul>
      <p>
        The Australian Radiation Protection and Nuclear Safety Agency (ARPANSA) provides real-time UV Index data.
        Check their website for the UV levels in your area today.
      </p>
    </div>

    <!-- 3. SunSmart 5 步防晒指南 -->
    <div class="tips-section">
      <h2>Follow the five SunSmart steps whenever the UV is 3 or above</h2>
      <ol>
        <li>Slip on protective clothing (long sleeves and pants for coverage).</li>
        <li>Slop on SPF 50+ sunscreen and reapply every 2 hours.</li>
        <li>Slap on a broad-brimmed hat to protect your face, neck, and ears.</li>
        <li>Seek shade, especially from 10 am to 4 pm.</li>
        <li>Slide on sunglasses that meet Australian standards.</li>
      </ol>
      <p>
        Even on cloudy days, UV can be strong. Always check the UV Index and follow these steps whenever the level is 3 or higher.
      </p>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Footer from "@/components/Footer.vue";

export default {
  components: {
    Footer,
  },
};
</script>

<style scoped>
/* 整个首页布局 */
.home-container {
  text-align: center;
  padding: 20px;
}

/* 头部 hero，背景填充 */
.hero {
  width: 100%;
  height: 400px; /* 让背景有足够高度 */
  background-image: url('/pic4.jpg'); /* 背景图片 */
  background-size: cover; /* 让图片填满 */
  background-position: center; /* 居中显示 */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 10px;
}

/* 让文字部分居中，变大 */
.hero-overlay {
  text-align: center;
}

.hero-overlay h1 {
  font-size: 72px; /* 标题加大 */
  font-weight: bold;
  margin-bottom: 15px;
  color: white;
}

.hero-overlay p {
  font-size: 32px; /* 介绍字体变大 */
  font-weight: 500;
  color: white;
}

/* 科普内容 */
.info-section {
  margin-top: 30px;
  text-align: left;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.1);
}

.info-section h2 {
  color: #d18463;
}

.info-section ul,
.info-section ol {
  padding-left: 20px;
}

.info-section li {
  font-size: 16px;
  margin-bottom: 8px;
}

/* 5 步防晒指南 */
.tips-section {
  margin-top: 30px;
  text-align: left;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.1);
}

.tips-section h2 {
  color: #d18463;
}

.tips-section ol {
  padding-left: 20px;
}

.tips-section li {
  font-size: 16px;
  margin-bottom: 8px;
}
</style>