
import React, { useState, useEffect, useRef } from 'react'
import API from '../api'
import DetectionTable from '../components/DetectionTable'

export default function LiveMonitoring(){
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isLive, setIsLive] = useState(false)
  const [detections, setDetections] = useState([])
  const [alerts, setAlerts] = useState([])
  const [gpsCoords, setGpsCoords] = useState({ lat: 22.5, lon: 89.0 }) // Default Sundarbans
  const [summary, setSummary] = useState(null)
  const [animalCounts, setAnimalCounts] = useState({})
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const detectionInterval = useRef(null)

  // YouTube live stream channels for wildlife monitoring
  const [youtubeStreams, setYoutubeStreams] = useState([])
  const [currentStream, setCurrentStream] = useState(null)
  const [isLoadingStreams, setIsLoadingStreams] = useState(false)

  // Popular wildlife live stream channels
  const wildlifeChannels = [
     // Explore.org
    'UCRPhYF9rd5ov7DNKj99MNIg', // National Geographic
    'UC9X6gGKDv2yhMoofoeS7-Gg',
    'UC9X6gGKDv2yhMoofoeS7-Gg'// African Wildlife Foundation
    // Wildlife Conservation Society
  ]

  // Start live monitoring
  const startLiveMonitoring = () => {
    setIsLive(true)
    // Frame downloading disabled - no automatic detection
    console.log('Live monitoring started (frame downloading disabled)')
  }

  // Stop live monitoring
  const stopLiveMonitoring = () => {
    setIsLive(false)
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current)
    }
  }

  // Fetch YouTube live streams
  const fetchYouTubeStreams = async () => {
    setIsLoadingStreams(true)
    try {
      const response = await API.post('/youtube/live-streams', {
        channels: wildlifeChannels
      })
      
      if (response.data.success) {
        setYoutubeStreams(response.data.streams)
        if (response.data.streams.length > 0) {
          setCurrentStream(response.data.streams[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch YouTube streams:', error)
      // Fallback to sample streams
      setYoutubeStreams([
        {
          id: 'sample1',
          title: 'African Wildlife Live Stream',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&showinfo=0&rel=0',
          isLive: true
        },
        {
          id: 'sample2', 
          title: 'Forest Wildlife Cam',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&showinfo=0&rel=0',
          isLive: true
        },
        {
          id: 'sample3',
          title: 'Ocean Wildlife Stream',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&showinfo=0&rel=0',
          isLive: true
        }
      ])
    } finally {
      setIsLoadingStreams(false)
    }
  }

  // Switch to next stream
  const switchStream = () => {
    if (youtubeStreams.length > 0) {
      const currentIndex = youtubeStreams.findIndex(stream => stream.id === currentStream?.id)
      const nextIndex = (currentIndex + 1) % youtubeStreams.length
      setCurrentStream(youtubeStreams[nextIndex])
    }
  }

  // Run YOLO detection on current video frame
  const runYOLODetection = async () => {
    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      if (!video || !canvas) return
      
      const ctx = canvas.getContext('2d')
      
      // For YouTube streams, we need to capture from the iframe
      if (currentStream?.streamUrl) {
        // Create a temporary canvas to capture the iframe content
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        
        // Set canvas size
        tempCanvas.width = 640
        tempCanvas.height = 360
        
        // Draw a sample frame (in real implementation, you'd capture from iframe)
        tempCtx.fillStyle = '#000'
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
        tempCtx.fillStyle = '#fff'
        tempCtx.font = '20px Arial'
        tempCtx.fillText('YouTube Live Stream', 50, 100)
        tempCtx.fillText(`Stream: ${currentStream.title}`, 50, 130)
        tempCtx.fillText(`Time: ${new Date().toLocaleTimeString()}`, 50, 160)
        
        // Copy to main canvas
        canvas.width = tempCanvas.width
        canvas.height = tempCanvas.height
        ctx.drawImage(tempCanvas, 0, 0)
      } else {
        // Regular video element
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 360
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      }
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        const formData = new FormData()
        formData.append('image', blob, 'frame.jpg')
        formData.append('lat', gpsCoords.lat)
        formData.append('lon', gpsCoords.lon)
        formData.append('timestamp', new Date().toISOString())
        formData.append('streamId', currentStream?.id || 'unknown')
        
        try {
          const response = await API.post('/live/detect', formData)
          const detectionData = response.data
          
          // Update detections
          setDetections(detectionData.detections || [])
          
          // Draw bounding boxes on canvas
          drawBoundingBoxes(detectionData.detections || [])
          
          // Count animals
          countAnimals(detectionData.detections || [])
          
          // Check for anomalies and create alerts
          checkForAnomalies(detectionData.detections || [])
          
          // Update summary
          setSummary(detectionData.summary)
          
        } catch (error) {
          console.error('Detection failed:', error)
        }
      }, 'image/jpeg', 0.8)
      
    } catch (error) {
      console.error('YOLO detection error:', error)
    }
  }

  // Check for anomalies and create alerts
  const checkForAnomalies = (detections) => {
    const anomalies = ['person', 'firearm', 'fire', 'vehicle']
    const detectedAnomalies = detections.filter(det => 
      anomalies.includes(det.class.toLowerCase())
    )
    
    if (detectedAnomalies.length > 0) {
      const alertLevel = determineAlertLevel(detectedAnomalies)
      const alert = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        level: alertLevel,
        anomalies: detectedAnomalies,
        coordinates: gpsCoords,
        message: generateAlertMessage(alertLevel, detectedAnomalies)
      }
      
      setAlerts(prev => [alert, ...prev.slice(0, 9)]) // Keep last 10 alerts
      
      // Send alert to rangers
      sendRangerAlert(alert)
    }
  }

  // Determine alert level based on detected anomalies
  const determineAlertLevel = (anomalies) => {
    const highRisk = ['firearm', 'fire']
    const moderateRisk = ['person', 'vehicle']
    
    if (anomalies.some(a => highRisk.includes(a.class.toLowerCase()))) {
      return 'high'
    } else if (anomalies.some(a => moderateRisk.includes(a.class.toLowerCase()))) {
      return 'moderate'
    }
    return 'low'
  }

  // Generate alert message
  const generateAlertMessage = (level, anomalies) => {
    const anomalyList = anomalies.map(a => a.class).join(', ')
    const coords = `${gpsCoords.lat}, ${gpsCoords.lon}`
    
    switch (level) {
      case 'high':
        return `🚨 HIGH ALERT: ${anomalyList} detected at ${coords}. Immediate response required!`
      case 'moderate':
        return `⚠️ MODERATE ALERT: ${anomalyList} detected at ${coords}. Patrol recommended.`
      default:
        return `ℹ️ INFO: ${anomalyList} detected at ${coords}.`
    }
  }

  // Send alert to rangers
  const sendRangerAlert = async (alert) => {
    try {
      await API.post('/alerts/send', {
        alert,
        rangerLocation: gpsCoords,
        priority: alert.level
      })
      console.log('Alert sent to rangers:', alert.message)
    } catch (error) {
      console.error('Failed to send alert:', error)
    }
  }

  // Update GPS coordinates
  const updateGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.error('GPS error:', error)
        }
      )
    }
  }

  // Draw bounding boxes on canvas
  const drawBoundingBoxes = (detections) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size to match iframe
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    detections.forEach((detection, index) => {
      const { bbox, class: className, confidence } = detection;
      
      // Calculate position and size
      const x = (bbox.x / 640) * canvas.width;
      const y = (bbox.y / 300) * canvas.height;
      const width = (bbox.width / 640) * canvas.width;
      const height = (bbox.height / 300) * canvas.height;
      
      // Choose color based on class
      let color = '#00ff00'; // Green for animals
      if (['person', 'firearm', 'fire', 'vehicle'].includes(className.toLowerCase())) {
        color = '#ff0000'; // Red for threats
      } else if (['tiger', 'elephant', 'deer', 'bird'].includes(className.toLowerCase())) {
        color = '#00ff00'; // Green for animals
      } else {
        color = '#ffff00'; // Yellow for others
      }
      
      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label background
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 20, Math.max(120, className.length * 8), 20);
      
      // Draw label text
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(`${className} (${Math.round(confidence * 100)}%)`, x + 5, y - 5);
    });
  }

  // Count animals in detections
  const countAnimals = (detections) => {
    const animalClasses = ['tiger', 'elephant', 'deer', 'bird', 'animal', 'wildlife'];
    const counts = {};
    
    detections.forEach(detection => {
      const className = detection.class.toLowerCase();
      if (animalClasses.includes(className)) {
        counts[className] = (counts[className] || 0) + 1;
      }
    });
    
    setAnimalCounts(counts);
    return counts;
  }

  useEffect(() => {
    updateGPS()
    fetchYouTubeStreams()
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current)
      }
    }
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, system-ui' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>
        🎥 Live Wildlife Monitoring
      </h2>

      {/* Control Panel */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '20px', 
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <h4>Live Feed Controls</h4>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button 
              onClick={isLive ? stopLiveMonitoring : startLiveMonitoring}
              style={{
                padding: '8px 16px',
                backgroundColor: isLive ? '#e74c3c' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isLive ? '⏹️ Stop Live' : '▶️ Start Live'}
            </button>
            <button 
              onClick={switchStream}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Switch Stream
            </button>
            <button 
              onClick={fetchYouTubeStreams}
              disabled={isLoadingStreams}
              style={{
                padding: '8px 16px',
                backgroundColor: '#9b59b6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: isLoadingStreams ? 0.6 : 1
              }}
            >
              {isLoadingStreams ? '⏳ Loading...' : '🔄 Refresh Streams'}
            </button>
            <button 
              onClick={runYOLODetection}
              disabled={!currentStream}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentStream ? 'pointer' : 'not-allowed',
                opacity: currentStream ? 1 : 0.6
              }}
            >
              🎯 Manual Detection
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#666' }}>
            {currentStream ? `Stream: ${currentStream.title}` : 'No streams available'}
            <br />
            <span style={{ color: '#28a745' }}>✅ Frame downloading disabled - use Manual Detection button</span>
          </p>
        </div>

        <div>
          <h4>GPS Coordinates</h4>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="number"
              placeholder="Latitude"
              value={gpsCoords.lat}
              onChange={(e) => setGpsCoords(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
              style={{ padding: '4px', width: '100px' }}
            />
            <input
              type="number"
              placeholder="Longitude"
              value={gpsCoords.lon}
              onChange={(e) => setGpsCoords(prev => ({ ...prev, lon: parseFloat(e.target.value) }))}
              style={{ padding: '4px', width: '100px' }}
            />
          </div>
          <button 
            onClick={updateGPS}
            style={{
              padding: '4px 8px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📍 Get Current Location
          </button>
        </div>

        <div>
          <h4>Detection Status</h4>
          <div style={{ 
            padding: '8px',
            backgroundColor: isLive ? '#d5f4e6' : '#f8d7da',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {isLive ? '🟢 Live Detection Active' : '🔴 Detection Stopped'}
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Detections: {detections.length}
          </p>
        </div>
      </div>

      {/* Video Feed */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <h4>Live Video Feed</h4>
          <div style={{ position: 'relative', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
            {currentStream ? (
              <div style={{ position: 'relative' }}>
                <iframe
                  ref={videoRef}
                  src={currentStream.streamUrl}
                  width="100%"
                  height="300"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: '8px' }}
                />
                {/* Detection Overlay Canvas */}
                <canvas
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '300px',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}
                />
                {/* Detection Count Overlay */}
                {isLive && detections.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    zIndex: 20
                  }}>
                    🎯 Detections: {detections.length}
                    {Object.keys(animalCounts).length > 0 && (
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>
                        🦁 Animals: {Object.entries(animalCounts).map(([animal, count]) => `${animal}: ${count}`).join(', ')}
                      </div>
                    )}
                  </div>
                )}
                {/* Live Indicator */}
                {isLive && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0,123,255,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    zIndex: 20
                  }}>
                    🔵 LIVE MONITORING (Manual)
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                width: '100%',
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#333',
                color: 'white',
                fontSize: '18px'
              }}>
                {isLoadingStreams ? 'Loading streams...' : 'No streams available'}
              </div>
            )}
          </div>
        </div>

        <div>
          <h4>Live Summary</h4>
          {summary ? (
            <div style={{ 
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <p><strong>Status:</strong> {summary.status}</p>
              <p><strong>Anomalies:</strong> {summary.anomaly_count}</p>
              <p><strong>Confidence:</strong> {summary.confidence}%</p>
              <p><strong>Last Update:</strong> {new Date(summary.timestamp).toLocaleTimeString()}</p>
            </div>
          ) : (
            <div style={{ 
              padding: '12px',
              backgroundColor: '#e9ecef',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666'
            }}>
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>🚨 Recent Alerts</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: alert.level === 'high' ? '#f8d7da' : alert.level === 'moderate' ? '#fff3cd' : '#d1ecf1',
                  border: `1px solid ${alert.level === 'high' ? '#f5c6cb' : alert.level === 'moderate' ? '#ffeaa7' : '#bee5eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {alert.message}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detection Results */}
      {detections.length > 0 && (
        <div>
          <h4>Detection Results</h4>
          <DetectionTable rows={detections} />
        </div>
      )}
    </div>
  )
}
