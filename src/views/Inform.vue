<template>
  <div class="container text-center">
    <h2 class="mb-3">Check the Ultraviolet (UV) Index According to Suburb</h2>

    <!-- Search Bar with Autocomplete -->
    <div class="search-container">
      <input 
        v-model="suburb" 
        @input="fetchSuggestions"
        @keydown.enter="fetchUVIndex"
        class="form-control search-input" 
        placeholder="Enter suburb"
      >
      <!-- Autocomplete Suggestions -->
      <ul v-if="suggestions.length" class="autocomplete-list">
        <li v-for="(suggestion, index) in suggestions" 
            :key="index" 
            @click="selectSuburb(suggestion)"
            class="autocomplete-item">
          {{ suggestion }}
        </li>
      </ul>
      <button @click="fetchUVIndex" class="btn btn-primary search-button">Search</button>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-danger mt-2">{{ errorMessage }}</div>

    <!-- Display UV Index Results -->
    <div v-if="uvIndex !== null" class="alert alert-success">
      <h4>UV Index for {{ locationName }}</h4>
      <p><strong>Latitude:</strong> {{ latitude }}, <strong>Longitude:</strong> {{ longitude }}</p>
      <p class="fs-4">UV Index: <strong>{{ uvIndex }}</strong></p>

      <!-- UV Index Scale -->
      <div class="uv-scale">
        <div 
          v-for="(level, index) in uvLevels" 
          :key="index" 
          class="uv-level"
          :class="[level.class, uvIndex >= level.min && uvIndex <= level.max ? 'active' : '']"
          :style="{ width: (100 / uvLevels.length) + '%' }"
        >
          {{ level.label }} <br>
          <small>({{ level.min }} - {{ level.max }})</small>
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="alert alert-info">Loading...</div>

  </div>
  <div class="chart-container">
    <!-- UV Index Trends -->
    <h4 class="chart-title">Historical Climate Trends in Australia</h4>
    <p class="chart-description">
      This chart shows the yearly changes in the median UV Index across Australia.
      A higher UV Index indicates stronger ultraviolet radiation, which increases the risk of sunburn and skin damage.
    </p>
    <canvas ref="heatTrendChart"></canvas>

    <!-- Skin Cancer Trends -->
    <h4 class="chart-title">Skin Cancer Data</h4>
    <p class="chart-description">
      This chart illustrates the increasing incidence and mortality rates of skin cancer per 100,000 people.
      A rising trend in the incidence rate suggests the growing importance of sun protection measures.
    </p>
    <canvas ref="skinCancerChart"></canvas>
  </div> 
    <!-- Sun Safety Recommendations -->
    <Recommendation :uvIndex="uvIndex" />

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import Chart from 'chart.js/auto';

const suburb = ref('');
const uvIndex = ref(null);
const latitude = ref(null);
const longitude = ref(null);
const locationName = ref('');
const loading = ref(false);
const errorMessage = ref('');
const skinTone = ref(2);
const suggestions = ref([]);
const skinCancerChart = ref(null);
const heatTrendChart = ref(null);
const chartInstanceSkinCancer = ref(null);
const chartInstanceHeatTrend = ref(null);
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaXJpczAwNzc5OSIsImEiOiJjbTFyZmhqMXYwYTRxMmtxMjFzYTlmYWN2In0.lVDdt8jKxfx9nJqXHgQU6w';
const API_URL = 'http://sunsafe.mooo.com';
const GEOCODE_API_KEY = 'de3ca6f233e241b4960da73919f0bf55';
const WEATHER_API_KEY = '4300747fbdce7480245f3c9e02b943df';
import Recommendation from './Recommendation.vue'; // ✅ 引入 recommendation 组件

// ✅ 输入校验（防止输入无效字符）
const validateInput = () => {
  const regex = /^[a-zA-Z\s]+$/;  // 仅允许字母和空格
  if (!regex.test(suburb.value)) {
    errorMessage.value = 'Invalid suburb name. Please enter a valid name.';
    return false;
  }
  errorMessage.value = '';
  return true;
};

