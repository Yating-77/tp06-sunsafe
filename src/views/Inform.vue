<template>
  <div class="container text-center">
    <div class="uv-container">
    <div class="uv-background"></div>

    <div class="uv-content text-center">
      <h1 class="mt-1">Check the Ultraviolet (UV) Index</h1>
      <p class="mt-5">
        Get real-time UV index data based on the <span class="highlight-text">entered suburb name in Australia</span>, along with sun protection recommendations to keep your skin safe.
      </p>

    <!-- Search Bar with Autocomplete -->
    <div class="search-container">
      <input 
        v-model="suburb" 
        @input="fetchSuggestions"
        @keydown.enter="fetchUVIndex"
        class="form-control search-input" 
        placeholder="Enter suburb name"
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
      <button @click="fetchUVIndex" class="btn search-button">Search</button>
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
  </div>
</div>
    <!-- Loading Indicator -->
    <div v-if="loading" class="alert alert-info">Loading...</div>

<div v-if="uvIndex !== null">
  <h2 class="mt-5">Generate Personalised Recommendation</h2>

  <div class="skin-tone-container mt-4">
    <label>Select your skin tone:</label>
    <div class="skin-tone-scale-container">
      <input type="range" min="1" max="3" step="0.01" v-model="skinTone" class="skin-tone-slider">
      <div class="skin-tone-labels">
        <span>Light</span>
        <span>Medium</span>
        <span>Dark</span>
      </div>
    </div>
  </div>

  <button @click="generateRecommendation" class="btn orange-button">Get Recommendation</button>

  <div v-if="recommendationError" class="alert alert-danger mt-3">{{ recommendationError }}</div>
  <p v-if="recommendationMessage" class="alert alert-info">{{ recommendationMessage }}</p>

  <div v-if="showRecommendations" class="mt-4">
  <h2 class="recommendation-title">Personalised Sun Protection Advice</h2>
  <div class="recommendation-cards">
    
    <!--  Clothing Recommendation -->
    <div class="card">
      <h3>Clothing</h3>
      <img v-if="clothingImage" :src="clothingImage" alt="Clothing Recommendation" class="recommendation-image">
      <p class="recommendation-text">{{ clothingRecommendation }}</p>
    </div>

    <!-- Hat Recommendation -->
    <div class="card">
      <h3>Hat</h3>
      <img v-if="hatImage" :src="hatImage" alt="Hat Recommendation" class="recommendation-image">
      <p class="recommendation-text">{{ hatRecommendation }}</p>
    </div>

    <!--  Sunglasses Recommendation -->
    <div class="card">
      <h3>Sunglasses</h3>
      <img v-if="sunglassesImage" :src="sunglassesImage" alt="Sunglasses Recommendation" class="recommendation-image">
      <p class="recommendation-text">{{ sunglassesRecommendation }}</p>
    </div>
  </div>
</div>

  <div v-if="showRecommendations" class="reminder-section">

  <div class="reminder-section">
      <h2>Sunscreen Reapplication Reminder Setting</h2>

      <div class="reminder-row">
        <label>Select Sunscreen SPF Value:</label>
        <select v-model.number="spf">
          <option :value="15">SPF 15</option>
          <option :value="30">SPF 30</option>
          <option :value="50">SPF 50</option>
        </select>
      </div>


      <div class="reminder-row">
        <label>Select Activity Type:</label>
        <select v-model="activity">
          <option value="normal">General Outdoor Activities</option>
          <option value="swimming">Swimming</option>
          <option value="exercise">Sports</option>
          <option value="high_uv">High UV Environment</option>
        </select>
      </div>


      <div class="reminder-row">
        <label>Current UV Index:</label>
        <input type="number" :value="reminderUVIndex" min="0" max="20" readonly />

      </div>


      <div class="reminder-row">
        <button @click="showReapplyTime" class="btn orange-button">Calculate Reapplication Time</button>
      </div>

      <div v-if="message" class="message">
        {{ message }}
      </div>


      <div class="reminder-row">
        <label>Custom Reminder Time (minutes):</label>
        <input type="number" v-model.number="customReminder" min="1" />
        <button @click="setCustomReminder" class="btn orange-button">Set Reminder</button>
      </div>

      <div v-if="reminderSet" class="reminder-message">
        Reminder Set! You will receive a notification to reapply sunscreen in {{ reminderTime }} minutes.
      </div>
    </div>
  </div>
