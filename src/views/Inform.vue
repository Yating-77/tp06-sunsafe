<template>
  <div class="container text-center">
    <h2 class="mb-3">Check the Ultraviolet (UV) Index According to Suburb</h2>

    <!-- Search Bar -->
    <div class="input-group mb-3">
      <input v-model="suburb" class="form-control" placeholder="Enter suburb">
      <button @click="fetchUVIndex" class="btn btn-primary">Search</button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="alert alert-info">Loading...</div>

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

    <!-- Skin Cancer Risk -->
    <h4 class="mt-4">Historical Skin Cancer Trends (1982 - 2019)</h4>
    <canvas ref="cancerTrendChart"></canvas>

    <!-- Heat Trend in Australia -->
    <h4 class="mt-4">Historical Climate Trends in Australia</h4>
    <p>While Australia's average temperature has fluctuated in recent years, the median UV index has remained relatively stable, reflecting the complex interaction between climate factors and solar radiation exposure.</p>

    <canvas ref="heatTrendChart"></canvas>
    <p>From 2018 to 2023, Australia's average temperature exhibited fluctuations, peaking in 2019 before experiencing a decline and slight recovery in 2023. The median UV index also saw minor variations but remained within a narrow range, indicating that UV exposure risks persist despite temperature changes. Continuous monitoring and sun safety precautions are essential, regardless of yearly fluctuations in climate conditions.</p>
    <!-- Skin Tone Selector -->
    <div v-if="uvIndex !== null" class="skin-tone mt-4">
      <h4>Now that you understand the risks, let's personalise your sun protection advice according to the UV level you searched. Select your skin tone below:</h4>
      <div class="skin-tone-scale">
        <!-- 色板 -->
        <div v-for="(color, index) in skinToneColors" 
            :key="index" 
            class="skin-tone-block" 
            :style="{ backgroundColor: color }">
        </div>

        <!-- 滑块 -->
        <input type="range" min="1" max="3" step="0.01" v-model="skinTone" class="skin-tone-slider">
      </div>

      <div class="skin-tone-labels">
        <span :class="{ active: skinTone < 1.5 }">Light</span>
        <span :class="{ active: skinTone >= 1.5 && skinTone <= 2.5 }">Medium</span>
        <span :class="{ active: skinTone > 2.5 }">Dark</span>
      </div>
    </div>

    <!-- Sun Safety Recommendations -->
    <div v-if="uvIndex !== null" class="recommendations mt-4">
      <h4>Sun Safety Recommendations</h4>
      <p><strong>Clothing:</strong> {{ clothingRecommendation }}</p>
      <p><strong>Sun Protection:</strong> {{ sunProtectionRecommendation }}</p>
      <p><strong>Best Time to Go Outside:</strong> {{ sunExposureRecommendation }}</p>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
  </div>
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

const cancerTrendChart = ref(null);
const heatTrendChart = ref(null);
const chartCancerInstance = ref(null);
const chartHeatInstance = ref(null);

const GEOCODE_API_KEY = 'de3ca6f233e241b4960da73919f0bf55';
const WEATHER_API_KEY = '4300747fbdce7480245f3c9e02b943df';

// Fetch UV Index
const fetchUVIndex = async () => {
  if (!suburb.value.trim()) {
    errorMessage.value = 'Please enter a valid suburb.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  uvIndex.value = null;
  latitude.value = null;
  longitude.value = null;
  locationName.value = '';

  try {
    // Step 1: Convert Suburb to Coordinates
    const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${suburb.value},Australia&key=${GEOCODE_API_KEY}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('Suburb not found. Please enter a valid suburb.');
    }

    latitude.value = geoData.results[0].geometry.lat;
    longitude.value = geoData.results[0].geometry.lng;
    locationName.value = geoData.results[0].formatted;

    // Step 2: Fetch UV Index using Coordinates
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

  loading.value = false;
};

// UV Levels Data
const uvLevels = ref([
  { label: "Low", class: "low", min: 0, max: 2.5 },
  { label: "Moderate", class: "moderate", min: 2.5, max: 5.5 },
  { label: "High", class: "high", min: 5.5, max: 7.5 },
  { label: "Very High", class: "very-high", min: 7.5, max: 10.5 },
  { label: "Extreme", class: "extreme", min: 10.5, max: 16 },
]);

// 渲染 Chart.js 图表
const renderCharts = async () => {
  await nextTick();

  if (cancerTrendChart.value) {
    if (chartCancerInstance.value) chartCancerInstance.value.destroy();
    chartCancerInstance.value = new Chart(cancerTrendChart.value.getContext('2d'), {
      type: 'line',
      data: {
        labels: ["1982", "1990", "2000", "2010", "2019"],
        datasets: [{
          label: "Melanoma Incidence per 100,000 People",
          data: [30, 45, 55, 65, 75],
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          fill: true
        }]
      }
    });
  }

  if (heatTrendChart.value) {
    if (chartHeatInstance.value) chartHeatInstance.value.destroy();
    chartHeatInstance.value = new Chart(heatTrendChart.value.getContext('2d'), {
      type: 'line',
      data: {
        labels: ["2018", "2019", "2020", "2021", "2022", "2023"],
        datasets: [
          {
            label: "Average Temperature in Australia (°C)",
            data: [22.49, 22.78, 22.56, 22.05, 21.96, 22.36],
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            yAxisID: 'y-axis-temp',
            fill: true
          },
          {
            label: "Median UV Index",
            data: [1.41, 1.56, 1.49, 1.45, 1.39, 1.48], 
            borderColor: '#0080FF',
            backgroundColor: 'rgba(0, 128, 255, 0.2)',
            yAxisID: 'y-axis-uv',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          'y-axis-temp': {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Temperature (°C)'
            }
          },
          'y-axis-uv': {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Median UV Index'
            }
          }
        }
      }
    });
  }

};
// Skin Tone Colors
const skinToneColors = ref(["#FAF0E6", "#F4C7A1", "#C08A60", "#8B5A2B", "#5D3A00"]);
// 计算防晒建议
const clothingRecommendation = computed(() => {
  if (uvIndex.value === null) return "No data available";
  return uvIndex.value >= 7 ? "Wear long sleeves, pants, and a hat" : "Use light, breathable clothing";
});

const sunProtectionRecommendation = computed(() => {
  if (uvIndex.value === null) return "No data available";

  if (skinTone.value < 1.5) return uvIndex.value >= 6 ? "Use SPF 50+" : "Use SPF 30+";
  if (skinTone.value >= 1.5 && skinTone.value <= 2.5) return uvIndex.value >= 6 ? "Use SPF 30+" : "Use SPF 15+";
  return uvIndex.value >= 6 ? "Use SPF 15+" : "Minimal sunscreen needed";
});
const isDragging = ref(false);

const startDragging = (event) => {
  isDragging.value = true;
  updateSkinTone(event);
};

const dragging = (event) => {
  if (isDragging.value) {
    updateSkinTone(event);
  }
};

const stopDragging = () => {
  isDragging.value = false;
};

const updateSkinTone = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const percentage = offsetX / rect.width;
  skinTone.value = 1 + percentage * 2; // 1 ~ 3 范围
};


const sunExposureRecommendation = computed(() => {
  if (uvIndex.value === null) return "No data available";
  return uvIndex.value >= 8 ? "Best to stay indoors during midday" : "Safe to go outside in the morning or late afternoon";
});

onMounted(renderCharts);
</script>

<style scoped>
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

</style>