// ✅ 使用 Mapbox API 获取地址建议
const fetchSuggestions = async () => {
  if (suburb.value.length < 3) {
    suggestions.value = [];
    return;
  }

  if (!validateInput()) return;  // 检查输入是否合法

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${suburb.value}.json?autocomplete=true&country=AU&types=place,locality,neighborhood&access_token=${MAPBOX_ACCESS_TOKEN}`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      suggestions.value = data.features.map(feature => feature.place_name);
    } else {
      suggestions.value = [];
    }
  } catch (error) {
    console.error("Error fetching suburb suggestions:", error);
  }
};

// ✅ 选择建议地址
const selectSuburb = (selected) => {
  suburb.value = selected;
  suggestions.value = []; // 选中后隐藏列表
};

// ✅ 修正 fetchUVIndex 确保 `Clayton, Victoria, Australia` 可用
const fetchUVIndex = async () => {
  if (!suburb.value.trim()) {
    errorMessage.value = 'Please enter a valid suburb.';
    return;
  }

  try {
    // **使用 Mapbox API 获取坐标**
    const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(suburb.value)}.json?country=AU&access_token=${MAPBOX_ACCESS_TOKEN}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.features || geoData.features.length === 0) {
      throw new Error('Suburb not found. Please enter a valid suburb.');
    }

    // ✅ 提取坐标
    latitude.value = geoData.features[0].center[1];
    longitude.value = geoData.features[0].center[0];

    // ✅ 解析 suburb, state, postcode
    const placeData = geoData.features[0].context;
    
    // 🚀 **确保优先获取 suburb（locality/neighborhood），然后才是 city**
    const suburbName = placeData.find(d => d.id.includes("locality"))?.text ||
                       placeData.find(d => d.id.includes("neighborhood"))?.text ||
                       placeData.find(d => d.id.includes("place"))?.text ||
                       geoData.features[0].text || '';

    const state = placeData.find(d => d.id.includes("region"))?.text || '';
    const postcode = placeData.find(d => d.id.includes("postcode"))?.text || '';

    // ✅ **确保 locationName 不是空**
    locationName.value = `${suburbName}${state ? ', ' + state : ''}${postcode ? ', ' + postcode : ''}, Australia`.trim();

    if (!latitude.value || !longitude.value) {
      throw new Error("Failed to get coordinates. Please enter a valid suburb.");
    }

    // **获取 UV Index**
    const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude.value}&lon=${longitude.value}&appid=${WEATHER_API_KEY}`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    if (!weatherData.current || typeof weatherData.current.uvi === 'undefined') {
      throw new Error('Failed to retrieve UV index.');
    }

    uvIndex.value = parseFloat(weatherData.current.uvi.toFixed(1));
  } catch (error) {
    errorMessage.value = error.message;
  }
};

// UV Levels Data
const uvLevels = ref([
  { label: "Low", class: "low", min: 0, max: 2.5 },
  { label: "Moderate", class: "moderate", min: 2.5, max: 5.5 },
  { label: "High", class: "high", min: 5.5, max: 7.5 },
  { label: "Very High", class: "very-high", min: 7.5, max: 10.5 },
  { label: "Extreme", class: "extreme", min: 10.5, max: 16 },
]);

// 📌 存储数据
const skinCancerData = ref([]);
const heatTrendData = ref([]);

// 📌 获取数据的函数
const fetchSkinCancerData = async () => {
  try {
    const response = await fetch(`${API_URL}/skincancerdata`);
    const data = await response.json();
    skinCancerData.value = data;
    renderSkinCancerChart();
  } catch (error) {
    console.error("Error fetching skin cancer data:", error);
  }
};