</div>

  </div>
    
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
const suburb = ref('');
const uvIndex = ref(null);
const latitude = ref(null);
const longitude = ref(null);
const locationName = ref('');
const loading = ref(false);
const errorMessage = ref('');
const skinTone = ref(2);
const suggestions = ref([]);
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaXJpczAwNzc5OSIsImEiOiJjbTFyZmhqMXYwYTRxMmtxMjFzYTlmYWN2In0.lVDdt8jKxfx9nJqXHgQU6w';
const WEATHER_API_KEY = '4300747fbdce7480245f3c9e02b943df';
const recommendationError = ref('');
const showRecommendations = ref(false);
const recommendationMessage = ref("");
const reminderUVIndex = ref(null);

const validateInput = () => {
  const regex = /^[a-zA-Z\s]+$/; 
  if (!regex.test(suburb.value)) {
    errorMessage.value = 'Invalid suburb name. Please enter a valid name.';
    return false;
  }
  errorMessage.value = '';
  return true;
};

const fetchSuggestions = async () => {
  if (suburb.value.length < 3) {
    suggestions.value = [];
    return;
  }

  if (!validateInput()) return;

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

const selectSuburb = (selected) => {
  suburb.value = selected;
  suggestions.value = [];
};

const fetchUVIndex = async () => {
  if (!suburb.value.trim()) {
    errorMessage.value = 'Please enter a valid suburb.';
    return;
  }

  try {
    const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(suburb.value)}.json?country=AU&access_token=${MAPBOX_ACCESS_TOKEN}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.features || geoData.features.length === 0) {
      throw new Error('Suburb not found. Please enter a valid suburb.');
    }

    const feature = geoData.features[0];
    latitude.value = feature.center[1];
    longitude.value = feature.center[0];

    const placeData = feature.context;
    const suburbName = placeData.find(d => d.id.includes("locality"))?.text || 
                       placeData.find(d => d.id.includes("neighborhood"))?.text || 
                       feature.text || '';

    const state = placeData.find(d => d.id.includes("region"))?.text || '';
    const postcode = placeData.find(d => d.id.includes("postcode"))?.text || '';

    locationName.value = `${suburbName}${state ? ', ' + state : ''}${postcode ? ', ' + postcode : ''}, Australia`;

    if (!latitude.value || !longitude.value) {
      throw new Error("Failed to get coordinates. Please enter a valid suburb.");
    }

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


const generateRecommendation = () => {
  if (uvIndex.value === null) {
    recommendationError.value = "Please check the UV Index first!";
    return;
  }

  recommendationMessage.value = `Current UV Index is ${uvIndex.value}.`;
  
  reminderUVIndex.value = uvIndex.value; 
  console.log("Updated Reminder UV Index:", reminderUVIndex.value);

  showRecommendations.value = true;
  recommendationError.value = "";
};


const clothingRecommendation = computed(() => {
  if (uvIndex.value < 3) return "Short-sleeve, light-colored loose-fit cotton or linen";
  if (uvIndex.value < 7) return "Long-sleeve, light-colored breathable shirt & light pants/shorts";
  return "Long-sleeve, UPF-rated clothing";
});


const clothingImage = computed(() => {
  if (clothingRecommendation.value === "Short-sleeve, light-colored loose-fit cotton or linen") {
    return "/short-sleeve.png";
  } else if (clothingRecommendation.value === "Long-sleeve, light-colored breathable shirt & light pants/shorts") {
    return "/long-sleeve-light.png";
  } else {
    return "/upf-clothing.png";
  }
});


const hatRecommendation = computed(() => {
  if (uvIndex.value < 3) return "Visor";
  if (uvIndex.value < 7) return "Baseball Cap";
  return "Wide Brimmed Hat";
});


const hatImage = computed(() => {
  if (hatRecommendation.value === "Visor") {
    return "/visor.png";
  } else if (hatRecommendation.value === "Baseball Cap") {
    return "/baseball-cap.png";
  } else {
    return "/wide-brim-hat.png";
  }
});


const sunglassesRecommendation = computed(() => {
  if (uvIndex.value < 3) return "No Sunglasses Needed";
  return "Polarized sunglasses";
});


const sunglassesImage = computed(() => {
  if (sunglassesRecommendation.value === "Polarized sunglasses") {
    return "/polarized-sunglasses.png";
  } else {
    return ""; // No image for "No Sunglasses Needed"
  }
});

const spf = ref(30);  
const activity = ref("normal"); 
const message = ref("");
const customReminder = ref(0);
const reminderSet = ref(false);
const reminderTime = ref(0); 
const reminderTimer = ref(null); 

const calculateReapplyTime = () => {
  let baseTime = spf.value * 10; 

  if (activity.value === "swimming" || activity.value === "exercise") {
    baseTime /= 2; 
  }
  if (uvIndex.value >= 8) {
    baseTime *= 0.75;
  }

  return Math.round(baseTime / 60);
};

const showReapplyTime = () => {
  let hours = calculateReapplyTime();
  message.value = `It is recommended to reapply sunscreen in ${hours} hours.`;
};

const setCustomReminder = () => {
  if (reminderTimer.value) {
    clearTimeout(reminderTimer.value);
  }

  if (customReminder.value > 0) {
    reminderTime.value = customReminder.value;
    reminderSet.value = true;

    reminderTimer.value = setTimeout(() => {
      alert(`Reminder: Your set time of ${reminderTime.value} minutes is up. Please remember to reapply sunscreen.`);
      reminderSet.value = false;
    }, reminderTime.value * 60 * 1000);
  } else {
    reminderSet.value = false;
    alert("Please enter a valid reminder time (minutes)!");
  }
};

onUnmounted(() => {
  if (reminderTimer.value) {
    clearTimeout(reminderTimer.value);
  }
});
</script>


<style scoped>
.highlight-text {
  color: orange;
  font-weight: bold;
}

.orange-button {
  background: orange;  
  color: white; 
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  margin-bottom: 30px;
}

.orange-button:hover {
  background: darkorange;
  transform: scale(1.05); 
}

.orange-button:active {
  transform: scale(0.95);
  background: #ff9800;
}

.uv-content {
  position: relative;
  margin-top: 80px;
  z-index: 10;
  text-align: center;
  padding: 40px 30px 30px;
  max-width: 600px;
}

.uv-container {
  position: relative;
  width: 100%;
  min-height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: visible;
  padding-bottom: 20px;
}

.uv-background {
  position: absolute;
  width: 100%;
  height: auto;
  min-height: 100%;
  background-color: #fdf3e6;
  border-radius: 20px;
  z-index: -1;
}

.autocomplete-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ddd;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10000;
  border-radius: 5px;
  max-height: 300px;
  overflow-y: auto;
}

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
  background: orange;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}


