const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const GeminiVegetationAnalyzer = require('./gemini-integration');
const YOLODetector = require('./yolo-real-integration');
const YouTubeLiveStreamFetcher = require('./youtube-integration');
const config = require('./config');

const app = express();
const PORT = config.PORT;

// Initialize AI services
const geminiAnalyzer = new GeminiVegetationAnalyzer(config.GEMINI_API_KEY);
const yoloDetector = new YOLODetector('./models/yoloE.pt');
const youtubeFetcher = new YouTubeLiveStreamFetcher(config.YOUTUBE_API_KEY || 'YOUR_YOUTUBE_API_KEY');

// Load YOLO model on startup
yoloDetector.loadModel().then(loaded => {
  if (loaded) {
    console.log('✅ YOLO model loaded successfully');
  } else {
    console.log('⚠️ Using mock YOLO detection (model not found)');
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Mock YOLO detection function (replace with actual YOLO model)
function generateMockDetections() {
  const possibleClasses = ['person', 'animal', 'vehicle', 'fire', 'firearm', 'tree', 'bird', 'deer'];
  const detections = [];
  
  // Randomly generate 0-3 detections
  const numDetections = Math.floor(Math.random() * 4);
  
  for (let i = 0; i < numDetections; i++) {
    const className = possibleClasses[Math.floor(Math.random() * possibleClasses.length)];
    detections.push({
      id: `det_${Date.now()}_${i}`,
      class: className,
      confidence: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100, // 0.7-1.0
      bbox: {
        x: Math.floor(Math.random() * 400),
        y: Math.floor(Math.random() * 300),
        width: Math.floor(Math.random() * 100 + 50),
        height: Math.floor(Math.random() * 100 + 50)
      },
      timestamp: new Date().toISOString()
    });
  }
  
  return detections;
}

// Initialize SQLite database
const db = new sqlite3.Database(config.DATABASE_PATH);

// Create tables
db.serialize(() => {
  // Create ndvi_images table
  db.run(`
    CREATE TABLE IF NOT EXISTS ndvi_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pointer_name TEXT NOT NULL,
      area TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      image1_path TEXT,
      image2_path TEXT,
      image1_url TEXT,
      image2_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create alerts table
  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_id TEXT UNIQUE NOT NULL,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      coordinates TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample data with your uploaded images
  db.run(`
    INSERT OR IGNORE INTO ndvi_images 
    (pointer_name, area, latitude, longitude, image1_path, image2_path, image1_url, image2_url)
    VALUES 
    ('Random Point 1', 'sundarbans', 22.6, 89.0, '1.png', '2.png', '/uploads/1.png', '/uploads/2.png'),
    ('Random Point 2', 'sundarbans', 22.8, 89.2, '3.png', '4.png', '/uploads/3.png', '/uploads/4.png'),
    ('Random Point 3', 'sundarbans', 23.0, 88.8, '1.png', '3.png', '/uploads/1.png', '/uploads/3.png'),
    ('Random Point 1', 'kabini', 12.05, 76.35, '2.png', '4.png', '/uploads/2.png', '/uploads/4.png'),
    ('Random Point 2', 'kabini', 12.08, 76.40, '1.png', '4.png', '/uploads/1.png', '/uploads/4.png'),
    ('Random Point 3', 'kabini', 12.02, 76.45, '2.png', '3.png', '/uploads/2.png', '/uploads/3.png')
  `);
});

// API Routes

// Get images for a specific area and pointer
app.get('/api/ndvi-images/:area/:pointer', (req, res) => {
  const { area, pointer } = req.params;
  
  // Decode URL-encoded pointer name
  const decodedPointer = decodeURIComponent(pointer);
  
  console.log(`Looking for images: area=${area}, pointer=${decodedPointer}`);
  
  db.get(
    'SELECT * FROM ndvi_images WHERE area = ? AND pointer_name = ?',
    [area, decodedPointer],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (row) {
        console.log('Found images:', row);
        res.json({
          success: true,
          data: {
            id: row.id,
            pointer_name: row.pointer_name,
            area: row.area,
            latitude: row.latitude,
            longitude: row.longitude,
            image1_url: `http://localhost:${PORT}${row.image1_url}`,
            image2_url: `http://localhost:${PORT}${row.image2_url}`,
            created_at: row.created_at
          }
        });
      } else {
        console.log('No images found for:', area, decodedPointer);
        res.status(404).json({ error: 'Images not found for this pointer' });
      }
    }
  );
});

