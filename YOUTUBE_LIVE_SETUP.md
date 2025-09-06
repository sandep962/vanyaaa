# 🎥 YouTube Live Stream Integration

## Overview
Real-time wildlife monitoring using YouTube live streams with continuous YOLO object detection and anomaly analysis.

## Features

### 📺 YouTube Live Integration
- **Real-time Streams**: Fetches live YouTube streams from wildlife channels
- **Stream Switching**: Switch between multiple live streams
- **Auto-refresh**: Refresh available streams periodically
- **Fallback Mode**: Sample streams when API is unavailable

### 🤖 Continuous YOLO Detection
- **24/7 Monitoring**: Continuous object detection on live streams
- **Real-time Analysis**: Detects animals and anomalies every 2 seconds
- **Bounding Boxes**: Visual detection overlays on stream
- **Confidence Scoring**: Real-time confidence levels

### 🚨 Anomaly Detection
- **Animal Detection**: Tigers, elephants, deer, birds, etc.
- **Threat Detection**: Person, firearm, fire, vehicle
- **Alert System**: GPS-based ranger notifications
- **Live Dashboard**: Real-time monitoring interface

## Setup Instructions

### 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy your API key

### 2. Configure Backend

Update `backend/config.js`:
```javascript
YOUTUBE_API_KEY: 'YOUR_YOUTUBE_API_KEY_HERE'
```

Or set environment variable:
```bash
set YOUTUBE_API_KEY=your_api_key_here
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Start the System

```bash
# Backend
cd backend
npm start

# Frontend
npm run dev
```

## Wildlife Channel IDs

The system monitors these popular wildlife channels:

```javascript
const wildlifeChannels = [
  'UCzQUP1qoWDoEbmsQxvdjxgQ', // Explore.org
  'UCBqBZHKj8Qj4Qj4Qj4Qj4Qj4', // National Geographic
  'UCzQUP1qoWDoEbmsQxvdjxgQ', // African Wildlife Foundation
  'UCzQUP1qoWDoEbmsQxvdjxgQ'  // Wildlife Conservation Society
];
```

## API Endpoints

### Fetch Live Streams
```
POST /api/youtube/live-streams
```
**Body**: `{ "channels": ["channel_id1", "channel_id2"] }`
**Response**: Array of live streams with details

### Search Wildlife Streams
```
GET /api/youtube/search-wildlife
```
**Response**: Wildlife-related live streams

### Live Detection
```
POST /api/live/detect
```
**Body**: FormData with image, lat, lon, timestamp, streamId
**Response**: Detection results and anomalies

## Stream Data Structure

```javascript
{
  id: "video_id",
  title: "Live Wildlife Stream",
  description: "Stream description",
  thumbnail: "thumbnail_url",
  streamUrl: "https://www.youtube.com/embed/video_id?autoplay=1&mute=1",
  channelTitle: "Channel Name",
  publishedAt: "2024-01-01T00:00:00Z",
  isLive: true,
  viewCount: "1000",
  duration: "PT24H"
}
```

## YOLO Detection Process

### 1. Stream Capture
- YouTube iframe embedded in frontend
- Canvas element captures stream frames
- Frames sent to backend every 2 seconds

### 2. Object Detection
- YOLO model processes each frame
- Detects animals, people, vehicles, etc.
- Returns bounding boxes and confidence scores

### 3. Anomaly Analysis
- Analyzes detections for threats
- Generates alerts based on risk level
- Sends notifications to rangers

## Alert System

### Alert Levels
- **HIGH**: firearm, fire → Immediate response
- **MODERATE**: person, vehicle → Patrol recommended  
- **LOW**: animals, normal activity → Information only

### Alert Messages
```javascript
// High Alert
"🚨 HIGH ALERT: firearm detected at 22.5, 89.0. Immediate response required!"

// Moderate Alert
"⚠️ MODERATE ALERT: person detected at 12.05, 76.35. Patrol recommended."

// Low Alert
"ℹ️ INFO: tiger detected at 23.0, 88.8."
```

## Usage

### 1. Access Live Monitoring
- Navigate to "Upload/Live" tab
- System automatically fetches YouTube streams
- Click "▶️ Start Live" to begin monitoring

### 2. Stream Management
- Use "🔄 Switch Stream" to change video sources
- Use "🔄 Refresh Streams" to get new live streams
- Monitor current stream in the video feed

### 3. Detection Monitoring
- Watch real-time detection results
- View live summary panel
- Check alert notifications
- Monitor detection table

## Customization

### Add More Channels
Update `wildlifeChannels` in `src/pages/Upload.jsx`:
```javascript
const wildlifeChannels = [
  'YOUR_CHANNEL_ID_1',
  'YOUR_CHANNEL_ID_2',
  // Add more channels
];
```

### Modify Detection Classes
Update `possibleClasses` in `backend/yolo-integration.js`:
```javascript
const possibleClasses = [
  'person', 'animal', 'vehicle', 'fire', 'firearm', 
  'tiger', 'elephant', 'deer', 'bird', 'tree'
];
```

### Adjust Detection Frequency
Change detection interval in `src/pages/Upload.jsx`:
```javascript
// Every 2 seconds (2000ms)
detectionInterval.current = setInterval(() => {
  runYOLODetection()
}, 2000)
```

## Troubleshooting

### Common Issues

1. **No streams found**
   - Check YouTube API key
   - Verify channel IDs
   - Check if channels are live

2. **Detection not working**
   - Ensure YOLO model is loaded
   - Check browser console for errors
   - Verify backend is running

3. **Streams not playing**
   - Check iframe permissions
   - Verify stream URLs
   - Check browser autoplay policies

### Debug Mode
Enable detailed logging:
- Frontend: Check browser console
- Backend: Check terminal output
- API calls: Monitor network tab

## Performance Optimization

### Stream Quality
- Use lower quality streams for better performance
- Adjust iframe parameters for optimization
- Monitor CPU usage during detection

### Detection Frequency
- Reduce detection frequency for better performance
- Use frame sampling for high-frequency streams
- Implement detection queuing

## Security Considerations

### API Key Protection
- Never expose API keys in frontend code
- Use environment variables
- Implement rate limiting

### Stream Access
- Respect YouTube's terms of service
- Implement proper attribution
- Monitor API usage limits

## Future Enhancements

- **Multi-stream Monitoring**: Monitor multiple streams simultaneously
- **AI-powered Stream Selection**: Automatically select best streams
- **Mobile Notifications**: Push notifications for alerts
- **Stream Recording**: Record and analyze stream segments
- **Machine Learning**: Improve detection accuracy over time

## Support

For issues or questions:
1. Check the console logs
2. Verify API keys and permissions
3. Test with sample streams first
4. Monitor backend terminal output

