<template>
  <div class="home-container">
    <!-- 头部欢迎标语 -->
    <div class="hero">
      <div class="hero-overlay">
        <h1>Understanding the UV Index: Protect Your Skin</h1>
        <p>Ultraviolet rays can damage the skin—learn how to protect yourself effectively from the sun.</p>
      </div>
    </div>

    <!-- UV 科普内容 -->
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

    <!-- SunSmart 5 步防晒指南 -->
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

    <!-- 防晒霜补涂提醒设置 -->
    <div class="reminder-section">
      <h2>Sunscreen Reapplication Reminder Setting</h2>
      <!-- SPF 下拉选择：常见 SPF 值 15、30、50 -->
      <div class="reminder-row">
        <label>Select Sunscreen SPF Value:</label>
        <select v-model.number="spf">
          <option :value="15">SPF 15</option>
          <option :value="30">SPF 30</option>
          <option :value="50">SPF 50</option>
        </select>
      </div>

      <!-- 活动类型 -->
      <div class="reminder-row">
        <label>Select Activity Type:</label>
        <select v-model="activity">
          <option value="normal">General Outdoor Activities</option>
          <option value="swimming">Swimming</option>
          <option value="exercise">Sports</option>
          <option value="high_uv">High UV Environment</option>
        </select>
      </div>

      <!-- UV 指数 -->
      <div class="reminder-row">
        <label>Current UV Index:</label>
        <input type="number" v-model.number="uvIndex" min="0" max="20" />
      </div>

      <!-- 计算按钮 -->
      <div class="reminder-row">
        <button @click="showReapplyTime">Calculate Reapplication Time</button>
      </div>
      <!-- 显示计算结果 -->
      <div v-if="message" class="message">
        {{ message }}
      </div>

      <!-- 自定义提醒时间 (分钟) -->
      <div class="reminder-row">
        <label>Custom Reminder Time (minutes):</label>
        <input type="number" v-model.number="customReminder" min="1" />
        <button @click="setCustomReminder">Set Reminder</button>
      </div>
      <!-- 显示已设置的提醒 -->
      <div v-if="reminderSet" class="reminder-message">
        Reminder Set! You will receive a notification to reapply sunscreen in {{ reminderTime }} minutes.
      </div>
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
  data() {
    return {
      spf: 30,             // 默认 SPF 值
      activity: "normal",  // 默认活动类型
      uvIndex: 6,          // 默认 UV 指数
      message: "",         // 计算结果
      customReminder: 0,   // 用户自定义提醒时间(分钟)
      reminderSet: false,  // 是否已设置提醒
      reminderTime: 0,     // 提醒时间(分钟)
      reminderTimer: null, // 存储 setTimeout 句柄
    };
  },
  methods: {
    // 计算补涂时间(小时)
    calculateReapplyTime() {
      // SPF x 10 (分钟) 作为基础
      let baseTime = this.spf * 10; // 单位：分钟

      // 如果活动为游泳或运动，则时间减半
      if (this.activity === "swimming" || this.activity === "exercise") {
        baseTime /= 2;
      }

      // 如果 UV 指数 >= 8，则减少 25%
      if (this.uvIndex >= 8) {
        baseTime *= 0.75;
      }

      // 转换为小时，并四舍五入
      let hours = Math.round(baseTime / 60);
      return hours;
    },

    // 显示补涂时间
    showReapplyTime() {
      let hours = this.calculateReapplyTime();
      this.message = `It is recommended to reapply sunscreen in ${hours} hours.`;
    },

    // 设置自定义提醒(分钟) 使用 alert 弹窗提醒
    setCustomReminder() {
      // 如果存在旧的定时器，先清除
      if (this.reminderTimer) {
        clearTimeout(this.reminderTimer);
      }

      if (this.customReminder > 0) {
        this.reminderTime = this.customReminder;
        this.reminderSet = true;

        // 使用 setTimeout 在指定时间后调用 alert 弹窗提醒
        this.reminderTimer = setTimeout(() => {
          alert(`Reminder: Your set time of ${this.reminderTime} minutes is up. Please remember to reapply sunscreen.。`);
          // 提醒后重置提醒状态
          this.reminderSet = false;
        }, this.reminderTime * 60 * 1000);
      } else {
        this.reminderSet = false;
        alert("Please enter a valid reminder time (minutes)!");
      }
    },
  },
  beforeDestroy() {
    // 若组件被卸载，清除定时器
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
    }
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
  height: 400px;
  background-image: url('/pic4.jpg'); 
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 10px;
}

.hero-overlay {
  text-align: center;
}

.hero-overlay h1 {
  font-size: 72px;
  font-weight: bold;
  margin-bottom: 15px;
  color: white;
}

.hero-overlay p {
  font-size: 32px;
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

/* 防晒指南 */
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

/* 防晒霜提醒设置 */
.reminder-section {
  margin-top: 30px;
  text-align: left;
  padding: 20px;
  background-color: #eef;
  border-radius: 10px;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.1);
}

/* 每一行的布局 */
.reminder-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

/* 让 label 和输入框/下拉框分开一些 */
.reminder-row label {
  width: 220px;
  font-weight: bold;
  margin-right: 10px;
}

/* 输入框和下拉框的样式 */
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

/* 获得焦点时的高亮 */
.reminder-section select:focus,
.reminder-section input[type="number"]:focus {
  outline: none;
  border-color: #d18463;
  box-shadow: 0 0 5px rgba(209, 132, 99, 0.5);
}

/* 让按钮更生动 */
.reminder-section button {
  background-color: #d18463;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px; /* 使多个按钮间有间隔 */
  transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.reminder-section button:hover {
  background-color: #b36a49;
  transform: scale(1.05);
}

.reminder-section button:active {
  transform: scale(0.95);
  box-shadow: none;
}

.message {
  font-size: 18px;
  margin-top: 10px;
  color: #333;
}

.reminder-message {
  font-size: 16px;
  color: #d18463;
  margin-top: 10px;
}
</style>