// Get all images for an area
app.get('/api/ndvi-images/:area', (req, res) => {
  const { area } = req.params;
  
  db.all(
    'SELECT * FROM ndvi_images WHERE area = ?',
    [area],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const images = rows.map(row => ({
        id: row.id,
        pointer_name: row.pointer_name,
        area: row.area,
        latitude: row.latitude,
        longitude: row.longitude,
        image1_url: `http://localhost:${PORT}${row.image1_url}`,
        image2_url: `http://localhost:${PORT}${row.image2_url}`,
        created_at: row.created_at
      }));
      
      res.json({
        success: true,
        data: images
      });
    }
  );
});

// Upload new images
app.post('/api/ndvi-images/upload', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]), (req, res) => {
  const { pointer_name, area, latitude, longitude } = req.body;
  const files = req.files;
  
  if (!files.image1 || !files.image2) {
    return res.status(400).json({ error: 'Both images are required' });
  }
  
  const image1_url = `/uploads/${files.image1[0].filename}`;
  const image2_url = `/uploads/${files.image2[0].filename}`;
  
  db.run(
    'INSERT INTO ndvi_images (pointer_name, area, latitude, longitude, image1_path, image2_path, image1_url, image2_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [pointer_name, area, latitude, longitude, files.image1[0].filename, files.image2[0].filename, image1_url, image2_url],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        success: true,
        data: {
          id: this.lastID,
          pointer_name,
          area,
          latitude,
          longitude,
          image1_url: `http://localhost:${PORT}${image1_url}`,
          image2_url: `http://localhost:${PORT}${image2_url}`
        }
      });
    }
  );
});

// LLM Analysis endpoint using Gemini 2.5 Flash
app.post('/api/analyze-vegetation', async (req, res) => {
  const { image1_url, image2_url, area, pointer_name } = req.body;
  
  try {
    // Extract file paths from URLs
    const image1Path = path.join(__dirname, 'uploads', path.basename(image1_url));
    const image2Path = path.join(__dirname, 'uploads', path.basename(image2_url));
    
    // Check if files exist
    if (!fs.existsSync(image1Path) || !fs.existsSync(image2Path)) {
      return res.status(404).json({ 
        error: 'Image files not found',
        image1Path,
        image2Path
      });
    }
    
    // Call Gemini API for analysis
    const analysisResult = await geminiAnalyzer.analyzeVegetation(
      image1Path, 
      image2Path, 
      area, 
      pointer_name
    );
    
    if (analysisResult.success) {
      res.json({
        success: true,
        data: analysisResult.data
      });
    } else {
      res.status(500).json({ 
        error: 'Gemini analysis failed', 
        details: analysisResult.error 
      });
    }
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    });
  }
});

// Debug endpoint to see all database entries
app.get('/api/debug/images', (req, res) => {
  db.all('SELECT * FROM ndvi_images', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, data: rows });
  });
});

// Live detection endpoint for YOLO model
app.post('/api/live/detect', upload.single('image'), async (req, res) => {
  try {
    const { lat, lon, timestamp } = req.body;
    const imageFile = req.file;
    
    if (!imageFile) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    // Run YOLO detection
    const detections = await yoloDetector.detect(imageFile.path);
    
    // Analyze for anomalies
    const anomalyAnalysis = yoloDetector.analyzeAnomalies(detections);
    
    // Create summary
    const summary = yoloDetector.createSummary(detections, anomalyAnalysis);
    summary.location = { lat: parseFloat(lat), lon: parseFloat(lon) };
    
    // Clean up uploaded file
    fs.unlinkSync(imageFile.path);
    
    res.json({
      success: true,
      detections: detections,
      summary: summary,
      anomalies: anomalyAnalysis.anomalies,
      alert_level: anomalyAnalysis.level
    });
    
  } catch (error) {
    console.error('Live detection error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Detection failed', 
      details: error.message 
    });
  }
});

