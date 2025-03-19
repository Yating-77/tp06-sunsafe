<template>
  <div class="page">
    <!-- container 1-->
    <div class="container container-1">
  <div class="content">
    <h1 class="uv-title">Understanding the UV Index: Protect Your Skin</h1>
    <p class="uv-subtitle">
      Ultraviolet rays can damage the skin—learn how to protect yourself effectively from the sun.
    </p>
  </div>
</div>
    <!--container 2-->
    <div class="container container-2">
      <h2 class="main-title">UV Radiation & Protection Guide</h2>

      <div class="info-container">
        <div class="info-box info-box-1">
          <img src="/uvradiation_icon.png" alt="UV Radiation Icon" class="info-icon">
          <h3>What is UV radiation?</h3>
          <p>UV is a form of energy produced by the sun:</p>
          <ul>
            <li><span class="highlight-text">Visible light</span> – we see as sunlight.</li>
            <li><span class="highlight-text">Infrared radiation</span> – we feel as heat.</li>
            <li><span class="highlight-text">UV radiation</span> – we cannot see or feel.</li>
          </ul>
        </div>
        
        <div class="info-box info-box-2">
          <img src="/uvindex_icon.png" alt="UV Index Icon" class="info-icon">
          <h3>What is the UV Index?</h3>
          <p>The UV Index helps measure UV exposure risk:</p>
          <ul>
            <li><span class="highlight-text">Low (1-2)</span> - Safe exposure</li>
            <li><span class="highlight-text">Moderate (3-5)</span> - Caution needed</li>
            <li><span class="highlight-text">High (6-7)</span> - Protection advised</li>
            <li><span class="highlight-text">Very High (8-10)</span> - Dangerous levels</li>
            <li><span class="highlight-text">Extreme (11+)</span> - Maximum risk</li>
          </ul>
        </div>

        <div class="info-box info-box-3">
          <img src="/tips_icon.png" alt="Sun Protection Icon" class="info-icon">
          <h3>SunSmart Protection Tips</h3>
          <ol>
            <li>Slip on protective clothing.</li>
            <li>Slop on SPF 50+ sunscreen.</li>
            <li>Slap on a broad-brimmed hat.</li>
            <li>Seek shade from 10 am to 4 pm.</li>
            <li>Slide on UV-protection sunglasses.</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- container 3-->
    <div class="container container-3">
  <h2 class="main-title">Did you know?</h2>
  
  <div class="charts-wrapper">
    <div class="chart-box">
      <h4 class="chart-title">Heat Trend in Australia</h4>
      <canvas ref="heatTrendChart"></canvas>
      <ul class="chart-info">
        <li>From 2018 to 2023, Australia's average temperature fluctuated.</li>
        <li>Despite temperature changes, UV exposure risks remain stable.</li>
        <li>
          Source: 
          <a href="https://data.gov.au/" 
            target="_blank" 
            rel="noopener noreferrer">
            data.gov.au
          </a>
        </li>
      </ul>
    </div>

    <div class="chart-box">
      <h4 class="chart-title">Skin Cancer Data</h4>
      <canvas ref="skinCancerChart"></canvas>
      <ul class="chart-info">
        <li>Incidence rate of skin cancer is rising over the years.</li>
        <li>Mortality rate has also shown an increasing trend.</li>
        <li>
          Sources: 
          <a href="https://www.cancer.org.au/" target="_blank" rel="noopener noreferrer">Cancer Council Australia</a>, 
          <a href="https://www.aihw.gov.au/" target="_blank" rel="noopener noreferrer">AIHW</a>, 
          <a href="https://melanoma.org.au/" target="_blank" rel="noopener noreferrer">Melanoma Institute Australia</a>
        </li>
      </ul>
    </div>
  </div>
</div>


    <!-- container 4-->
    <div class="container container-4">
      <div class="content">
        <h2 class="title">Start to check UV today</h2>
        <button class="check-btn" @click="goToInform">Check Now</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import Chart from "chart.js/auto";
import { useRouter } from "vue-router";

const router = useRouter();

const AWS_API_URL = "https://sunsafe.mooo.com"; 

const heatTrendChart = ref(null);
const skinCancerChart = ref(null);
const chartInstanceHeatTrend = ref(null);
const chartInstanceSkinCancer = ref(null);

const heatTrendData = ref([]);
const skinCancerData = ref([]);