// 📌 渲染 Skin Cancer Chart
const renderSkinCancerChart = async () => {
  await nextTick();
  if (skinCancerChart.value) {
    if (chartInstanceSkinCancer.value) chartInstanceSkinCancer.value.destroy();
    chartInstanceSkinCancer.value = new Chart(skinCancerChart.value.getContext('2d'), {
      type: 'line',
      data: {
        labels: skinCancerData.value.map(d => d.year),
        datasets: [
          {
            label: "Incidence Rate (per 100,000)",
            data: skinCancerData.value.map(d => d.incidence_rate),
            borderColor: '#FF5733',
            backgroundColor: 'rgba(255, 87, 51, 0.2)',
            fill: true
          },
          {
            label: "Mortality Rate (per 100,000)",
            data: skinCancerData.value.map(d => d.mortality_rate),
            borderColor: '#1E90FF',
            backgroundColor: 'rgba(30, 144, 255, 0.2)',
            fill: false
          }
        ]
      }
    });
  }
};

// 📌 获取 UV 历史数据
const fetchHeatTrendData = async () => {
  try {
    const response = await fetch(`${API_URL}/uvhistory`);
    const data = await response.json();
    heatTrendData.value = data;
    renderHeatTrendChart();
  } catch (error) {
    console.error("Error fetching UV history:", error);
  }
};

// 📌 渲染 UV Heat Trend Chart
const renderHeatTrendChart = async () => {
  await nextTick();
  if (heatTrendChart.value) {
    if (chartInstanceHeatTrend.value) chartInstanceHeatTrend.value.destroy();
    chartInstanceHeatTrend.value = new Chart(heatTrendChart.value.getContext('2d'), {
      type: 'line',
      data: {
        labels: heatTrendData.value.map(d => d.year),
        datasets: [{
          label: "Median UV Index",
          data: heatTrendData.value.map(d => d.median_uvi),
          borderColor: '#FFA500',
          backgroundColor: 'rgba(255, 165, 0, 0.2)',
          fill: true
        }]
      }
    });
  }
};
// Skin Tone Colors
const skinToneColors = ref(["#FAF0E6", "#F4C7A1", "#C08A60", "#8B5A2B", "#5D3A00"]);
// 📌 计算防晒建议
const clothingRecommendation = computed(() => uvIndex.value >= 7 ? "Wear long sleeves, pants, and a hat" : "Use light, breathable clothing");
const sunProtectionRecommendation = computed(() => skinTone.value < 1.5 ? "Use SPF 50+" : skinTone.value > 2.5 ? "Use SPF 15+" : "Use SPF 30+");
const sunExposureRecommendation = computed(() => uvIndex.value >= 8 ? "Avoid midday sun" : "Morning and evening are safer");

// 📌 在页面加载时获取数据
onMounted(() => {
  fetchSkinCancerData();
  fetchHeatTrendData();
});
</script>


<style scoped>
.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.search-button {
  margin-left: 10px;
}

.autocomplete-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-radius: 5px;
  max-height: 200px;
  overflow-y: auto;
}

.autocomplete-item {
  padding: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.autocomplete-item:hover {
  background: #f0f0f0;
}

.uv-scale {
  display: flex;
  height: 50px;
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
}

.uv-level {
  flex: 1;
}

.uv-level.active {
  border: 3px solid black;
  font-size: 16px;
}

.low { background-color: #C8E6C9; }
.moderate { background-color: #FFF9C4; }
.high { background-color: #FFE0B2; }
.very-high { background-color: #FFCDD2; }
.extreme { background-color: #E1BEE7; }

.skin-tone-scale {
  display: flex;
  position: relative;
  width: 100%;
  height: 30px;
  border-radius: 15px;
  overflow: hidden; /* 让色卡完美衔接 */
}

/* 色板 */
.skin-tone-block {
  flex: 1;
  height: 70px;  /* 让色卡足够大 */
  border-radius: 0px;  /* 让色块完全连贯 */
}

/* 滑块 */
.skin-tone-slider {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  appearance: none;
  background: transparent;
  cursor: pointer;
}

/* 滑块轨道 */
.skin-tone-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 5px;
  background: #ddd;
  border-radius: 5px;
}

/* 滑块小圆点 */
.skin-tone-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: orange;
  border-radius: 50%;
  margin-top: -6px; /* 让它居中 */
}

.skin-tone-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 10px;
  font-weight: bold;
}
/* ✅ 减少搜索框和结果的间距 */
.alert-success {
  margin-top: 10px;
}
</style>