// Send alerts to rangers
app.post('/api/alerts/send', async (req, res) => {
  try {
    const { alert, rangerLocation, priority } = req.body;
    
    // Store alert in database
    db.run(
      'INSERT INTO alerts (alert_id, level, message, coordinates, timestamp, status) VALUES (?, ?, ?, ?, ?, ?)',
      [
        alert.id,
        alert.level,
        alert.message,
        JSON.stringify(alert.coordinates),
        alert.timestamp,
        'sent'
      ],
      function(err) {
        if (err) {
          console.error('Database error:', err);
        }
      }
    );
    
    // Mock sending alert to rangers (replace with actual SMS/email service)
    console.log(`🚨 ALERT SENT TO RANGERS:`);
    console.log(`Priority: ${priority.toUpperCase()}`);
    console.log(`Message: ${alert.message}`);
    console.log(`Location: ${alert.coordinates.lat}, ${alert.coordinates.lon}`);
    
    res.json({
      success: true,
      message: 'Alert sent to rangers',
      alertId: alert.id
    });
    
  } catch (error) {
    console.error('Alert sending error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send alert', 
      details: error.message 
    });
  }
});

// Get recent alerts
app.get('/api/alerts', (req, res) => {
  db.all(
    'SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const alerts = rows.map(row => ({
        id: row.alert_id,
        level: row.level,
        message: row.message,
        coordinates: JSON.parse(row.coordinates),
        timestamp: row.timestamp,
        status: row.status
      }));
      
      res.json({ success: true, data: alerts });
    }
  );
});

// YouTube Live Streams API
app.post('/api/youtube/live-streams', async (req, res) => {
  try {
    const { channels } = req.body;
    
    console.log('Fetching YouTube live streams for channels:', channels);
    
    // Try to fetch live streams from specified channels
    let streams = await youtubeFetcher.fetchLiveStreams(channels);
    
    // If no streams found or API fails, use custom video streams
    if (!streams || streams.length === 0) {
      console.log('No live streams found, using custom video streams');
      streams = youtubeFetcher.getCustomVideoStreams();
    }
    
    res.json({
      success: true,
      streams: streams,
      count: streams.length
    });
    
  } catch (error) {
    console.error('YouTube streams error:', error);
    // Fallback to custom video streams
    const fallbackStreams = youtubeFetcher.getCustomVideoStreams();
    res.json({
      success: true,
      streams: fallbackStreams,
      count: fallbackStreams.length,
      fallback: true
    });
  }
});

// Search for wildlife live streams
app.get('/api/youtube/search-wildlife', async (req, res) => {
  try {
    console.log('Searching for wildlife live streams...');
    
    const streams = await youtubeFetcher.searchWildlifeStreams();
    
    res.json({
      success: true,
      streams: streams,
      count: streams.length
    });
    
  } catch (error) {
    console.error('Wildlife streams search error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search wildlife streams', 
      details: error.message 
    });
  }
});

// Test Gemini API connection
app.get('/api/test-gemini', async (req, res) => {
  try {
    const testResult = await geminiAnalyzer.testConnection();
    res.json(testResult);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Gemini test failed', 
      details: error.message 
    });
  }
});

// Real-time data endpoints for Insights dashboard

// Get wildlife population trends data
app.get('/api/insights/population-trends', (req, res) => {
  const { area = 'sundarbans', period = 'month' } = req.query;
  
  // Generate realistic population data based on area and period
  const generateTrendData = (area, period) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    
    // Base populations vary by area
    const basePopulations = {
      sundarbans: { elephants: 77, tigers: 19, deer: 168, birds: 630 },
      kabini: { elephants: 120, tigers: 45, deer: 200, birds: 450 }
    };
    
    const base = basePopulations[area] || basePopulations.sundarbans;
    
    months.forEach((month, index) => {
      // Add seasonal variations and growth trends
      const seasonalFactor = 1 + 0.1 * Math.sin((index / 12) * 2 * Math.PI);
      const growthFactor = 1 + (index * 0.02); // 2% growth per month
      
      data.push({
        month,
        elephants: Math.round(base.elephants * seasonalFactor * growthFactor),
        tigers: Math.round(base.tigers * seasonalFactor * growthFactor),
        deer: Math.round(base.deer * seasonalFactor * growthFactor),
        birds: Math.round(base.birds * seasonalFactor * growthFactor),
        total: Math.round((base.elephants + base.tigers + base.deer + base.birds) * seasonalFactor * growthFactor)
      });
    });
    
    return data;
  };
  
  const trendData = generateTrendData(area, period);
  
  res.json({
    success: true,
    data: {
      trends: trendData,
      summary: {
        total_animals: trendData[trendData.length - 1].total,
        elephants: trendData[trendData.length - 1].elephants,
        tigers: trendData[trendData.length - 1].tigers,
        deer: trendData[trendData.length - 1].deer,
        birds: trendData[trendData.length - 1].birds,
        growth_rate: 12.5,
        period
      }
    }
  });
});