const fetchHeatTrendData = async () => {
  try {
    const response = await fetch(`${AWS_API_URL}/uvhistory`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    heatTrendData.value = data;
  } catch (error) {
    console.error("Error fetching UV history:", error);
  }
};

const fetchSkinCancerData = async () => {
  try {
    const response = await fetch(`${AWS_API_URL}/skincancerdata`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    skinCancerData.value = data;
  } catch (error) {
    console.error("Error fetching skin cancer data:", error);
  }
};

const goToInform = () => {
  router.push('/inform');
};

onMounted(async () => {
  await fetchHeatTrendData();
  await fetchSkinCancerData();
  await nextTick();
  renderCharts();
});

const renderCharts = () => {
  if (!heatTrendChart.value || !skinCancerChart.value) {
    console.warn("❌ canvas 元素未找到！");
    return;
  }

  if (chartInstanceHeatTrend.value) chartInstanceHeatTrend.value.destroy();
  if (chartInstanceSkinCancer.value) chartInstanceSkinCancer.value.destroy();

  chartInstanceHeatTrend.value = new Chart(heatTrendChart.value.getContext("2d"), {
    type: "line",
    data: {
      labels: heatTrendData.value.map((item) => item.year),
      datasets: [
        {
          label: "Median UV Index",
          data: heatTrendData.value.map((item) => item.median_uvi),
          borderColor: "#FFA500",
          backgroundColor: "rgba(255, 165, 0, 0.2)",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Year",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "UV Index",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
      },
    },
  });

  chartInstanceSkinCancer.value = new Chart(skinCancerChart.value.getContext("2d"), {
    type: "line",
    data: {
      labels: skinCancerData.value.map((item) => item.year),
      datasets: [
        {
          label: "Incidence Rate",
          data: skinCancerData.value.map((item) => item.incidence_rate),
          borderColor: "#FF5733",
          backgroundColor: "rgba(255, 87, 51, 0.2)",
          fill: true,
        },
        {
          label: "Mortality Rate",
          data: skinCancerData.value.map((item) => item.mortality_rate),
          borderColor: "#1E90FF",
          backgroundColor: "rgba(30, 144, 255, 0.2)",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Year",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Rate (per 100,000 population)",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
      },
    },
  });
};

</script>

<style scoped>
.highlight-text {
  color: darkorange;
  font-weight: bold;
}
.info-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.charts-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.chart-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 45%;
  min-width: 350px;
  text-align: center;
  max-width: 500px;
}

canvas {
  max-width: 100%;
  max-height: 400px;
}

.chart-info {
  text-align: left;
  margin-top: 10px;
  padding-left: 20px;
  color: black !important;
}

.chart-info li {
  font-size: 14px;
  margin-bottom: 5px;
}

.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-y: auto;
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: white;
  font-weight: bold;
  width: 100%;
}

.container-1 {
  background-image: url("/pic4.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 80vh;
}


.uv-title {
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-align: center;
  max-width: 80%;
  margin-bottom: 10px;
}

.uv-subtitle {
  font-size: 24px;
  color: white;
  text-align: center;
  max-width: 70%;
  font-weight: 300;
}

.container-2 {
  background-color: #fdf3e6;
  height: auto;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  height: 60vh;
}

.main-title {
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  width: 100%;
  margin-bottom: 15px;
  color: #FFA500;
}

.info-container {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
  max-width: 1200px;
  padding: 10px;
}

.info-box {
  flex: 1;
  min-height: auto;
  max-height: none;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  color: black;
  margin: 0 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  word-wrap: break-word;
}

.info-box h3 {
  font-size: 18px;
  text-align: center;
  width: 100%;
  margin-bottom: 10px;
  font-weight: bold;
}

.info-box ul, .info-box ol {
  margin-left: 5px;
}

.info-box ul li, .info-box ol li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.container-3 {
  background-color: white;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: black
}

.charts-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
  width: 100%;
  max-width: 1200px;
  margin-top: 20px;
}

.chart-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 45%;
  min-width: 350px;
  text-align: center;
  min-height: 450px;
}

@media (max-width: 768px) {
  .charts-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .chart-box {
    width: 100%;
    max-width: 500px;
  }
}

.container-4 {
  background-image: url("/pic3.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 60vh;
}


.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}


.title {
  font-size: 22px;
  font-weight: bold;
  color: white;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 10px 20px;
  border-radius: 20px;
}


.input-box {
  width: 300px;
  height: 40px;
  padding: 10px;
  border: 2px solid white;
  border-radius: 10px;
  font-size: 16px;
  text-align: center;
  outline: none;
}

@media (max-width: 1024px) {
  .info-container {
    flex-direction: column;
    align-items: center;
  }

  .info-box {
    width: 90%;
    margin-bottom: 20px;
  }
}

.info-box-2 p {
  display: inline;
  margin-right: 5px;
  white-space: nowrap;
}

.info-box-2 ul {
  display: inline-block;
  vertical-align: top;
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: center;
  width: 100%;
}
.container-4 {
  background-image: url("/pic3.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-align: center;
  background: none;
  padding: 10px 20px;
  border-radius: 20px;
}

.check-btn {
  background-color: white;
  color: orange;
  font-size: 22px;
  font-weight: bold;
  padding: 14px 28px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: 0.3s;
  margin-top: 20px;
}

.check-btn:hover {
  background-color: orange;
  color: white;
}
</style>
