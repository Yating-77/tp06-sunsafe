<template>
  <div class="container mt-4">
    <h2 class="text-center mb-3">Generate Personalised Recommendation</h2>

    <!-- ✅ Skin Tone 滑块 -->
    <h5 class="text-center">Select your skin tone:</h5>
    <div class="skin-tone-wrapper">
      <div class="d-flex justify-content-between fw-bold text-center">
        <span>Light</span>
        <span>Medium</span>
        <span>Dark</span>
      </div>
      <div class="skin-tone-scale position-relative mx-auto">
        <div 
          v-for="(color, index) in skinToneColors" 
          :key="index" 
          class="skin-tone-block" 
          :style="{ backgroundColor: color }"
        ></div>
        <input 
          type="range" 
          min="1" 
          max="3" 
          step="1" 
          v-model="skinTone" 
          class="form-range skin-tone-slider"
        >
      </div>
    </div>

    <p class="mt-3"><strong>Current UV Index:</strong> <span class="fs-5 fw-bold">{{ uvIndex }}</span></p>

    <button @click="fetchRecommendation" class="btn btn-orange mt-3">Get Recommendation</button>
    <div v-if="errorMessage" class="alert alert-danger mt-2">
      {{ errorMessage }}
    </div>
    <div v-if="recommendation" class="mt-4 p-3 bg-light rounded border">
      <h4 class="fw-bold">Clothing: {{ recommendation.clothing_recommendation }}</h4>
      <h4 class="fw-bold">Hat: {{ recommendation.hat_recommendation }}</h4>
      <h4 class="fw-bold">Sunglasses: {{ recommendation.sunglasses_recommendation }}</h4>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    uvIndex: Number, // ✅ 传入 UV Index
  },
  data() {
    return {
      skinTone: 2, // 默认中间值
      recommendation: null,
      errorMessage: "",
      // ✅ Skin Tone 背景颜色
      skinToneColors: ["#FAF0E6", "#F4C7A1", "#C08A60", "#8B5A2B", "#5D3A00"],
    };
  },
  watch: {
    // ✅ 监听 UV Index 变化，自动更新推荐内容
    uvIndex(newUv) {
      if (newUv !== null) {
        this.fetchRecommendation();
      }
    }
  },
  computed: {
    selectedSkinTone() {
      if (this.skinTone < 1.5) return "Light";
      if (this.skinTone > 2.5) return "Dark";
      return "Medium";
    }
  },
  methods: {
    async fetchRecommendation() {
  if (this.uvIndex === null) {
    this.errorMessage = "Please check the UV index first before getting recommendations.";
    return;
  }

  // ✅ 转换 skinTone 数字为字符串
  const skinToneText = this.skinTone < 1.5 ? "Light" : this.skinTone > 2.5 ? "Dark" : "Medium";

  try {
    const response = await axios.get('http://localhost:3000/api/recommendation', {
      params: { skinTone: skinToneText, uvIndex: this.uvIndex }
    });
    this.recommendation = response.data;
    this.errorMessage = ""; 
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    this.errorMessage = "Failed to fetch recommendation. Please try again.";
  }
}

}
};
</script>

<style scoped>
/* ✅ 调整 Skin Tone 滑块整体宽度 */
.skin-tone-wrapper {
  width: 80%;
  max-width: 600px;
  margin: 0 auto;
}

/* ✅ 滑块背景 */
.skin-tone-scale {
  display: flex;
  position: relative;
  width: 100%;
  height: 30px; /* 更宽 */
  border-radius: 15px;
  overflow: hidden;
  margin: 0 auto;
}

/* ✅ 滑块背景色块 */
.skin-tone-block {
  flex: 1;
  height: 100%;
}

/* ✅ 滑块样式 */
.skin-tone-slider {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  appearance: none;
  background: transparent;
  cursor: pointer;
}

/* ✅ Bootstrap 滑块样式 */
.form-range::-webkit-slider-runnable-track {
  height: 5px;
  background: #ddd;
  border-radius: 5px;
}

.form-range::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: orange;
  border-radius: 50%;
  margin-top: -7px;
}

/* ✅ 橘色按钮 */
.btn-orange {
  background-color: #FFA500;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 18px;
  border-radius: 5px;
}

.btn-orange:hover {
  background-color: #e69500;
}
</style>