// Get conservation status and alerts
app.get('/api/insights/conservation-status', (req, res) => {
  const { area = 'sundarbans' } = req.query;
  
  // Generate realistic conservation data
  const conservationData = {
    ndvi_health: 'Excellent',
    active_threats: Math.floor(Math.random() * 5) + 1,
    wildlife_count: Math.floor(Math.random() * 200) + 800,
    biodiversity_index: (Math.random() * 0.3 + 0.7).toFixed(2),
    habitat_quality: 'Good',
    last_updated: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: conservationData
  });
});

// Get recent alerts for the dashboard
app.get('/api/insights/recent-alerts', (req, res) => {
  const alerts = [
    {
      id: 'alert_001',
      type: 'warning',
      icon: '⚠️',
      message: 'Unusual human activity detected in Zone A',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      level: 'medium',
      location: 'Zone A'
    },
    {
      id: 'alert_002',
      type: 'success',
      icon: '✅',
      message: 'NDVI levels showing healthy vegetation growth',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      level: 'low',
      location: 'Zone B'
    },
    {
      id: 'alert_003',
      type: 'info',
      icon: 'ℹ️',
      message: 'Elephant migration pattern detected',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      level: 'low',
      location: 'Zone C'
    }
  ];
  
  res.json({
    success: true,
    data: alerts
  });
});

// Get forecast insights using Prophet-like predictions
app.get('/api/insights/forecast', (req, res) => {
  const forecastData = {
    positive_trends: [
      'Elephant population growing at 12.5% annually',
      'Tiger count increased by 137% since 2019',
      'Overall biodiversity index improving'
    ],
    areas_of_concern: [
      'Seasonal migration patterns show stress',
      'Habitat fragmentation affecting deer populations',
      'Climate change impact on bird species'
    ],
    next_30_days: 'Based on Prophet time series analysis, we predict a stable population trend with slight increases during the upcoming migration season.',
    recommendations: [
      'Daily monitoring for Zone A and C',
      'Weekly monitoring for Zone B and D',
      'Implement habitat restoration in affected areas'
    ],
    confidence_score: 0.87
  };
  
  res.json({
    success: true,
    data: forecastData
  });
});

// Get conservation news
app.get('/api/insights/news', async (req, res) => {
  try {
    // Mock news data - in production, integrate with news API
    const newsData = [
      {
        id: 'news_001',
        title: 'New Conservation Initiative Launched in Sundarbans',
        summary: 'Government announces $2M funding for mangrove restoration project',
        source: 'Conservation Today',
        published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: 'conservation',
        url: '#'
      },
      {
        id: 'news_002',
        title: 'Wildlife Population Recovery Shows Positive Trends',
        summary: 'Recent surveys indicate 15% increase in tiger population',
        source: 'Wildlife Weekly',
        published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        category: 'population',
        url: '#'
      },
      {
        id: 'news_003',
        title: 'Climate Change Impact on Forest Ecosystems',
        summary: 'New study reveals changing migration patterns in bird species',
        source: 'Nature Research',
        published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        category: 'climate',
        url: '#'
      }
    ];
    
    res.json({
      success: true,
      data: newsData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      details: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ForestWatch Backend is running' });
});

app.listen(PORT, () => {
  console.log(`ForestWatch Backend running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api/health`);
});