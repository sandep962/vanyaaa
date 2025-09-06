const fs = require('fs');
const path = require('path');

class RealYOLODetector {
  constructor(modelPath = './models/yoloE.pt') {
    this.modelPath = modelPath;
    this.isModelLoaded = false;
    this.model = null;
  }

  // Initialize YOLO model
  async loadModel() {
    try {
      // Check if model file exists
      if (!fs.existsSync(this.modelPath)) {
        console.log('❌ YOLO model not found at:', this.modelPath);
        console.log('📁 Available files in models directory:');
        const modelsDir = path.dirname(this.modelPath);
        if (fs.existsSync(modelsDir)) {
          const files = fs.readdirSync(modelsDir);
          files.forEach(file => console.log('  -', file));
        }
        return false;
      }

      console.log('✅ YOLO model found at:', this.modelPath);
      
      // For now, we'll use mock detection but with better animal classes
      // In a real implementation, you would load the actual YOLO model here
      // Example with PyTorch.js or similar:
      // const torch = require('@tensorflow/tfjs-node');
      // this.model = await torch.loadLayersModel(this.modelPath);
      
      this.isModelLoaded = true;
      console.log('✅ YOLO model loaded successfully (mock mode)');
      return true;
    } catch (error) {
      console.error('❌ Failed to load YOLO model:', error);
      return false;
    }
  }

  // Run detection on image - REAL YOLO ONLY
  async detect(imagePath) {
    try {
      if (!this.isModelLoaded) {
        console.log('❌ YOLO model not loaded, cannot perform detection');
        return [];
      }

      // Run actual YOLO detection
      const results = await this.runYOLOInference(imagePath);
      if (results && results.length > 0) {
        console.log(`🎯 Real YOLO detection: Found ${results.length} objects`);
        return this.formatResults(results);
      } else {
        console.log('🔍 Real YOLO detection: No objects found');
        return [];
      }
    } catch (error) {
      console.error('❌ YOLO detection error:', error);
      return [];
    }
  }

  // Run actual YOLO inference using Python script
  async runYOLOInference(imagePath) {
    const { spawn } = require('child_process');
    const path = require('path');
    
    console.log('🔍 Running YOLO inference on:', imagePath);
    
    return new Promise((resolve, reject) => {
      // Run Python YOLO inference script
      const pythonProcess = spawn('python', [
        path.join(__dirname, 'real_yolo_inference.py'),
        imagePath,
        this.modelPath,
        '0.5' // confidence threshold
      ]);
      
      let output = '';
      let errorOutput = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            if (result.success && result.detections) {
              console.log(`✅ YOLO inference successful: ${result.count} detections`);
              resolve(result.detections);
            } else {
              console.log('⚠️ YOLO inference returned no detections');
              resolve([]);
            }
          } catch (parseError) {
            console.log('⚠️ Failed to parse YOLO inference output:', parseError.message);
            resolve([]);
          }
        } else {
          console.log('⚠️ YOLO inference failed with code:', code);
          console.log('Error output:', errorOutput);
          resolve([]);
        }
      });
      
      pythonProcess.on('error', (error) => {
        console.log('⚠️ Failed to start YOLO inference process:', error.message);
        resolve([]);
      });
    });
  }

  // Mock detection function removed - using only real YOLO detection

  // Format YOLO results for API response
  formatResults(yoloResults) {
    return yoloResults.map((result, index) => ({
      id: `det_${Date.now()}_${index}`,
      class: result.class,
      confidence: result.confidence,
      bbox: {
        x: result.bbox.x,
        y: result.bbox.y,
        width: result.bbox.width,
        height: result.bbox.height
      },
      timestamp: new Date().toISOString()
    }));
  }

  // Analyze detections for anomalies
  analyzeAnomalies(detections) {
    const anomalies = ['person', 'firearm', 'fire', 'vehicle'];
    const detectedAnomalies = detections.filter(det => 
      anomalies.includes(det.class.toLowerCase())
    );

    return {
      anomalies: detectedAnomalies,
      count: detectedAnomalies.length,
      level: this.determineAlertLevel(detectedAnomalies)
    };
  }

  // Determine alert level based on detected anomalies
  determineAlertLevel(anomalies) {
    const highRisk = ['firearm', 'fire'];
    const moderateRisk = ['person', 'vehicle'];
    
    if (anomalies.some(a => highRisk.includes(a.class.toLowerCase()))) {
      return 'high';
    } else if (anomalies.some(a => moderateRisk.includes(a.class.toLowerCase()))) {
      return 'moderate';
    }
    return 'low';
  }

  // Create detection summary
  createSummary(detections, anomalies) {
    const animalClasses = ['tiger', 'elephant', 'deer', 'bird', 'wildlife', 'animal'];
    const animalDetections = detections.filter(det => 
      animalClasses.includes(det.class.toLowerCase())
    );
    
    return {
      status: anomalies.count > 0 ? 'Anomalies Detected' : 'Normal',
      anomaly_count: anomalies.count,
      total_detections: detections.length,
      animal_count: animalDetections.length,
      confidence: Math.round(
        detections.reduce((sum, det) => sum + det.confidence, 0) / detections.length * 100
      ) || 0,
      timestamp: new Date().toISOString(),
      alert_level: anomalies.level,
      animals_detected: animalDetections.map(det => det.class).join(', ')
    };
  }
}

module.exports = RealYOLODetector;
