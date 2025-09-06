
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
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const detectionInterval = useRef(null)

  // Sample wildlife videos - replace with your actual video URLs
  const wildlifeVideos = [
    '/videos/wildlife1.mp4',
    '/videos/wildlife2.mp4', 
    '/videos/wildlife3.mp4',
    '/videos/wildlife4.mp4'
  ]

  // Start live monitoring
  const startLiveMonitoring = () => {
    setIsLive(true)
    // Start YOLO detection every 2 seconds
    detectionInterval.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        runYOLODetection()
      }
    }, 2000)
  }

  // Stop live monitoring
  const stopLiveMonitoring = () => {
    setIsLive(false)
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current)
    }
  }

  // Switch to next video
  const switchVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % wildlifeVideos.length)
  }

  // Run YOLO detection on current video frame
  const runYOLODetection = async () => {
    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext('2d')
      
      // Draw current video frame to canvas
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        const formData = new FormData()
        formData.append('image', blob, 'frame.jpg')
        formData.append('lat', gpsCoords.lat)
        formData.append('lon', gpsCoords.lon)
        formData.append('timestamp', new Date().toISOString())
        
        try {
          const response = await API.post('/live/detect', formData)
          const detectionData = response.data
          
          // Update detections
          setDetections(detectionData.detections || [])
          
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

  useEffect(() => {
    updateGPS()
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
              onClick={switchVideo}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Switch Video
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Video {currentVideoIndex + 1} of {wildlifeVideos.length}
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
            <video
              ref={videoRef}
              src={wildlifeVideos[currentVideoIndex]}
              autoPlay
              muted
              loop
              style={{ width: '100%', height: '300px', objectFit: 'cover' }}
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            {isLive && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                🔴 LIVE
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
