# 🎥 Live Wildlife Monitoring System

## Overview
A real-time wildlife monitoring system with YOLO object detection, anomaly analysis, and automated ranger alerts.

## Features

### 🎬 Live Video Feed
- **Multiple Video Sources**: Switch between 4 wildlife video streams
- **Real-time Processing**: Continuous YOLO detection every 2 seconds
- **Video Switching**: Button to cycle through different video sources
- **Live Indicator**: Visual indicator when monitoring is active

### 🤖 YOLO Object Detection
- **Real-time Detection**: Processes video frames every 2 seconds
- **Bounding Boxes**: Draws detection boxes on video feed
- **Confidence Scores**: Shows detection confidence levels
- **Multiple Classes**: Detects person, animal, vehicle, fire, firearm, etc.

### 🚨 Anomaly Detection & Alerts
- **Anomaly Types**: 
  - **High Risk**: firearm, fire
  - **Moderate Risk**: person, vehicle
  - **Normal**: animal, tree, bird, deer
- **Alert Levels**:
  - **HIGH**: Immediate ranger response required
  - **MODERATE**: Patrol recommended
  - **LOW**: Information only

### 📍 GPS Integration
- **Real-time Coordinates**: Automatic GPS location detection
- **Manual Input**: Option to set custom coordinates
- **Location-based Alerts**: Alerts include exact GPS coordinates

### 📊 Live Dashboard
- **Detection Status**: Shows active/inactive monitoring
- **Live Summary**: Real-time analysis results
- **Alert History**: Recent alerts with timestamps
- **Detection Results**: Table of all detected objects

## API Endpoints

### Live Detection
```
POST /api/live/detect
```
**Body**: FormData with image, lat, lon, timestamp
**Response**: Detection results, anomalies, summary

### Send Alerts
```
POST /api/alerts/send
```
**Body**: { alert, rangerLocation, priority }
**Response**: Alert confirmation

### Get Alerts
```
GET /api/alerts
```
**Response**: List of recent alerts

## YOLO Model Integration

### Model File
- **Path**: `./models/yoloE.pt`
- **Format**: PyTorch model
- **Classes**: Custom trained for wildlife monitoring

### Detection Process
1. **Frame Capture**: Extract frame from video
2. **YOLO Processing**: Run object detection
3. **Anomaly Analysis**: Check for suspicious objects
4. **Alert Generation**: Create alerts based on findings
5. **Ranger Notification**: Send alerts to nearby rangers

## Alert System

### Alert Types
```javascript
// High Alert Examples
"🚨 HIGH ALERT: firearm detected at 22.5, 89.0. Immediate response required!"
"🚨 HIGH ALERT: fire detected at 12.05, 76.35. Immediate response required!"

// Moderate Alert Examples  
"⚠️ MODERATE ALERT: person detected at 22.6, 89.1. Patrol recommended."
"⚠️ MODERATE ALERT: vehicle detected at 12.08, 76.40. Patrol recommended."

// Low Alert Examples
"ℹ️ INFO: animal detected at 23.0, 88.8."
```

### Ranger Notification
- **Database Storage**: All alerts stored in SQLite
- **Console Logging**: Real-time alert display
- **GPS Coordinates**: Exact location for ranger response
- **Priority Levels**: High/Moderate/Low classification

## Setup Instructions

### 1. Add Your Videos
Place your wildlife videos in `public/videos/`:
- `wildlife1.mp4`
- `wildlife2.mp4` 
- `wildlife3.mp4`
- `wildlife4.mp4`

### 2. Add YOLO Model
Place your `yoloE.pt` model in `backend/models/`:
```bash
mkdir backend/models
# Copy your yoloE.pt file to backend/models/
```

### 3. Start the System
```bash
# Backend
cd backend
npm install
npm start

# Frontend  
npm run dev
```

## Usage

### 1. Access Live Monitoring
- Navigate to "Upload/Live" tab
- Click "▶️ Start Live" to begin monitoring
- Use "🔄 Switch Video" to change video source

### 2. Monitor Detections
- Watch real-time detection results
- View live summary panel
- Check alert notifications

### 3. Respond to Alerts
- High alerts require immediate response
- Moderate alerts suggest patrol
- All alerts include GPS coordinates

## Customization

### Video Sources
Update `wildlifeVideos` array in `src/pages/Upload.jsx`:
```javascript
const wildlifeVideos = [
  '/videos/your_video1.mp4',
  '/videos/your_video2.mp4',
  // Add more videos
];
```

### Detection Classes
Modify `possibleClasses` in `backend/yolo-integration.js`:
```javascript
const possibleClasses = ['person', 'animal', 'vehicle', 'fire', 'firearm', 'tiger', 'elephant'];
```

### Alert Thresholds
Update anomaly detection in `src/pages/Upload.jsx`:
```javascript
const highRisk = ['firearm', 'fire'];
const moderateRisk = ['person', 'vehicle'];
```

## Technical Details

### Video Processing
- **Canvas Capture**: Video frames drawn to HTML5 canvas
- **Blob Conversion**: Canvas converted to image blob
- **API Transmission**: Blob sent to backend for processing

### YOLO Integration
- **Model Loading**: PyTorch model loaded on startup
- **Fallback Mode**: Mock detection if model not found
- **Real-time Processing**: Continuous frame analysis

### Database Schema
```sql
-- Alerts table
CREATE TABLE alerts (
  id INTEGER PRIMARY KEY,
  alert_id TEXT UNIQUE,
  level TEXT,
  message TEXT,
  coordinates TEXT,
  timestamp TEXT,
  status TEXT
);
```

## Troubleshooting

### Common Issues
1. **Videos not playing**: Check file paths and formats
2. **YOLO not working**: Ensure model file exists
3. **GPS not working**: Check browser permissions
4. **Alerts not sending**: Check console logs

### Debug Mode
Enable detailed logging by checking browser console and backend terminal.

## Future Enhancements

- **SMS/Email Alerts**: Real ranger notification system
- **Mobile App**: Ranger mobile interface
- **Heat Maps**: Detection density visualization
- **Machine Learning**: Improved anomaly detection
- **Multi-camera**: Support for multiple camera feeds
