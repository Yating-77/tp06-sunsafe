const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1️⃣ **先初始化数据库连接**
const db = mysql.createPool({
  host: 'tp06-onboarding-database.c9gms0e0w8ty.ap-southeast-2.rds.amazonaws.com',
  user: 'onboarding',
  password: 'Yating77123456',
  database: 'canceruv',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 2️⃣ **测试数据库连接**
db.getConnection()
  .then(connection => {
    console.log('✅ Successfully connected to MySQL RDS.');
    connection.release(); // 释放连接
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error);
  });
function getUVCategory(uvIndex) {
  if (uvIndex >= 0 && uvIndex <= 2) return 'Low (0-2)';
  if (uvIndex > 2 && uvIndex <= 7) return 'Medium (3-7)';
  if (uvIndex > 7) return 'High (8+)';
  return null;
}

// 3️⃣ **API 路由**
app.get('/skincancerdata', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT year, incidence_rate, mortality_rate FROM cancerstatistics');
        res.json(rows);
    } catch (error) {
        console.error("❌ 皮肤癌数据查询失败:", error);
        res.status(500).json({ error: "Failed to fetch skin cancer data", details: error.message });
    }
});


app.get('/uvhistory', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT year, median_uvi FROM yearlyuvindex');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch UV history data" });
  }
});

app.get('/api/recommendation', async (req, res) => {
  let { uvIndex, skinTone } = req.query;
  uvIndex = parseFloat(uvIndex); // ✅ 确保 uvIndex 是数值

  // ✅ 统一 skinTone 格式
  skinTone = skinTone.charAt(0).toUpperCase() + skinTone.slice(1).toLowerCase();

  // ✅ 获取 UV Index 对应的分类
  const uvCategory = getUVCategory(uvIndex);
  if (!uvCategory) {
    return res.status(400).json({ message: "Invalid UV Index" });
  }

  console.log(`Received request with uvIndex=${uvIndex} (Category: ${uvCategory}), skinTone=${skinTone}`);

  try {
    // ✅ 用字符串精确匹配 uv_index
    const [rows] = await db.query(`
      SELECT clothing_recommendation, hat_recommendation, sunglasses_recommendation 
      FROM uvprotectionguide 
      WHERE skin_tone = ? 
        AND uv_index = ? 
      LIMIT 1;
    `, [skinTone, uvCategory]);

    if (rows.length > 0) {
      res.json(rows[0]); // ✅ 只返回一条数据
    } else {
      res.status(404).json({ message: "No recommendation found for given UV Index and Skin Tone." });
    }
  } catch (error) {
    console.error("❌ Failed to fetch recommendation:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});


// 4️⃣ **启动服务器**
app.listen(3000, '0.0.0.0',() => {
  console.log('🚀 Server running on http://54.252.182.12:3000');
});