.search-button:hover {
  background: darkorange;
  transform: scale(1.05); 
}


.search-button:active {
  transform: scale(0.95);
  background: #ff9800;
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

.alert-success {
  margin-top: 10px;
}
.skin-tone-container {
  margin-bottom: 20px;
}

.skin-tone-scale-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  max-width: 700px;
  margin: auto;
}
.alert-info {
  margin-top: 20px;
}


.skin-tone-labels {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin: 5px auto 0;
    font-weight: bold;
}
.recommendation-cards {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: auto;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  width: 330px;
  min-height: 420px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.recommendation-image {
  width: 140px;
  height: auto;
  margin-bottom: 15px;
}

.recommendation-text {
  font-size: 20px;
  font-weight: 500;
  margin-top: 15px;
  text-align: center;
  line-height: 1.6;
}


@media (max-width: 1024px) {
  .recommendation-cards {
    max-width: 90%;
  }
  
  .card {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .recommendation-cards {
    flex-direction: column;
    align-items: center;
  }

  .card {
    width: 90%;
    min-height: auto;
  }
}


.skin-tone-slider {
  width: 100%;
  appearance: none;
  height: 50px;
  background: linear-gradient(to right, #FAF0E6, #F4C7A1, #8B5A2B);
  border-radius: 5px;
  outline: none;
}



.card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  width: 180px;
}


.skin-tone-slider::-webkit-slider-thumb {
  appearance: none;
  width: 50px;
  height: 50px;
  background: orange;
  border-radius: 50%;
  margin-top: 0px;
}

.reminder-section {
  margin-top: 20px;
  text-align: left;
  padding: 20px;
  background-color: #fdf3e6;
  border-radius: 10px;
}

.reminder-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}


.reminder-row label {
  width: 220px;
  font-weight: bold;
  margin-right: 10px;
}

.reminder-section select,
.reminder-section input[type="number"] {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 8px 12px;
  font-size: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  margin-right: 10px;
}
.message {
  font-size: 18px;
  margin-top: 10px;
  color: #333;
}
</style>
